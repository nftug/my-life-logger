use crate::{
    audit::audit_context::AuditContext,
    entity::{
        activity::{Activity, ActivityId},
        category::CategoryId,
    },
    shared::errors::DomainError,
    values::time_range::TimeRange,
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
            .sorted_by_key(|a| std::cmp::Reverse(a.time_range().started_at()))
            .collect()
    }
    pub fn all(&self) -> Vec<&Activity> {
        self.completed
            .iter()
            .chain(self.active.iter())
            .sorted_by_key(|a| std::cmp::Reverse(a.time_range().started_at()))
            .collect()
    }
    pub fn date(&self) -> NaiveDate {
        self.date
    }

    pub fn hydrate(
        ctx: &AuditContext,
        date: NaiveDate,
        activities_all: Vec<Activity>,
    ) -> Result<Self, DomainError> {
        if activities_all
            .iter()
            .any(|a| !a.time_range().is_in_date(ctx, date))
        {
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
                updated.edit(category_id, description, time_range);
                updated
            }
            None => Activity::new(category_id, description, time_range),
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
        let index = self.ensure_find_completed_activity_index(activity_id);
        let time_range = TimeRange::try_new(started_at, Some(ended_at))?;

        match index {
            Ok(idx) => {
                let mut updated = self.completed[idx].clone();
                updated.edit(category_id, description, time_range);
                self.place_activity(ctx, updated)?;
            }
            Err(_) => {
                let new_activity =
                    Activity::hydrate(activity_id, category_id, description, time_range);
                self.place_activity(ctx, new_activity)?;
            }
        }

        Ok(())
    }

    pub fn delete_completed(&mut self, activity_id: ActivityId) -> Result<(), DomainError> {
        let index = self.ensure_find_completed_activity_index(activity_id)?;
        self.completed.remove(index);
        Ok(())
    }

    fn ensure_no_overlap(
        &self,
        ctx: &AuditContext,
        activity: &Activity,
    ) -> Result<(), DomainError> {
        if let Some(ref active) = self.active
            && activity.id() != active.id()
            && activity.overlaps_with(ctx, active)
        {
            Err(DomainError::ActivityOverlap)
        } else if self
            .completed
            .iter()
            .any(|a| activity.id() != a.id() && activity.overlaps_with(ctx, a))
        {
            Err(DomainError::ActivityOverlap)
        } else {
            Ok(())
        }
    }

    fn ensure_single_date(
        &self,
        ctx: &AuditContext,
        activity: &Activity,
    ) -> Result<(), DomainError> {
        if !activity.time_range().is_in_date(ctx, self.date) {
            Err(DomainError::HydrationError(
                "Activity does not belong to the specified date".to_string(),
            ))
        } else {
            Ok(())
        }
    }

    fn ensure_find_completed_activity_index(
        &self,
        activity_id: ActivityId,
    ) -> Result<usize, DomainError> {
        self.completed
            .iter()
            .position(|a| a.id() == activity_id)
            .ok_or(DomainError::ActivityNotFound)
    }

    fn place_activity(
        &mut self,
        ctx: &AuditContext,
        new_activity: Activity,
    ) -> Result<(), DomainError> {
        self.ensure_single_date(ctx, &new_activity)?;
        self.ensure_no_overlap(ctx, &new_activity)?;

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
