use chrono::{DateTime, Utc};

use crate::audit::clock::Clock;

#[derive(Debug)]
pub struct AuditContext {
    pub now: DateTime<Utc>,
}

impl AuditContext {
    pub fn new(clock: &impl Clock) -> Self {
        Self { now: clock.now() }
    }
}
