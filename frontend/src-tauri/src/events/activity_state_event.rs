use application::activity::ActivityStateEventDto;
use chrono::NaiveDate;
use tauri::{AppHandle, Emitter, Manager};

use crate::state::AppState;

pub const ACTIVITY_STATE_EVENT: &str = "activity_state_event";

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
                    let _ = app.emit(ACTIVITY_STATE_EVENT, event);
                }
            });
        }
    });
}

#[allow(dead_code)]
fn __typegen_activity_events(app: &AppHandle) {
    let _ = app.emit(
        "activity_state_event",
        ActivityStateEventDto {
            date: NaiveDate::default(),
            active_duration_seconds: None,
        },
    );
}
