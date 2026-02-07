pub mod app_module;
pub mod commands;
pub mod events;
pub mod state;

use tauri::{AppHandle, Emitter, Manager};

use crate::state::AppState;

pub fn start_activity_publisher(app: &AppHandle) {
    tauri::async_runtime::spawn({
        let app = app.clone();
        async move {
            let activity_state_publisher = app
                .state::<AppState>()
                .activity
                .activity_state_publisher
                .start();

            activity_state_publisher.subscribe({
                let app = app.clone();
                move |event| {
                    let _ = app.emit(events::ACTIVITY_STATE_EVENT, event);
                }
            });
        }
    });
}

#[allow(dead_code)]
fn __typegen_activity_events(app: &AppHandle) {
    let _ = app.emit(
        crate::events::ACTIVITY_STATE_EVENT,
        Option::<application::activity::ActivityStateEventDto>::None,
    );
}
