use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // サイドカー起動（開発時はuvicorn手動起動でもOK）
            match app.shell().sidecar("sidecar") {
                Ok(sidecar_command) => match sidecar_command.spawn() {
                    Ok((_rx, _child)) => {
                        println!("Sidecar started successfully");
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
