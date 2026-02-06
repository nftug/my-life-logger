// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> Result<String, String> {
    if name.trim().is_empty() {
        Err("Name cannot be empty.".into())
    } else {
        Ok(format!("Hello, {}! You've been greeted from Rust!", name))
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = my_life_logger_lib::app_module::build_app_state(app)?;
            app.manage(state);
            my_life_logger_lib::start_activity_publisher(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            my_life_logger_lib::commands::activity_commands::get_activity_state,
            my_life_logger_lib::commands::activity_commands::start_activity,
            my_life_logger_lib::commands::activity_commands::stop_activity,
            my_life_logger_lib::commands::activity_commands::cancel_active_activity,
            my_life_logger_lib::commands::activity_commands::save_active_activity,
            my_life_logger_lib::commands::activity_commands::save_completed_activity,
            my_life_logger_lib::commands::activity_commands::delete_completed_activity
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
