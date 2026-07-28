use domain::shared::errors::{DomainError, PersistenceError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApplicationError {
    #[error("Domain error: {0}")]
    DomainError(DomainError),
    #[error("Not found")]
    NotFound,
    #[error("カテゴリ名は既に存在します")]
    CategoryNameAlreadyExists,
    #[error("{0}")]
    InternalError(String),
}

impl From<DomainError> for ApplicationError {
    fn from(err: DomainError) -> Self {
        match err {
            DomainError::ActivityNotFound => ApplicationError::NotFound,
            DomainError::CategoryNameAlreadyExists => ApplicationError::CategoryNameAlreadyExists,
            DomainError::Persistence(err) => err.into(),
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
