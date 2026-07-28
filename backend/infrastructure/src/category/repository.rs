use async_trait::async_trait;
use derive_new::new;
use domain::{
    entity::{Category, CategoryId},
    interface::CategoryRepository,
    shared::errors::PersistenceError,
};
use sea_orm::{DatabaseBackend, EntityTrait, QueryOrder, Statement, sea_query::OnConflict};

use crate::{
    category::mapper::CategoryMapper,
    database::{
        ConnectionPool,
        connection_pool::log_db_error,
        entity::{categories, prelude::Categories},
    },
};

#[derive(new)]
pub struct CategoryRepositoryImpl {
    pool: ConnectionPool,
}

#[async_trait]
impl CategoryRepository for CategoryRepositoryImpl {
    async fn find_by_id(
        &self,
        category_id: CategoryId,
    ) -> Result<Option<Category>, PersistenceError> {
        let model = Categories::find_by_id(category_id.raw())
            .one(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        Ok(model.map(CategoryMapper::to_domain))
    }

    async fn find_by_name(&self, name: &str) -> Result<Option<Category>, PersistenceError> {
        let model = Categories::find()
            .from_raw_sql(Statement::from_sql_and_values(
                DatabaseBackend::Sqlite,
                "SELECT id, name FROM categories WHERE name = ? COLLATE NOCASE LIMIT 1",
                [name.into()],
            ))
            .one(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        Ok(model.map(CategoryMapper::to_domain))
    }

    async fn find_all(&self) -> Result<Vec<Category>, PersistenceError> {
        let models = Categories::find()
            .order_by_asc(categories::Column::Name)
            .all(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        Ok(models.into_iter().map(CategoryMapper::to_domain).collect())
    }

    async fn save(&self, category: &Category) -> Result<(), PersistenceError> {
        categories::Entity::insert(CategoryMapper::to_active_model(category))
            .on_conflict(
                OnConflict::column(categories::Column::Id)
                    .update_columns([categories::Column::Name])
                    .to_owned(),
            )
            .exec(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        Ok(())
    }

    async fn delete(&self, category_id: CategoryId) -> Result<(), PersistenceError> {
        let result = Categories::delete_by_id(category_id.raw())
            .exec(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        if result.rows_affected == 0 {
            return Err(PersistenceError::NotFound);
        }

        Ok(())
    }
}
