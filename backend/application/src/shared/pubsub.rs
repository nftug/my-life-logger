use pubsub_rs::Pubsub;

#[derive(Clone)]
pub struct PubsubStream<T: Send + 'static + Clone> {
    pubsub: Pubsub<(), T>,
}

impl<T: Send + 'static + Clone> PubsubStream<T> {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn publish(&self, value: T) {
        self.pubsub.publish((), value).await;
    }

    pub fn subscribe(&self, mut on_event: impl FnMut(T) + Send + 'static) {
        tokio::spawn({
            let pubsub = self.pubsub.clone();
            async move {
                let subscriber = pubsub.subscribe(vec![()]).await;
                while let Ok((_, value)) = subscriber.recv().await {
                    on_event(value);
                }
            }
        });
    }
}

impl<T: Send + 'static + Clone> Default for PubsubStream<T> {
    fn default() -> Self {
        Self {
            pubsub: Pubsub::new(),
        }
    }
}
