use tauri::{Manager, Runtime};

use crate::state::AppState;

pub fn build_app_state<R: Runtime>(app: &tauri::App<R>) -> Result<AppState, anyhow::Error> {
    let app_config_dir = app.path().app_config_dir()?;
    std::fs::create_dir_all(&app_config_dir)?;

    let database_path = app_config_dir.join("db.sqlite");

    // create database if not exists
    let mut database_path_str = database_path.to_string_lossy().to_string();
    if cfg!(windows) {
        database_path_str = database_path_str.replace('\\', "/");
    }
    let database_url = format!("sqlite://{}?mode=rwc", database_path_str);

    tauri::async_runtime::block_on(AppState::new(database_url))
}
