pub mod app_module;
pub mod commands;
pub mod events;
pub mod state;

use tauri::{AppHandle, Emitter, Manager};

use crate::state::AppState;

pub fn start_activity_publisher(app_handle: AppHandle) {
    let activity_state_publisher = app_handle
        .state::<AppState>()
        .activity
        .activity_state_publisher
        .clone();

    activity_state_publisher.clone().start();

    activity_state_publisher.subscribe({
        let app_handle = app_handle.clone();
        move |event| {
            let _ = app_handle.emit(events::ACTIVITY_STATE_EVENT, event);
        }
    });
}
