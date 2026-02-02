use chrono::{DateTime, NaiveDate, Utc};
use domain::{
    aggregate::ActivityState,
    audit::AuditContext,
    entity::{Activity, ActivityId},
};
use serde::Serialize;

use crate::category::CategoryResponseDto;
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityResponseDto {
    pub id: ActivityId,
    pub date: NaiveDate,
    pub category: CategoryResponseDto,
    pub description: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub duration_seconds: i64,
}

impl ActivityResponseDto {
    pub fn from_domain(ctx: &AuditContext, activity: &Activity) -> ActivityResponseDto {
        ActivityResponseDto {
            id: activity.id(),
            date: activity.date(),
            category: activity.category().into(),
            description: activity.description().map(|s| s.to_string()),
            started_at: activity.started_at(),
            ended_at: activity.ended_at(),
            duration_seconds: activity.duration_seconds(ctx),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityStateResponseDto {
    pub date: NaiveDate,
    pub active_activity: Option<ActivityResponseDto>,
    pub completed_activities: Vec<ActivityResponseDto>,
}

impl ActivityStateResponseDto {
    pub fn from_domain(
        ctx: &AuditContext,
        activity_state: &ActivityState,
    ) -> ActivityStateResponseDto {
        ActivityStateResponseDto {
            date: activity_state.date(),
            active_activity: activity_state
                .active()
                .map(|a| ActivityResponseDto::from_domain(ctx, a)),
            completed_activities: activity_state
                .completed()
                .map(|a| ActivityResponseDto::from_domain(ctx, a))
                .collect(),
        }
    }

    pub fn default(date: NaiveDate) -> Self {
        ActivityStateResponseDto {
            date,
            active_activity: None,
            completed_activities: vec![],
        }
    }
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityStateEventDto {
    pub date: NaiveDate,
    pub active_duration_seconds: Option<i64>,
}

impl ActivityStateEventDto {
    pub fn from_domain(ctx: &AuditContext, activity_state: &ActivityState) -> Self {
        let active_duration_seconds = activity_state.active().map(|a| a.duration_seconds(ctx));

        ActivityStateEventDto {
            date: activity_state.date(),
            active_duration_seconds,
        }
    }
}
