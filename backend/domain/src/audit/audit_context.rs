use chrono::{DateTime, FixedOffset, Local, NaiveDate, NaiveDateTime, TimeZone, Utc};

use crate::audit::Clock;

#[derive(Debug, Clone)]
pub enum AppTimeZone {
    Utc,
    Local,
    Fixed(FixedOffset),
}

impl AppTimeZone {
    pub fn naive_date(&self, datetime: DateTime<Utc>) -> NaiveDate {
        match self {
            AppTimeZone::Utc => datetime.date_naive(),
            AppTimeZone::Local => datetime.with_timezone(&Local).date_naive(),
            AppTimeZone::Fixed(offset) => datetime.with_timezone(offset).date_naive(),
        }
    }

    pub fn start_of_date(&self, date: NaiveDate) -> DateTime<Utc> {
        self.utc_datetime(date.and_hms_opt(0, 0, 0).unwrap())
    }
    pub fn start_of_next_date(&self, date: NaiveDate) -> DateTime<Utc> {
        self.start_of_date(date.succ_opt().unwrap())
    }
    pub fn utc_datetime(&self, naive_datetime: NaiveDateTime) -> DateTime<Utc> {
        match self {
            AppTimeZone::Utc => Utc.from_utc_datetime(&naive_datetime),
            AppTimeZone::Local => Local.from_local_datetime(&naive_datetime).unwrap().into(),
            AppTimeZone::Fixed(offset) => {
                offset.from_local_datetime(&naive_datetime).unwrap().into()
            }
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
        self.tz.naive_date(self.now)
    }

    pub fn tz(&self) -> &AppTimeZone {
        &self.tz
    }
}
