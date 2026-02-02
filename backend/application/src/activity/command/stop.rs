use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AuditContext, Clock},
    interface::ActivityStateRepository,
};

use crate::{activity::ActivityStatePublisher, shared::ApplicationError};

#[derive(new)]
pub struct StopActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
    activity_state_publisher: Arc<ActivityStatePublisher>,
}

impl StopActivityService {
    pub async fn handle(&self) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref());

        let mut activity_state = self
            .repository
            .load(&ctx, ctx.today())
            .await?
            .ok_or(ApplicationError::NotFound)?;

        activity_state.stop(&ctx)?;

        self.repository.save(&activity_state).await?;

        self.activity_state_publisher
            .update_state(&activity_state)
            .await;

        Ok(())
    }
}
