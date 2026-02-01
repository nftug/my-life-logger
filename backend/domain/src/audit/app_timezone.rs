use chrono::{DateTime, FixedOffset, Local, NaiveDate, NaiveDateTime, TimeZone, Utc};

#[derive(Debug, Clone, Copy)]
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

    pub fn start_of_day(&self, date: NaiveDate) -> DateTime<Utc> {
        self.utc_datetime(date.and_hms_opt(0, 0, 0).unwrap())
    }
    pub fn start_of_next_day(&self, date: NaiveDate) -> DateTime<Utc> {
        self.start_of_day(date.succ_opt().unwrap())
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
