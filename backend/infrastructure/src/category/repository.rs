use async_trait::async_trait;
use domain::{
    entity::{Category, CategoryId},
    interface::CategoryRepository,
    shared::errors::PersistenceError,
};
use sea_orm::{ActiveModelTrait, EntityTrait, QueryOrder};

use crate::{
    category::mapper::CategoryMapper,
    database::{
        ConnectionPool,
        connection_pool::log_db_error,
        entity::{categories, prelude::Categories},
    },
};

#[derive(Clone)]
pub struct CategoryRepositoryImpl {
    pool: ConnectionPool,
}

impl CategoryRepositoryImpl {
    pub fn new(pool: ConnectionPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl CategoryRepository for CategoryRepositoryImpl {
    async fn find_by_id(
        &self,
        category_id: CategoryId,
    ) -> Result<Option<Category>, PersistenceError> {
        let db = self.pool.inner_ref();
        let model = Categories::find_by_id(category_id.raw())
            .one(db)
            .await
            .map_err(log_db_error)?;

        Ok(model.map(CategoryMapper::to_domain))
    }

    async fn find_all(&self) -> Result<Vec<Category>, PersistenceError> {
        let db = self.pool.inner_ref();
        let models = Categories::find()
            .order_by_asc(categories::Column::Name)
            .all(db)
            .await
            .map_err(log_db_error)?;

        Ok(models.into_iter().map(CategoryMapper::to_domain).collect())
    }

    async fn save(&self, category: &Category) -> Result<(), PersistenceError> {
        let db = self.pool.inner_ref();
        let existing = Categories::find_by_id(category.id().raw())
            .one(db)
            .await
            .map_err(log_db_error)?;

        if existing.is_some() {
            let model = CategoryMapper::to_active_model(category);
            model.update(db).await.map_err(log_db_error)?;
        } else {
            let model = CategoryMapper::to_active_model(category);
            model.insert(db).await.map_err(log_db_error)?;
        }

        Ok(())
    }

    async fn delete(&self, category_id: CategoryId) -> Result<(), PersistenceError> {
        let db = self.pool.inner_ref();
        let result = Categories::delete_by_id(category_id.raw())
            .exec(db)
            .await
            .map_err(log_db_error)?;

        if result.rows_affected == 0 {
            return Err(PersistenceError::NotFound);
        }

        Ok(())
    }
}
