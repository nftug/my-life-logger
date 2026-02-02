use std::sync::Arc;

use derive_new::new;
use domain::interface::CategoryRepository;

use crate::{category::DeleteCategoryIdentityDto, shared::ApplicationError};

#[derive(new)]
pub struct DeleteCategoryService {
    repository: Arc<dyn CategoryRepository>,
}

impl DeleteCategoryService {
    pub async fn handle(
        &self,
        identity: DeleteCategoryIdentityDto,
    ) -> Result<(), ApplicationError> {
        self.repository.delete(identity.category_id).await?;

        Ok(())
    }
}
