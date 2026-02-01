use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AppTimeZone, AuditContext, Clock},
    entity::ActivityId,
    interface::ActivityStateRepository,
    shared::EntityIdTrait,
};

use crate::{
    activity::{SaveCompletedActivityIdentityDto, SaveCompletedActivityRequestDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct SaveCompletedActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
}

impl SaveCompletedActivityService {
    pub async fn handle(
        &self,
        identity: &SaveCompletedActivityIdentityDto,
        request: &SaveCompletedActivityRequestDto,
    ) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref(), AppTimeZone::Local);

        let mut activity_state = self
            .repository
            .load(ctx.tz(), ctx.today())
            .await?
            .ok_or(ApplicationError::NotFound)?;

        activity_state.upsert_completed(
            &ctx,
            identity.activity_id.unwrap_or_else(ActivityId::new_v4),
            request.category_id.into(),
            request.description.clone(),
            request.started_at,
            request.ended_at,
        )?;
        self.repository.save(&activity_state).await?;

        Ok(())
    }
}
