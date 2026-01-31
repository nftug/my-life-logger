use async_trait::async_trait;

use crate::{aggregate::activity_state::ActivityState, shared::errors::PersistenceError};

#[async_trait]
pub trait ActivityStateRepository: Send + Sync {
    async fn save(&self, activity_state: &ActivityState) -> Result<(), PersistenceError>;
    async fn load(&self) -> Result<ActivityState, PersistenceError>;
}
