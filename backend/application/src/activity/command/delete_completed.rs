use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AppTimeZone, AuditContext, Clock},
    interface::ActivityStateRepository,
};

use crate::{activity::DeleteCompletedActivityIdentityDto, shared::ApplicationError};

#[derive(new)]
pub struct DeleteCompletedActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
}

impl DeleteCompletedActivityService {
    pub async fn handle(
        &self,
        identity: &DeleteCompletedActivityIdentityDto,
    ) -> Result<(), crate::shared::ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref(), AppTimeZone::Local);

        let mut activity_state = self
            .repository
            .load(ctx.tz(), ctx.today())
            .await?
            .ok_or(ApplicationError::NotFound)?;

        activity_state.delete_completed(identity.activity_id)?;

        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
