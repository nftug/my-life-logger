use domain::shared::errors::{DomainError, PersistenceError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApplicationError {
    #[error("Domain error: {0}")]
    DomainError(DomainError),
    #[error("Not found")]
    NotFound,
    #[error("{0}")]
    InternalError(String),
}

impl From<DomainError> for ApplicationError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::ActivityNotFound | DomainError::NoActiveActivity => {
                ApplicationError::NotFound
            }
            DomainError::HydrationError(msg) => ApplicationError::InternalError(msg),
            other => ApplicationError::DomainError(other),
        }
    }
}

impl From<PersistenceError> for ApplicationError {
    fn from(err: PersistenceError) -> Self {
        match err {
            PersistenceError::NotFound => ApplicationError::NotFound,
            other => ApplicationError::InternalError(other.to_string()),
        }
    }
}
