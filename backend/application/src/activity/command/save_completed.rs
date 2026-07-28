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

        let category = self
            .category_repository
            .find_by_id(request.category_id)
            .await?
            .ok_or(DomainError::CategoryNotFound)?;
        let activity_date = ctx.tz().naive_date(request.started_at);

        let mut activity_state = self
            .repository
            .load(&ctx, activity_date)
            .await?
            .unwrap_or(ActivityState::new(activity_date));

        activity_state.upsert_completed(
            &ctx,
            identity.activity_id,
            category.into(),
            request.description,
            request.started_at,
            request.ended_at,
        )?;
        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
