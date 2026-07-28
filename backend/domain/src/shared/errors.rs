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
    #[error("Activity does not belong to the specified date")]
    ActivityNotInSpecifiedDate,
    #[error("Activity overlaps with an existing activity")]
    ActivityOverlap,
    #[error("Activity not found")]
    ActivityNotFound,
    #[error("Category not found")]
    CategoryNotFound,
    #[error("Category name already exists")]
    CategoryNameAlreadyExists,
    #[error(transparent)]
    Persistence(#[from] PersistenceError),
    #[error("{0}")]
    GenericError(String),
}

#[derive(Error, Debug)]
pub enum PersistenceError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    #[error("{0}")]
    HydrationError(String),
    #[error("Entity not found")]
    NotFound,
}
