use chrono::{TimeZone, Utc};
use domain::{
    audit::AuditContext,
    entity::Activity,
    shared::errors::PersistenceError,
    values::{CategoryReference, TimeRange},
};
use sea_orm::ActiveValue::Set;

use crate::database::entity::{activities, categories};

pub struct ActivityMapper;

impl ActivityMapper {
    pub fn to_domain(
        ctx: &AuditContext,
        model: activities::Model,
        category: categories::Model,
    ) -> Result<Activity, PersistenceError> {
        let started_at = Utc.from_utc_datetime(&model.started_at);
        let ended_at = model
            .ended_at
            .map(|ended_at| Utc.from_utc_datetime(&ended_at));
        let time_range = TimeRange::hydrate(started_at, ended_at);
        let category = CategoryReference::new(model.category_id.into(), category.name);

        Activity::hydrate(
            ctx,
            model.id.into(),
            category,
            model.description,
            time_range,
            model.date,
        )
    }

    pub fn to_active_model(activity: &Activity) -> activities::ActiveModel {
        activities::ActiveModel {
            id: Set(activity.id().into()),
            category_id: Set(activity.category_id().into()),
            description: Set(activity.description().map(|s| s.to_string())),
            started_at: Set(activity.started_at().naive_utc()),
            ended_at: Set(activity.ended_at().map(|ended_at| ended_at.naive_utc())),
            date: Set(activity.date()),
        }
    }
}
