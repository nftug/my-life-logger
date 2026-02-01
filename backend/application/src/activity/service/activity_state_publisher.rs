use std::{sync::Arc, time::Duration};

use domain::{
    aggregate::ActivityState,
    audit::{AuditContext, Clock},
    interface::ActivityStateRepository,
};
use tokio::sync::{OnceCell, RwLock};

use crate::{activity::ActivityStateEventDto, shared::PubsubStream};

pub struct ActivityStatePublisher {
    repository: Arc<dyn ActivityStateRepository>,
    clock: Arc<dyn Clock>,
    current_state: RwLock<Option<ActivityState>>,
    pubsub: PubsubStream<Option<ActivityStateEventDto>>,
    init_once: OnceCell<()>,
}

impl ActivityStatePublisher {
    pub fn new(repository: Arc<dyn ActivityStateRepository>, clock: Arc<dyn Clock>) -> Arc<Self> {
        Arc::new(Self {
            repository,
            clock,
            current_state: RwLock::new(None),
            pubsub: PubsubStream::new(),
            init_once: OnceCell::new(),
        })
    }

    pub fn start(self: Arc<ActivityStatePublisher>) -> Arc<Self> {
        tokio::spawn({
            let this = self.clone();
            async move {
                this.init_once.get_or_init(|| this.run_publisher()).await;
            }
        });

        self
    }

    async fn run_publisher(&self) {
        let mut interval = tokio::time::interval(Duration::from_secs(1));

        loop {
            let ctx = AuditContext::new(self.clock.as_ref());

            if self.current_state.read().await.as_ref().map(|a| a.date()) != Some(ctx.today()) {
                let new_state = self
                    .repository
                    .load(ctx.tz(), ctx.today())
                    .await
                    .unwrap_or(None)
                    .unwrap_or(ActivityState::new(ctx.today()));
                self.current_state.write().await.replace(new_state);
            }

            self.pubsub
                .publish(
                    self.current_state
                        .read()
                        .await
                        .as_ref()
                        .map(|a| ActivityStateEventDto::from_domain(&ctx, a)),
                )
                .await;

            interval.tick().await;
        }
    }

    pub fn subscribe(&self, on_event: impl FnMut(Option<ActivityStateEventDto>) + Send + 'static) {
        self.pubsub.subscribe(on_event);
    }

    pub async fn update_state(&self, state: &ActivityState) {
        let mut current_state = self.current_state.write().await;
        current_state.replace(state.clone());
    }
}
