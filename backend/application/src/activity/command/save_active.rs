use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AppTimeZone, AuditContext, Clock},
    interface::{ActivityStateRepository, CategoryRepository},
    shared::errors::DomainError,
};

use crate::{activity::SaveActiveActivityRequestDto, shared::ApplicationError};

#[derive(new)]
pub struct SaveActiveActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    category_repository: Arc<dyn CategoryRepository>,
    clock: Arc<dyn Clock>,
}

impl SaveActiveActivityService {
    pub async fn handle(
        &self,
        request: &SaveActiveActivityRequestDto,
    ) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref(), AppTimeZone::Local);

        if !self
            .category_repository
            .exists(request.category_id.into())
            .await?
        {
            return Err(DomainError::CategoryNotFound.into());
        }

        let mut activity_state = self
            .repository
            .load(ctx.tz(), ctx.today())
            .await?
            .ok_or(ApplicationError::NotFound)?;

        activity_state.upsert_active(
            &ctx,
            request.category_id.into(),
            request.description.clone(),
            request.started_at,
        )?;

        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
