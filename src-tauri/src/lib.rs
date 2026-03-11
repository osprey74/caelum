use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// アプリ終了時にサイドカーを確実に停止するため、子プロセスハンドルを保持する
struct SidecarState(Mutex<Option<CommandChild>>);

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
                        // 子プロセスハンドルを保持（アプリ終了時にkill）
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
            if let tauri::RunEvent::ExitRequested { .. } = event {
                // アプリ終了時にサイドカープロセスを停止
                let child = app.state::<SidecarState>().0.lock().unwrap().take();
                if let Some(child) = child {
                    let _ = child.kill();
                    println!("Sidecar process terminated");
                }
            }
        });
}
