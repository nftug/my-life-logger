use chrono::{DateTime, NaiveDate, Utc};

use crate::{
    audit::AuditContext,
    define_id,
    entity::category::CategoryId,
    shared::{EntityIdTrait, errors::DomainError},
    values::TimeRange,
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
    pub fn is_active(&self) -> bool {
        self.time_range.is_active()
    }
    pub fn is_completed(&self) -> bool {
        self.time_range.is_completed()
    }
    pub fn duration_seconds(&self, ended_at_filler: DateTime<Utc>) -> i64 {
        self.time_range.duration_seconds(ended_at_filler)
    }
    pub fn overlaps_with(&self, other: &Activity, ended_at_filler: DateTime<Utc>) -> bool {
        self.id != other.id
            && self
                .time_range
                .overlaps_with(&other.time_range, ended_at_filler)
    }
    pub fn is_in_date(&self, ctx: &AuditContext, date: NaiveDate) -> bool {
        self.time_range.is_in_date(ctx, date)
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
        started_at: DateTime<Utc>,
        ended_at: Option<DateTime<Utc>>,
    ) -> Self {
        Self {
            id,
            category_id,
            description,
            time_range: TimeRange::hydrate(started_at, ended_at),
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

        self.time_range = TimeRange::try_new_completed(self.time_range.started_at(), ctx.now())?;
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
}
