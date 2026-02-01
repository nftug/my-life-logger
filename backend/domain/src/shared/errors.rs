use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("Activity is already active")]
    AlreadyActive,
    #[error("No active activity found")]
    NoActiveActivity,
    #[error("Activity already stopped")]
    AlreadyStopped,
    #[error("Activity time range is invalid")]
    InvalidTimeRange,
    #[error("Activity overlaps with an existing activity")]
    ActivityOverlap,
    #[error("Activity not found")]
    ActivityNotFound,
    #[error("Category not found")]
    CategoryNotFound,
    #[error("{0}")]
    HydrationError(String),
    #[error("{0}")]
    GenericError(String),
}

#[derive(Error, Debug)]
pub enum PersistenceError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    #[error("Entity not found")]
    NotFound,
}
