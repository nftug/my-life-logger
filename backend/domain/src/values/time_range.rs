use chrono::{DateTime, NaiveDate, Utc};

use crate::{audit::audit_context::AuditContext, shared::errors::DomainError};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimeRange {
    started_at: DateTime<Utc>,
    ended_at: Option<DateTime<Utc>>,
}

impl TimeRange {
    pub fn hydrate(started_at: DateTime<Utc>, ended_at: Option<DateTime<Utc>>) -> Self {
        Self {
            started_at,
            ended_at,
        }
    }

    pub fn new_active(started_at: DateTime<Utc>) -> Self {
        Self {
            started_at,
            ended_at: None,
        }
    }

    pub fn try_new(
        started_at: DateTime<Utc>,
        ended_at: Option<DateTime<Utc>>,
    ) -> Result<Self, DomainError> {
        if let Some(ended_at) = ended_at
            && started_at >= ended_at
        {
            return Err(DomainError::InvalidTimeRange);
        }
        Ok(Self {
            started_at,
            ended_at,
        })
    }

    pub fn started_at(&self) -> DateTime<Utc> {
        self.started_at
    }

    pub fn ended_at(&self) -> Option<DateTime<Utc>> {
        self.ended_at
    }

    pub fn is_active(&self) -> bool {
        self.ended_at.is_none()
    }

    pub fn is_completed(&self) -> bool {
        self.ended_at.is_some()
    }

    pub fn is_in_date(&self, ctx: &AuditContext, date: NaiveDate) -> bool {
        let start_date = ctx.tz().get_naive_date(self.started_at);
        let end_date = match self.ended_at {
            Some(ended_at) => ctx.tz().get_naive_date(ended_at),
            None => ctx.today(),
        };

        date >= start_date && date <= end_date
    }
}
