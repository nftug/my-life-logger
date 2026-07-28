use async_trait::async_trait;
use chrono::NaiveDate;

use crate::{
    aggregate::ActivityState,
    audit::AuditContext,
    entity::{Category, CategoryId},
    shared::errors::PersistenceError,
};

#[async_trait]
pub trait ActivityStateRepository: Send + Sync {
    async fn load(
        &self,
        ctx: &AuditContext,
        date: NaiveDate,
    ) -> Result<Option<ActivityState>, PersistenceError>;

    async fn save(&self, activity_state: &ActivityState) -> Result<(), PersistenceError>;
}

#[async_trait]
pub trait CategoryRepository: Send + Sync {
    async fn find_by_id(
        &self,
        category_id: CategoryId,
    ) -> Result<Option<Category>, PersistenceError>;

    async fn find_by_name(&self, name: &str) -> Result<Option<Category>, PersistenceError>;

    async fn find_all(&self) -> Result<Vec<Category>, PersistenceError>;

    async fn save(&self, category: &Category) -> Result<(), PersistenceError>;

    async fn delete(&self, category_id: CategoryId) -> Result<(), PersistenceError>;
}
