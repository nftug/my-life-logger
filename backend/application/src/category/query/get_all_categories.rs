use std::sync::Arc;

use derive_new::new;
use domain::interface::CategoryRepository;

use crate::{category::CategoryResponseDto, shared::ApplicationError};

#[derive(new)]
pub struct GetAllCategoriesService {
    repository: Arc<dyn CategoryRepository>,
}

impl GetAllCategoriesService {
    pub async fn handle(&self) -> Result<Vec<CategoryResponseDto>, ApplicationError> {
        let categories = self.repository.find_all().await?;

        Ok(categories
            .iter()
            .map(CategoryResponseDto::from_domain)
            .collect())
    }
}
