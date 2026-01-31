use crate::{
    audit::audit_context::AuditContext,
    entity::{
        activity::{Activity, ActivityId},
        category::CategoryId,
    },
    shared::errors::DomainError,
    values::time_range::TimeRange,
};
use chrono::{DateTime, Utc};
use itertools::Itertools;

#[derive(Debug, Default)]
pub struct ActivityState {
    active_activity: Option<Activity>,
    completed_activities: Vec<Activity>,
}

impl ActivityState {
    pub fn active_activity(&self) -> Option<&Activity> {
        self.active_activity.as_ref()
    }
    pub fn completed_activities(&self) -> Vec<&Activity> {
        self.completed_activities
            .iter()
            .sorted_by_key(|a| std::cmp::Reverse(a.started_at()))
            .collect()
    }
    pub fn all_activities(&self) -> Vec<&Activity> {
        self.completed_activities
            .iter()
            .chain(self.active_activity.iter())
            .sorted_by_key(|a| std::cmp::Reverse(a.started_at()))
            .collect()
    }

    pub fn hydrate(activities_all: Vec<Activity>) -> Result<Self, DomainError> {
        let (mut active, completed): (Vec<_>, Vec<_>) =
            activities_all.into_iter().partition(|a| a.is_active());

        if active.len() > 1 {
            return Err(DomainError::HydrationError(
                "Multiple active activities found during hydration".to_string(),
            ));
        }

        Ok(Self {
            active_activity: active.pop(),
            completed_activities: completed,
        })
    }

    pub fn start(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
    ) -> Result<(), DomainError> {
        self.new_active_activity(ctx, category_id, description, ctx.now)
    }

    pub fn new_active_activity(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let time_range = TimeRange::new_active(started_at);
        let new_activity = Activity::new(category_id, description, time_range);

        self.place_activity(ctx, new_activity)?;
        Ok(())
    }

    pub fn stop(&mut self, ctx: &AuditContext) -> Result<(), DomainError> {
        let mut updated = self
            .active_activity
            .take()
            .ok_or(DomainError::NoActiveActivity)?;

        updated.stop(ctx)?;
        self.place_activity(ctx, updated)?;
        Ok(())
    }

    pub fn edit_active_activity(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let time_range = TimeRange::new_active(started_at);

        let mut updated = self
            .active_activity
            .as_ref()
            .cloned()
            .ok_or(DomainError::NoActiveActivity)?;
        updated.edit(category_id, description, time_range);

        self.place_activity(ctx, updated)?;
        Ok(())
    }

    pub fn cancel_active_activity(&mut self) -> Result<(), DomainError> {
        if self.active_activity.is_none() {
            return Err(DomainError::NoActiveActivity);
        }

        self.active_activity = None;
        Ok(())
    }

    pub fn add_completed_activity(
        &mut self,
        ctx: &AuditContext,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
        ended_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let time_range = TimeRange::try_new(started_at, Some(ended_at))?;
        let new_activity = Activity::new(category_id, description, time_range);

        self.place_activity(ctx, new_activity)?;
        Ok(())
    }

    pub fn edit_completed_activity(
        &mut self,
        ctx: &AuditContext,
        activity_id: ActivityId,
        category_id: CategoryId,
        description: Option<String>,
        started_at: DateTime<Utc>,
        ended_at: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        let index = self.ensure_find_completed_activity_index(activity_id)?;
        let mut updated = self.completed_activities[index].clone();

        let time_range = TimeRange::try_new(started_at, Some(ended_at))?;
        updated.edit(category_id, description, time_range);

        self.place_activity(ctx, updated)?;
        Ok(())
    }

    pub fn delete_completed_activity(
        &mut self,
        activity_id: ActivityId,
    ) -> Result<(), DomainError> {
        let index = self.ensure_find_completed_activity_index(activity_id)?;
        self.completed_activities.remove(index);
        Ok(())
    }

    fn ensure_no_overlap(
        &self,
        ctx: &AuditContext,
        activity: &Activity,
    ) -> Result<(), DomainError> {
        if let Some(ref active) = self.active_activity
            && activity.id() != active.id()
            && activity.overlaps_with(ctx, active)
        {
            Err(DomainError::ActivityOverlap)
        } else if self
            .completed_activities
            .iter()
            .any(|a| activity.id() != a.id() && activity.overlaps_with(ctx, a))
        {
            Err(DomainError::ActivityOverlap)
        } else {
            Ok(())
        }
    }

    fn ensure_find_completed_activity_index(
        &self,
        activity_id: ActivityId,
    ) -> Result<usize, DomainError> {
        self.completed_activities
            .iter()
            .position(|a| a.id() == activity_id)
            .ok_or(DomainError::ActivityNotFound)
    }

    fn place_activity(
        &mut self,
        ctx: &AuditContext,
        new_activity: Activity,
    ) -> Result<(), DomainError> {
        self.ensure_no_overlap(ctx, &new_activity)?;

        if new_activity.is_active() {
            if let Some(ref current_active) = self.active_activity
                && current_active.id() != new_activity.id()
            {
                return Err(DomainError::AlreadyActive);
            }

            self.active_activity = Some(new_activity);
        } else if let Some(index) = self
            .completed_activities
            .iter()
            .position(|a| a.id() == new_activity.id())
        {
            self.completed_activities[index] = new_activity;
        } else {
            self.completed_activities.push(new_activity);
        }

        Ok(())
    }
}
