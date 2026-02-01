use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AuditContext, Clock},
    interface::ActivityStateRepository,
};

use crate::shared::ApplicationError;

#[derive(new)]
pub struct StopActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
}

impl StopActivityService {
    pub async fn handle(&self) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref());

        let mut activity_state = self
            .repository
            .load(ctx.tz(), ctx.today())
            .await?
            .ok_or(ApplicationError::NotFound)?;

        activity_state.stop(&ctx)?;

        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
