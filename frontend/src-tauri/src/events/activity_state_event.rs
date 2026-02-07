use application::activity::ActivityStateEventDto;
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
                move |event| emit_activity_state_event(&app, event)
            });
        }
    });
}

fn emit_activity_state_event(app: &AppHandle, payload: ActivityStateEventDto) {
    let _ = app.emit("activity_state_event", ActivityStateEventDto { ..payload });
}
