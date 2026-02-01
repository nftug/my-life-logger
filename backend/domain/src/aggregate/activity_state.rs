use crate::{
    audit::audit_context::AuditContext,
    entity::{Activity, ActivityId, CategoryId},
    shared::errors::DomainError,
    values::TimeRange,
};
use chrono::{DateTime, NaiveDate, Utc};
use itertools::Itertools;

#[derive(Debug, Default)]
pub struct ActivityState {
    date: NaiveDate,
    active: Option<Activity>,
    completed: Vec<Activity>,
}

impl ActivityState {
    pub fn active(&self) -> Option<&Activity> {
        self.active.as_ref()
    }
    pub fn completed(&self) -> Vec<&Activity> {
        self.completed
            .iter()
            .sorted_by_key(|a| std::cmp::Reverse(a.started_at()))
            .collect()
    }
    pub fn all(&self) -> Vec<&Activity> {
        self.completed
            .iter()
            .chain(self.active.iter())
            .sorted_by_key(|a| std::cmp::Reverse(a.started_at()))
            .collect()
    }
    pub fn date(&self) -> NaiveDate {
        self.date
    }

    pub fn hydrate(date: NaiveDate, activities_all: Vec<Activity>) -> Result<Self, DomainError> {
        if activities_all.iter().any(|a| a.date() != date) {
            return Err(DomainError::HydrationError(
                "Activity does not belong to the specified date".to_string(),
            ));
        }

        let (mut active, completed): (Vec<_>, Vec<_>) =
            activities_all.into_iter().partition(|a| a.is_active());

        if active.len() > 1 {
            return Err(DomainError::HydrationError(
                "Multiple active activities found during hydration".to_string(),
            ));
        }

        Ok(Self {
            date,
            active: active.pop(),
            completed,
        })
    }

    pub fn new(date: NaiveDate) -> Self {
        Self {
            date,
            ..Default::default()
        }
    }

    pub fn start(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
    ) -> Result<(), DomainError> {
        self.upsert_active(ctx, category_id, description, ctx.now())
    }

    pub fn stop(&mut self, ctx: &AuditContext) -> Result<(), DomainError> {
        let mut updated = self.active.take().ok_or(DomainError::NoActiveActivity)?;

        updated.stop(ctx)?;
        self.place_activity(ctx, updated)?;
        Ok(())
    }

    pub fn upsert_active(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let time_range = TimeRange::new_active(started_at);

        let activity = match &self.active {
            Some(existing) => {
                let mut updated = existing.clone();
                updated.edit(ctx, category_id, description, time_range)?;
                updated
            }
            None => Activity::new(ctx, category_id, description, time_range),
        };

        self.place_activity(ctx, activity)?;
        Ok(())
    }

    pub fn cancel_active(&mut self) -> Result<(), DomainError> {
        if self.active.is_none() {
            return Err(DomainError::NoActiveActivity);
        }

        self.active = None;
        Ok(())
    }

    pub fn upsert_completed(
        &mut self,
        ctx: &AuditContext,
        activity_id: ActivityId,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
        ended_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let time_range = TimeRange::try_new_completed(started_at, ended_at)?;

        let existing_opt = self.completed.iter_mut().find(|a| a.id() == activity_id);
        let activity = match existing_opt {
            Some(existing) => {
                existing.edit(ctx, category_id, description, time_range)?;
                existing.clone()
            }
            None => Activity::new(ctx, category_id, description, time_range),
        };

        self.place_activity(ctx, activity)?;
        Ok(())
    }

    pub fn delete_completed(&mut self, activity_id: ActivityId) -> Result<(), DomainError> {
        let index = self
            .completed
            .iter()
            .position(|a| a.id() == activity_id)
            .ok_or(DomainError::ActivityNotFound)?;

        self.completed.remove(index);
        Ok(())
    }

    fn place_activity(
        &mut self,
        ctx: &AuditContext,
        new_activity: Activity,
    ) -> Result<(), DomainError> {
        // Ensure single date
        if new_activity.date() != self.date {
            return Err(DomainError::ActivityNotInSpecifiedDate);
        }

        // Ensure no overlap
        let mut all = self.completed.iter().chain(self.active.iter());
        if all.any(|a| a.overlaps_with(ctx, &new_activity)) {
            return Err(DomainError::ActivityOverlap);
        }

        if new_activity.is_active() {
            if let Some(ref current_active) = self.active
                && current_active.id() != new_activity.id()
            {
                return Err(DomainError::AlreadyActive);
            }

            self.active = Some(new_activity);
        } else if let Some(index) = self
            .completed
            .iter()
            .position(|a| a.id() == new_activity.id())
        {
            self.completed[index] = new_activity;
        } else {
            self.completed.push(new_activity);
        }

        Ok(())
    }
}
