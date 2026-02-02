use std::sync::Arc;

use derive_new::new;
use domain::{
    aggregate::ActivityState,
    audit::{AuditContext, Clock},
    interface::{ActivityStateRepository, CategoryRepository},
    shared::errors::DomainError,
};

use crate::{
    activity::{ActivityStatePublisher, SaveActiveActivityRequestDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct SaveActiveActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    category_repository: Arc<dyn CategoryRepository>,
    clock: Arc<dyn Clock>,
    activity_state_publisher: Arc<ActivityStatePublisher>,
}

impl SaveActiveActivityService {
    pub async fn handle(
        &self,
        request: SaveActiveActivityRequestDto,
    ) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref());

        let category = self
            .category_repository
            .find_by_id(request.category_id)
            .await?
            .ok_or(DomainError::CategoryNotFound)?;

        let mut activity_state = self
            .repository
            .load(&ctx, ctx.today())
            .await?
            .unwrap_or(ActivityState::new(ctx.today()));

        activity_state.upsert_active(
            &ctx,
            category.into(),
            request.description,
            request.started_at,
        )?;

        self.repository.save(&activity_state).await?;

        self.activity_state_publisher
            .update_state(&activity_state)
            .await;

        Ok(())
    }
}
