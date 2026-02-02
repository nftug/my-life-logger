use std::sync::Arc;

use derive_new::new;
use domain::{
    audit::{AuditContext, Clock},
    interface::ActivityStateRepository,
};

use crate::{
    activity::{ActivityStateResponseDto, GetActivityStateIdentityDto},
    shared::ApplicationError,
};

#[derive(new)]
pub struct GetActivityStateService {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
}

impl GetActivityStateService {
    pub async fn handle(
        &self,
        identity: GetActivityStateIdentityDto,
    ) -> Result<ActivityStateResponseDto, ApplicationError> {
        let ctx = AuditContext::new(self.clock.as_ref());

        let response = self
            .repository
            .load(ctx.tz(), identity.date)
            .await?
            .map(|a| ActivityStateResponseDto::from_domain(&ctx, &a))
            .unwrap_or(ActivityStateResponseDto::default(identity.date));

        Ok(response)
    }
}
