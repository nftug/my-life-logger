use std::sync::Arc;

use derive_new::new;
use domain::{entity::Category, interface::CategoryRepository};

use crate::{
    category::CreateCategoryRequestDto, shared::ApplicationError, shared::EntityCreationDTO,
};

#[derive(new)]
pub struct CreateCategoryService {
    repository: Arc<dyn CategoryRepository>,
}

impl CreateCategoryService {
    pub async fn handle(
        &self,
        request: CreateCategoryRequestDto,
    ) -> Result<EntityCreationDTO, ApplicationError> {
        let category = Category::new(request.name);

        self.repository.save(&category).await?;

        Ok(EntityCreationDTO {
            id: category.id().into(),
        })
    }
}
