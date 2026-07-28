use chrono::NaiveDate;
use domain::entity::ActivityId;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveCompletedActivityIdentityDto {
    pub activity_id: Option<ActivityId>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteCompletedActivityIdentityDto {
    pub date: NaiveDate,
    pub activity_id: ActivityId,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetActivityStateIdentityDto {
    pub date: NaiveDate,
}
