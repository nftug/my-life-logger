use std::sync::Arc;

use derive_new::new;
use domain::{
    aggregate::ActivityState,
    audit::{AuditContext, Clock},
    interface::{ActivityStateRepository, CategoryRepository},
    shared::errors::DomainError,
};

use crate::{
    activity::{SaveCompletedActivityIdentityDto, SaveCompletedActivityRequestDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct SaveCompletedActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    category_repository: Arc<dyn CategoryRepository>,
    clock: Arc<dyn Clock>,
}

impl SaveCompletedActivityService {
    pub async fn handle(
        &self,
        identity: SaveCompletedActivityIdentityDto,
        request: SaveCompletedActivityRequestDto,
    ) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref());

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
            .unwrap_or(ActivityState::new(ctx.today()));

        activity_state.upsert_completed(
            &ctx,
            identity.activity_id,
            request.category_id.into(),
            request.description,
            request.started_at,
            request.ended_at,
        )?;
        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
