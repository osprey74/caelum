use std::sync::Mutex;
use tauri::Manager;
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
            // ブロッキングHTTPリクエスト（タイムアウト1秒）
            let _ = std::net::TcpStream::connect_timeout(
                &"127.0.0.1:8765".parse().unwrap(),
                std::time::Duration::from_secs(1),
            )
            .and_then(|mut stream| {
                use std::io::Write;
                stream.write_all(b"POST /shutdown HTTP/1.1\r\nHost: 127.0.0.1:8765\r\nContent-Length: 0\r\n\r\n")
            });
        });

    // 2. プロセスハンドル経由で強制終了（フォールバック）
    if let Some(child) = state.0.lock().unwrap().take() {
        let _ = child.kill();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            // サイドカー起動（開発時はuvicorn手動起動でもOK）
            match app.shell().sidecar("sidecar") {
                Ok(sidecar_command) => match sidecar_command.spawn() {
                    Ok((_rx, child)) => {
                        println!("Sidecar started successfully");
                        let state = app.state::<SidecarState>();
                        *state.0.lock().unwrap() = Some(child);
                    }
                    Err(e) => {
                        eprintln!("Failed to spawn sidecar: {e}. Start it manually with: cd sidecar && uvicorn main:app --port 8765");
                    }
                },
                Err(e) => {
                    eprintln!("Sidecar not found: {e}. Start it manually with: cd sidecar && uvicorn main:app --port 8765");
                }
            }
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
