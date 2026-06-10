mod api_key;

use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// アプリ終了時にサイドカーを確実に停止するため、子プロセスハンドルを保持する
struct SidecarState(Mutex<Option<CommandChild>>);

/// サイドカーを停止する（HTTP shutdown → プロセス kill の二段構え）
fn kill_sidecar(state: &SidecarState) {
    // 1. HTTP で正常終了を要求（PyInstaller内部プロセスも確実に停止）
    let _ = std::thread::Builder::new()
        .name("sidecar-shutdown".into())
        .spawn(|| {
            let _ = TcpStream::connect_timeout(
                &"127.0.0.1:8765".parse().unwrap(),
                Duration::from_secs(1),
            )
            .and_then(|mut stream| {
                stream.write_all(b"POST /shutdown HTTP/1.1\r\nHost: 127.0.0.1:8765\r\nContent-Length: 0\r\n\r\n")
            });
        });

    // 2. プロセスハンドル経由で強制終了（フォールバック）
    if let Some(child) = state.0.lock().unwrap().take() {
        let _ = child.kill();
    }
}

/// 127.0.0.1:8765 がすでにリッスン中か（dev 環境で uvicorn が手動起動済みの場合）。
fn sidecar_already_running() -> bool {
    TcpStream::connect_timeout(
        &"127.0.0.1:8765".parse().unwrap(),
        Duration::from_millis(200),
    )
    .is_ok()
}

/// サイドカーを起動。keyring から API キーを取得して環境変数として注入する。
/// すでにポート 8765 が応答している場合は spawn をスキップ（dev で uvicorn 手動起動した場合）。
fn spawn_sidecar(app: &AppHandle) -> Result<(), String> {
    if sidecar_already_running() {
        println!("Sidecar already running on port 8765 — skipping spawn");
        return Ok(());
    }

    let api_key = api_key::get_api_key().unwrap_or_else(|e| {
        eprintln!("Failed to read API key from keyring: {e}");
        None
    });

    let mut command = app
        .shell()
        .sidecar("sidecar")
        .map_err(|e| format!("Sidecar not found: {e}. Start it manually with: cd sidecar && uvicorn main:app --port 8765"))?;

    if let Some(key) = api_key {
        command = command.env("ANTHROPIC_API_KEY", key);
    }

    let (_rx, child) = command
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {e}"))?;

    println!("Sidecar started successfully");
    let state = app.state::<SidecarState>();
    *state.0.lock().unwrap() = Some(child);
    Ok(())
}

/// /internal/refresh-api-key に API キーを POST し、サイドカーの環境変数を更新する。
/// 空文字列を渡すとサイドカー側で環境変数が削除される。
fn http_post_refresh_key(key: &str) -> Result<(), String> {
    let body = format!("{{\"api_key\":{}}}", serde_json::to_string(key).unwrap());
    let request = format!(
        "POST /settings/internal/refresh-api-key HTTP/1.1\r\n\
         Host: 127.0.0.1:8765\r\n\
         Content-Type: application/json\r\n\
         Content-Length: {}\r\n\
         Connection: close\r\n\
         \r\n\
         {}",
        body.len(),
        body
    );

    let mut stream = TcpStream::connect_timeout(
        &"127.0.0.1:8765".parse().unwrap(),
        Duration::from_secs(2),
    )
    .map_err(|e| format!("connect sidecar failed: {e}"))?;
    stream
        .set_read_timeout(Some(Duration::from_secs(3)))
        .map_err(|e| format!("set read timeout failed: {e}"))?;
    stream
        .write_all(request.as_bytes())
        .map_err(|e| format!("send refresh failed: {e}"))?;

    let mut response = String::new();
    stream
        .read_to_string(&mut response)
        .map_err(|e| format!("read refresh response failed: {e}"))?;

    if !response.starts_with("HTTP/1.1 200") {
        let first_line = response.lines().next().unwrap_or("(empty)");
        return Err(format!("refresh endpoint returned non-200: {first_line}"));
    }
    Ok(())
}

/// 127.0.0.1:8765/health が応答するまで待機（タイムアウト指定）。
fn wait_for_sidecar_ready(timeout: Duration) -> Result<(), String> {
    let deadline = Instant::now() + timeout;
    while Instant::now() < deadline {
        if TcpStream::connect_timeout(
            &"127.0.0.1:8765".parse().unwrap(),
            Duration::from_millis(300),
        )
        .is_ok()
        {
            return Ok(());
        }
        std::thread::sleep(Duration::from_millis(500));
    }
    Err("Sidecar did not become ready within timeout".to_string())
}

// --- Tauri commands (frontend ↔ keyring) ---

#[tauri::command]
fn keyring_has_api_key() -> Result<bool, String> {
    api_key::has_api_key()
}

#[tauri::command]
fn keyring_set_api_key(key: String) -> Result<(), String> {
    api_key::set_api_key(&key)?;
    // 永続化先は keyring。サイドカーには HTTP 経由で in-memory 反映する。
    // サイドカーが起動していない場合はエラーを伏せる（次回起動時の sync で反映される）。
    if let Err(e) = http_post_refresh_key(&key) {
        eprintln!("Refresh sidecar after set failed (will sync on next sidecar ready): {e}");
    }
    Ok(())
}

#[tauri::command]
fn keyring_delete_api_key() -> Result<(), String> {
    api_key::delete_api_key()?;
    if let Err(e) = http_post_refresh_key("") {
        eprintln!("Refresh sidecar after delete failed: {e}");
    }
    Ok(())
}

/// フロントエンドがサイドカー ready を検知した後に呼ばれる同期コマンド。
/// keyring の現在値をサイドカーに in-memory プッシュする。
/// dev モード（uvicorn 手動起動）でも、production（環境変数注入）でも冪等に動作。
#[tauri::command]
fn keyring_sync_to_sidecar() -> Result<(), String> {
    let key = api_key::get_api_key()?.unwrap_or_default();
    http_post_refresh_key(&key)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(SidecarState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            keyring_has_api_key,
            keyring_set_api_key,
            keyring_delete_api_key,
            keyring_sync_to_sidecar,
        ])
        .setup(|app| {
            // 旧バージョンの config.json 平文 API キーを keyring へ移行
            match api_key::migrate_legacy_key() {
                Ok(true) => println!("Migrated legacy plaintext API key to OS keychain"),
                Ok(false) => {}
                Err(e) => eprintln!("API key migration failed: {e}"),
            }

            // サイドカー起動（開発時はuvicorn手動起動でもOK）
            if let Err(e) = spawn_sidecar(&app.handle()) {
                eprintln!("{e}");
            }

            // バックグラウンドでサイドカー ready を待ち、keyring → サイドカーへ同期
            // production: 環境変数注入と二重で反映されるが冪等
            // dev: 手動 uvicorn 起動を検知して in-memory に反映
            std::thread::Builder::new()
                .name("api-key-initial-sync".into())
                .spawn(|| {
                    if wait_for_sidecar_ready(Duration::from_secs(60)).is_ok() {
                        match api_key::get_api_key() {
                            Ok(Some(key)) => {
                                if let Err(e) = http_post_refresh_key(&key) {
                                    eprintln!("Initial API key sync failed: {e}");
                                } else {
                                    println!("API key synced to sidecar");
                                }
                            }
                            Ok(None) => {}
                            Err(e) => eprintln!("keyring read failed during initial sync: {e}"),
                        }
                    }
                })
                .ok();

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if matches!(event, tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit) {
                kill_sidecar(app.state::<SidecarState>().inner());
            }
        });
}
