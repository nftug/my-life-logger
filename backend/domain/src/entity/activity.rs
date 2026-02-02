use chrono::{DateTime, NaiveDate, Utc};

use crate::{
    audit::AuditContext,
    define_id,
    entity::CategoryId,
    shared::{
        EntityIdTrait,
        errors::{DomainError, PersistenceError},
    },
    values::{CategoryReference, TimeRange},
};

define_id!(ActivityId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Activity {
    id: ActivityId,
    category: CategoryReference,
    description: Option<String>,
    time_range: TimeRange,
    date: NaiveDate,
}

impl Activity {
    pub fn id(&self) -> ActivityId {
        self.id
    }
    pub fn category(&self) -> &CategoryReference {
        &self.category
    }
    pub fn category_id(&self) -> CategoryId {
        self.category.category_id()
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
    pub fn date(&self) -> NaiveDate {
        self.date
    }
    pub fn started_at(&self) -> DateTime<Utc> {
        self.time_range.started_at()
    }
    pub fn ended_at(&self) -> Option<DateTime<Utc>> {
        self.time_range.ended_at()
    }

    pub fn duration_seconds(&self, ctx: &AuditContext) -> i64 {
        self.time_range.duration_seconds(self.ended_at_filler(ctx))
    }
    pub fn overlaps_with(&self, ctx: &AuditContext, other: &Activity) -> bool {
        self.id != other.id
            && self
                .time_range
                .overlaps_with(&other.time_range, self.ended_at_filler(ctx))
    }

    pub fn hydrate(
        ctx: &AuditContext,
        id: ActivityId,
        category: CategoryReference,
        description: Option<String>,
        time_range: TimeRange,
        date: NaiveDate,
    ) -> Result<Self, PersistenceError> {
        if !time_range.is_in_date(ctx, date) {
            return Err(PersistenceError::HydrationError(
                "TimeRange does not belong to the specified date".to_string(),
            ));
        }

        Ok(Self {
            id,
            category,
            description,
            time_range,
            date,
        })
    }

    pub fn new(
        ctx: &AuditContext,
        category: CategoryReference,
        description: Option<String>,
        time_range: TimeRange,
    ) -> Self {
        let date = ctx.tz().naive_date(time_range.started_at());

        Self {
            id: ActivityId::new_v4(),
            category,
            description,
            time_range,
            date,
        }
    }

    pub fn stop(&mut self, ctx: &AuditContext) -> Result<(), DomainError> {
        if self.is_completed() {
            return Err(DomainError::AlreadyStopped);
        }

        let started_at = self.time_range.started_at();
        let ended_at = self.ended_at_filler(ctx);
        self.time_range = TimeRange::try_new_completed(started_at, ended_at)?;

        Ok(())
    }

    pub fn edit(
        &mut self,
        ctx: &AuditContext,
        new_category: CategoryReference,
        new_description: Option<String>,
        new_time_range: TimeRange,
    ) -> Result<(), DomainError> {
        if !new_time_range.is_in_date(ctx, self.date) {
            return Err(DomainError::InvalidTimeRange);
        }

        self.time_range = new_time_range;
        self.category = new_category;
        self.description = new_description;

        Ok(())
    }

    fn ended_at_filler(&self, ctx: &AuditContext) -> DateTime<Utc> {
        if self.date == ctx.today() {
            ctx.now()
        } else {
            ctx.tz().start_of_next_day(self.date)
        }
    }
}
