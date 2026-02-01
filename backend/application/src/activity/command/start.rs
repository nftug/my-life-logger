use std::sync::Arc;

use derive_new::new;
use domain::{
    aggregate::ActivityState,
    audit::{AuditContext, Clock},
    interface::{ActivityStateRepository, CategoryRepository},
    shared::errors::DomainError,
};

use crate::{
    activity::{ActivityStatePublisher, StartActivityRequestDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct StartActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    category_repository: Arc<dyn CategoryRepository>,
    clock: Arc<dyn Clock>,
    activity_state_publisher: Arc<ActivityStatePublisher>,
}

impl StartActivityService {
    pub async fn handle(&self, request: StartActivityRequestDto) -> Result<(), ApplicationError> {
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

        activity_state.start(&ctx, request.category_id.into(), request.description)?;

        self.repository.save(&activity_state).await?;

        self.activity_state_publisher
            .update_state(&activity_state)
            .await;

        Ok(())
    }
}
