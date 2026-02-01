use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AppTimeZone, AuditContext, Clock},
    interface::ActivityStateRepository,
};

use crate::{activity::SaveActiveActivityRequestDto, shared::ApplicationError};

#[derive(new)]
pub struct SaveActiveActivityService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
}

impl SaveActiveActivityService {
    pub async fn handle(
        &self,
        request: &SaveActiveActivityRequestDto,
    ) -> Result<(), ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref(), AppTimeZone::Local);

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
