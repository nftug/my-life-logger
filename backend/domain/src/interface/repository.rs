use async_trait::async_trait;

use crate::{
    aggregate::ActivityState,
    entity::{Category, CategoryId},
    shared::errors::PersistenceError,
};

#[async_trait]
pub trait ActivityStateRepository: Send + Sync {
    async fn save(&self, activity_state: &ActivityState) -> Result<(), PersistenceError>;
    async fn load(&self) -> Result<ActivityState, PersistenceError>;
}

#[async_trait]
pub trait CategoryRepository: Send + Sync {
    async fn exists(&self, category_id: CategoryId) -> Result<bool, PersistenceError>;
    async fn find_by_id(&self, category_id: CategoryId) -> Result<Category, PersistenceError>;
    async fn save(&self, category: &Category) -> Result<(), PersistenceError>;
}
