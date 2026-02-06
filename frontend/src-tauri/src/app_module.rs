use tauri::{Manager, Runtime};

use crate::state::AppState;

pub fn build_app_state<R: Runtime>(app: &tauri::App<R>) -> Result<AppState, anyhow::Error> {
    let database_path = app.path().app_config_dir()?.join("db.sqlite");
    println!("Database path: {}", database_path.to_string_lossy());

    // create database if not exists
    let database_url = format!("sqlite:/{}?mode=rwc", database_path.to_string_lossy());

    tauri::async_runtime::block_on(AppState::new(database_url))
}
