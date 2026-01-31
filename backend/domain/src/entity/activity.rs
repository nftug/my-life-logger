use chrono::{DateTime, Utc};

use crate::{
    audit::audit_context::AuditContext,
    define_id,
    entity::category::CategoryId,
    shared::{entity_id::EntityIdTrait, errors::DomainError},
    values::time_range::TimeRange,
};

define_id!(ActivityId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Activity {
    id: ActivityId,
    category_id: CategoryId,
    description: Option<String>,
    time_range: TimeRange,
}

impl Activity {
    pub fn id(&self) -> ActivityId {
        self.id
    }
    pub fn category_id(&self) -> CategoryId {
        self.category_id
    }
    pub fn description(&self) -> Option<&str> {
        self.description.as_deref()
    }
    pub fn started_at(&self) -> DateTime<Utc> {
        self.time_range.started_at()
    }
    pub fn ended_at(&self) -> Option<DateTime<Utc>> {
        self.time_range.ended_at()
    }

    pub fn hydrate(
        id: ActivityId,
        category_id: CategoryId,
        description: Option<String>,
        time_range: TimeRange,
    ) -> Self {
        Self {
            id,
            category_id,
            description,
            time_range,
        }
    }

    pub fn new(
        category_id: CategoryId,
        description: Option<String>,
        time_range: TimeRange,
    ) -> Self {
        Self {
            id: ActivityId::new(),
            category_id,
            description,
            time_range,
        }
    }

    pub fn stop(&mut self, ctx: &AuditContext) -> Result<(), DomainError> {
        if self.is_completed() {
            return Err(DomainError::AlreadyStopped);
        }

        self.time_range = TimeRange::try_new(self.time_range.started_at(), Some(ctx.now))?;
        Ok(())
    }

    pub fn edit(
        &mut self,
        new_category_id: CategoryId,
        new_description: Option<String>,
        new_time_range: TimeRange,
    ) {
        self.time_range = new_time_range;
        self.category_id = new_category_id;
        self.description = new_description;
    }

    pub fn is_active(&self) -> bool {
        self.time_range.is_active()
    }

    pub fn is_completed(&self) -> bool {
        self.time_range.is_completed()
    }

    pub fn duration_seconds(&self, ctx: &AuditContext) -> i64 {
        let end_time = self.time_range.ended_at().unwrap_or(ctx.now);
        (end_time - self.time_range.started_at()).num_seconds()
    }

    pub fn overlaps_with(&self, ctx: &AuditContext, other: &Activity) -> bool {
        let self_ended_at = self.time_range.ended_at().unwrap_or(ctx.now);
        let other_ended_at = other.time_range.ended_at().unwrap_or(ctx.now);
        !(self_ended_at <= other.time_range.started_at()
            || self.time_range.started_at() >= other_ended_at)
    }
}
