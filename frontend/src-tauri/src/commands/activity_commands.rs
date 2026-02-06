use tauri::State;

use application::activity::{
    ActivityStateResponseDto, DeleteCompletedActivityIdentityDto, GetActivityStateIdentityDto,
    SaveActiveActivityRequestDto, SaveCompletedActivityIdentityDto,
    SaveCompletedActivityRequestDto, StartActivityRequestDto,
};

use crate::state::AppState;

#[tauri::command]
pub async fn get_activity_state(
    state: State<'_, AppState>,
    identity: GetActivityStateIdentityDto,
) -> Result<ActivityStateResponseDto, String> {
    state
        .activity
        .get_activity_state
        .handle(identity)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn start_activity(
    state: State<'_, AppState>,
    request: StartActivityRequestDto,
) -> Result<(), String> {
    state
        .activity
        .start_activity
        .handle(request)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn stop_activity(state: State<'_, AppState>) -> Result<(), String> {
    state
        .activity
        .stop_activity
        .handle()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn cancel_active_activity(state: State<'_, AppState>) -> Result<(), String> {
    state
        .activity
        .cancel_active_activity
        .handle()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn save_active_activity(
    state: State<'_, AppState>,
    request: SaveActiveActivityRequestDto,
) -> Result<(), String> {
    state
        .activity
        .save_active_activity
        .handle(request)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn save_completed_activity(
    state: State<'_, AppState>,
    identity: SaveCompletedActivityIdentityDto,
    request: SaveCompletedActivityRequestDto,
) -> Result<(), String> {
    state
        .activity
        .save_completed_activity
        .handle(identity, request)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_completed_activity(
    state: State<'_, AppState>,
    identity: DeleteCompletedActivityIdentityDto,
) -> Result<(), String> {
    state
        .activity
        .delete_completed_activity
        .handle(identity)
        .await
        .map_err(|err| err.to_string())
}
