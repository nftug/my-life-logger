use domain::shared::errors::PersistenceError;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};

use crate::database::DatabaseConfig;

impl From<&DatabaseConfig> for ConnectOptions {
    fn from(config: &DatabaseConfig) -> Self {
        let mut options = ConnectOptions::new(config.url.clone());
        options.sqlx_logging(false);
        options
    }
}

#[derive(Clone)]
pub struct ConnectionPool(DatabaseConnection);

impl ConnectionPool {
    pub fn inner_ref(&self) -> &DatabaseConnection {
        &self.0
    }

    pub async fn new(config: &DatabaseConfig) -> Result<Self, sea_orm::DbErr> {
        let options: ConnectOptions = config.into();
        Ok(Self(Database::connect(options).await?))
    }
}

pub fn log_db_error(err: DbErr) -> PersistenceError {
    tracing::error!(error = ?err, "Database operation failed");
    PersistenceError::DatabaseError(err.to_string())
}
