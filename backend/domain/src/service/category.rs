use std::sync::Arc;

use derive_new::new;

use crate::{entity::Category, interface::CategoryRepository, shared::errors::DomainError};

#[derive(new)]
pub struct CategoryNameValidationService {
    repository: Arc<dyn CategoryRepository>,
}

impl CategoryNameValidationService {
    pub async fn ensure_unique(&self, category: &Category) -> Result<(), DomainError> {
        if let Some(existing) = self.repository.find_by_name(category.name()).await?
            && existing.id() != category.id()
        {
            return Err(DomainError::CategoryNameAlreadyExists);
        }

        Ok(())
    }
}
