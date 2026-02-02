use domain::entity::CategoryId;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameCategoryIdentityDto {
    pub category_id: CategoryId,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteCategoryIdentityDto {
    pub category_id: CategoryId,
}
