use domain::shared::errors::{DomainError, PersistenceError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApplicationError {
    #[error("{0}")]
    DomainError(DomainError),
    #[error("対象データが見つかりません")]
    NotFound,
    #[error("内部エラー: {0}")]
    InternalError(String),
}

impl From<DomainError> for ApplicationError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::ActivityNotFound => ApplicationError::NotFound,
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
