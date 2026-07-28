use std::sync::Arc;

use derive_new::new;
use domain::{interface::CategoryRepository, service::CategoryNameValidationService};

use crate::{
    category::{RenameCategoryIdentityDto, RenameCategoryRequestDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct RenameCategoryService {
    repository: Arc<dyn CategoryRepository>,
    category_name_validation: Arc<CategoryNameValidationService>,
}

impl RenameCategoryService {
    pub async fn handle(
        &self,
        identity: RenameCategoryIdentityDto,
        request: RenameCategoryRequestDto,
    ) -> Result<(), ApplicationError> {
        let mut category = self
            .repository
            .find_by_id(identity.category_id)
            .await?
            .ok_or(ApplicationError::NotFound)?;

        category.rename(request.name);
        self.category_name_validation
            .ensure_unique(&category)
            .await?;

        self.repository.save(&category).await?;

        Ok(())
    }
}
