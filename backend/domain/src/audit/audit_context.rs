use chrono::{DateTime, FixedOffset, Local, NaiveDate, Utc};

use crate::audit::Clock;

#[derive(Debug, Clone)]
pub enum AppTimeZone {
    Utc,
    Local,
    Fixed(FixedOffset),
}

impl AppTimeZone {
    pub fn get_naive_date(&self, datetime: DateTime<Utc>) -> NaiveDate {
        match self {
            AppTimeZone::Utc => datetime.with_timezone(&Utc).date_naive(),
            AppTimeZone::Local => datetime.with_timezone(&Local).date_naive(),
            AppTimeZone::Fixed(offset) => datetime.with_timezone(offset).date_naive(),
        }
    }
}

#[derive(Debug)]
pub struct AuditContext {
    now: DateTime<Utc>,
    tz: AppTimeZone,
}

impl AuditContext {
    pub fn new(clock: &impl Clock, tz: AppTimeZone) -> Self {
        Self {
            now: clock.now(),
            tz,
        }
    }

    pub fn now(&self) -> DateTime<Utc> {
        self.now
    }

    pub fn today(&self) -> NaiveDate {
        self.tz.get_naive_date(self.now)
    }

    pub fn tz(&self) -> &AppTimeZone {
        &self.tz
    }
}
