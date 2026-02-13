use application::{
    category::{
        CategoryResponseDto, CreateCategoryRequestDto, DeleteCategoryIdentityDto,
        RenameCategoryIdentityDto, RenameCategoryRequestDto,
    },
    shared::EntityCreationDTO,
};
use tauri::State;

use crate::state::AppState;

#[tauri::command]
pub async fn get_all_categories(
    state: State<'_, AppState>,
) -> Result<Vec<CategoryResponseDto>, String> {
    state
        .category
        .get_all_categories
        .handle()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn create_category(
    state: State<'_, AppState>,
    request: CreateCategoryRequestDto,
) -> Result<EntityCreationDTO, String> {
    state
        .category
        .create_category
        .handle(request)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn rename_category(
    state: State<'_, AppState>,
    identity: RenameCategoryIdentityDto,
    request: RenameCategoryRequestDto,
) -> Result<(), String> {
    state
        .category
        .rename_category
        .handle(identity, request)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn delete_category(
    state: State<'_, AppState>,
    identity: DeleteCategoryIdentityDto,
) -> Result<(), String> {
    state
        .category
        .delete_category
        .handle(identity)
        .await
        .map_err(|err| err.to_string())
}
