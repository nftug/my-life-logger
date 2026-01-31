use crate::{
    entity::activity::{Activity, ActivityId},
    shared::errors::DomainError,
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

    pub fn start(&mut self, new_activity: Activity, now: DateTime<Utc>) -> Result<(), DomainError> {
        if self.active_activity.is_some() {
            return Err(DomainError::AlreadyActive);
        }
        if !new_activity.is_active() {
            return Err(DomainError::AlreadyStopped);
        }
        if self.overlaps_with_existing_activities(&new_activity, now) {
            return Err(DomainError::ActivityOverlap);
        }

        self.active_activity = Some(new_activity);
        Ok(())
    }

    pub fn stop(&mut self, ended_at: DateTime<Utc>) -> Result<(), DomainError> {
        let mut activity = self
            .active_activity
            .take()
            .ok_or(DomainError::NoActiveActivity)?;

        activity.stop(ended_at)?;
        self.completed_activities.push(activity);
        Ok(())
    }

    pub fn edit_active_activity(
        &mut self,
        new_active_activity: Activity,
        now: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        if self.active_activity.is_none() {
            return Err(DomainError::NoActiveActivity);
        }
        if !new_active_activity.is_active() {
            return Err(DomainError::AlreadyStopped);
        }
        if new_active_activity.id() != self.active_activity.as_ref().unwrap().id() {
            return Err(DomainError::GenericError(
                "Edited active activity ID does not match current active activity ID".to_string(),
            ));
        }
        if self.overlaps_with_existing_activities(&new_active_activity, now) {
            return Err(DomainError::ActivityOverlap);
        }

        self.active_activity = Some(new_active_activity);
        Ok(())
    }

    pub fn edit_completed_activity(
        &mut self,
        new_completed_activity: Activity,
        now: DateTime<Utc>,
    ) -> Result<(), DomainError> {
        if new_completed_activity.is_active() {
            return Err(DomainError::AlreadyActive);
        }
        if self.overlaps_with_existing_activities(&new_completed_activity, now) {
            return Err(DomainError::ActivityOverlap);
        }

        let index = self
            .find_completed_activity_index(new_completed_activity.id())
            .ok_or(DomainError::ActivityNotFound)?;
        self.completed_activities[index] = new_completed_activity;

        Ok(())
    }

    pub fn cancel_active_activity(&mut self) -> Result<(), DomainError> {
        if self.active_activity.is_none() {
            return Err(DomainError::NoActiveActivity);
        }

        self.active_activity = None;
        Ok(())
    }

    pub fn delete_completed_activity(
        &mut self,
        activity_id: ActivityId,
    ) -> Result<(), DomainError> {
        let index = self
            .find_completed_activity_index(activity_id)
            .ok_or(DomainError::ActivityNotFound)?;

        self.completed_activities.remove(index);
        Ok(())
    }

    fn overlaps_with_existing_activities(&self, activity: &Activity, now: DateTime<Utc>) -> bool {
        if let Some(ref active) = self.active_activity
            && activity.id() != active.id()
            && activity.overlaps_with(active, now)
        {
            return true;
        }

        if self
            .completed_activities
            .iter()
            .any(|a| activity.id() != a.id() && activity.overlaps_with(a, now))
        {
            return true;
        }

        false
    }

    fn find_completed_activity_index(&self, activity_id: ActivityId) -> Option<usize> {
        self.completed_activities
            .iter()
            .position(|a| a.id() == activity_id)
    }
}
