use chrono::{DateTime, Utc};

pub trait Clock: Send + Sync {
    fn now(&self) -> DateTime<Utc> {
        Utc::now()
    }
}

pub struct SystemClock;

impl Clock for SystemClock {}

#[allow(dead_code)]
#[cfg(test)]
pub struct FixedClock {
    fixed_time: DateTime<Utc>,
}

#[allow(dead_code)]
#[cfg(test)]
impl Clock for FixedClock {
    fn now(&self) -> DateTime<Utc> {
        self.fixed_time
    }
}
