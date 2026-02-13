use tauri::Manager;

pub mod commands;
pub mod events;
pub mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = tauri::async_runtime::block_on(state::AppState::new(app))?;
            app.manage(state);
            events::start_activity_publisher(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::activity_commands::get_activity_state,
            commands::activity_commands::start_activity,
            commands::activity_commands::stop_activity,
            commands::activity_commands::cancel_active_activity,
            commands::activity_commands::save_active_activity,
            commands::activity_commands::save_completed_activity,
            commands::activity_commands::delete_completed_activity,
            commands::category_commands::get_all_categories,
            commands::category_commands::create_category,
            commands::category_commands::rename_category,
            commands::category_commands::delete_category,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> Result<String, String> {
    if name.trim().is_empty() {
        Err("Name cannot be empty.".into())
    } else {
        Ok(format!("Hello, {}! You've been greeted from Rust!", name))
    }
}
