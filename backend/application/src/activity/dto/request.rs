use chrono::{DateTime, Utc};
use domain::entity::CategoryId;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartActivityRequestDto {
    pub category_id: CategoryId,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveActiveActivityRequestDto {
    pub category_id: CategoryId,
    pub description: Option<String>,
    pub started_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveCompletedActivityRequestDto {
    pub category_id: CategoryId,
    pub description: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: DateTime<Utc>,
}
