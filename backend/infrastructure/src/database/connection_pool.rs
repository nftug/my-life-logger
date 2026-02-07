use domain::shared::errors::PersistenceError;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};

use crate::database::{
    DatabaseConfig,
    entity::{activities, categories},
};

impl From<&DatabaseConfig> for ConnectOptions {
    fn from(config: &DatabaseConfig) -> Self {
        let mut database_path_str = config.database_path.to_string_lossy().to_string();
        if cfg!(windows) {
            database_path_str = database_path_str.replace('\\', "/");
        }
        let database_url = format!("sqlite://{}?mode=rwc", database_path_str);

        let mut options = ConnectOptions::new(database_url);
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
        let db = Database::connect(options).await?;

        // setup schema
        db.get_schema_builder()
            .register(activities::Entity)
            .register(categories::Entity);

        Ok(Self(db))
    }
}

pub fn log_db_error(err: DbErr) -> PersistenceError {
    tracing::error!(error = ?err, "Database operation failed");
    PersistenceError::DatabaseError(err.to_string())
}
