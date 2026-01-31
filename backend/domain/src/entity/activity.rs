use chrono::{DateTime, Utc};

use crate::{
    audit::audit_context::AuditContext,
    define_id,
    entity::category::CategoryId,
    shared::{entity_id::EntityIdTrait, errors::DomainError},
};

define_id!(ActivityId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Activity {
    id: ActivityId,
    category_id: CategoryId,
    description: String,
    started_at: DateTime<Utc>,
    ended_at: Option<DateTime<Utc>>,
}

impl Activity {
    pub fn id(&self) -> ActivityId {
        self.id
    }
    pub fn category_id(&self) -> CategoryId {
        self.category_id
    }
    pub fn description(&self) -> &str {
        &self.description
    }
    pub fn started_at(&self) -> DateTime<Utc> {
        self.started_at
    }
    pub fn ended_at(&self) -> Option<DateTime<Utc>> {
        self.ended_at
    }

    pub fn hydrate(
        id: ActivityId,
        category_id: CategoryId,
        description: String,
        started_at: DateTime<Utc>,
        ended_at: Option<DateTime<Utc>>,
    ) -> Self {
        Self {
            id,
            category_id,
            description,
            started_at,
            ended_at,
        }
    }

    pub fn new(ctx: &AuditContext, category_id: CategoryId, description: String) -> Self {
        Self {
            id: ActivityId::new(),
            category_id,
            description,
            started_at: ctx.now,
            ended_at: None,
        }
    }

    pub fn stop(&mut self, ctx: &AuditContext) -> Result<(), DomainError> {
        if ctx.now < self.started_at {
            return Err(DomainError::InvalidTimeRange);
        }
        if self.ended_at.is_some() {
            return Err(DomainError::AlreadyStopped);
        }

        self.ended_at = Some(ctx.now);
        Ok(())
    }

    pub fn edit(
        &mut self,
        new_category_id: CategoryId,
        new_description: String,
        new_started_at: DateTime<Utc>,
        new_ended_at: Option<DateTime<Utc>>,
    ) -> Result<(), DomainError> {
        if let Some(ended_at) = new_ended_at
            && ended_at < new_started_at
        {
            return Err(DomainError::InvalidTimeRange);
        }

        self.started_at = new_started_at;
        self.ended_at = new_ended_at;
        self.category_id = new_category_id;
        self.description = new_description;
        Ok(())
    }

    pub fn is_active(&self) -> bool {
        self.ended_at.is_none()
    }

    pub fn duration_seconds(&self, ctx: &AuditContext) -> i64 {
        let end_time = self.ended_at.unwrap_or(ctx.now);
        (end_time - self.started_at).num_seconds()
    }

    pub fn overlaps_with(&self, ctx: &AuditContext, other: &Activity) -> bool {
        let self_ended_at = self.ended_at.unwrap_or(ctx.now);
        let other_ended_at = other.ended_at.unwrap_or(ctx.now);
        !(self_ended_at <= other.started_at || self.started_at >= other_ended_at)
    }
}
