use chrono::{DateTime, NaiveDate, Utc};

use crate::audit::{AppTimeZone, Clock};

#[derive(Debug)]
pub struct AuditContext {
    now: DateTime<Utc>,
    tz: AppTimeZone,
}

impl AuditContext {
    pub fn new(clock: &dyn Clock, tz: AppTimeZone) -> Self {
        Self {
            now: clock.now(),
            tz,
        }
    }

    pub fn now(&self) -> DateTime<Utc> {
        self.now
    }

    pub fn today(&self) -> NaiveDate {
        self.tz.naive_date(self.now)
    }

    pub fn tz(&self) -> AppTimeZone {
        self.tz
    }
}
