use chrono::{DateTime, NaiveDate, Utc};

use crate::audit::{AppTimeZone, Clock};

#[derive(Debug)]
pub struct AuditContext {
    now: DateTime<Utc>,
    tz: AppTimeZone,
}

impl AuditContext {
    pub fn new(clock: &dyn Clock) -> Self {
        Self {
            now: clock.now(),
            tz: clock.tz(),
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
