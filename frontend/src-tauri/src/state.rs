use std::{io, sync::Arc};

use application::activity::{
    ActivityStatePublisher, CancelActiveActivityService, DeleteCompletedActivityService,
    GetActivityStateService, SaveActiveActivityService, SaveCompletedActivityService,
    StartActivityService, StopActivityService,
};
use domain::{
    audit::clock::SystemClock,
    interface::{ActivityStateRepository, CategoryRepository},
};
use infrastructure::{
    activity::ActivityStateRepositoryImpl,
    category::CategoryRepositoryImpl,
    database::{ConnectionPool, DatabaseConfig},
};

pub struct AppState {
    pub activity: ActivityServices,
}

pub struct ActivityServices {
    pub get_activity_state: GetActivityStateService,
    pub start_activity: StartActivityService,
    pub stop_activity: StopActivityService,
    pub cancel_active_activity: CancelActiveActivityService,
    pub save_active_activity: SaveActiveActivityService,
    pub save_completed_activity: SaveCompletedActivityService,
    pub delete_completed_activity: DeleteCompletedActivityService,
    pub activity_state_publisher: Arc<ActivityStatePublisher>,
}

impl AppState {
    pub async fn new(database_url: String) -> Result<Self, anyhow::Error> {
        let config = DatabaseConfig::new(database_url);
        let pool = ConnectionPool::new(&config)
            .await
            .map_err(|err| io::Error::other(err.to_string()))?;

        let activity_repository: Arc<dyn ActivityStateRepository> =
            Arc::new(ActivityStateRepositoryImpl::new(pool.clone()));
        let category_repository: Arc<dyn CategoryRepository> =
            Arc::new(CategoryRepositoryImpl::new(pool));

        let clock = Arc::new(SystemClock);
        let activity_state_publisher =
            ActivityStatePublisher::new(activity_repository.clone(), clock.clone());

        let activity = ActivityServices {
            get_activity_state: GetActivityStateService::new(
                activity_repository.clone(),
                clock.clone(),
            ),
            start_activity: StartActivityService::new(
                activity_repository.clone(),
                category_repository.clone(),
                clock.clone(),
                activity_state_publisher.clone(),
            ),
            stop_activity: StopActivityService::new(
                activity_repository.clone(),
                clock.clone(),
                activity_state_publisher.clone(),
            ),
            cancel_active_activity: CancelActiveActivityService::new(
                activity_repository.clone(),
                clock.clone(),
                activity_state_publisher.clone(),
            ),
            save_active_activity: SaveActiveActivityService::new(
                activity_repository.clone(),
                category_repository.clone(),
                clock.clone(),
                activity_state_publisher.clone(),
            ),
            save_completed_activity: SaveCompletedActivityService::new(
                activity_repository.clone(),
                category_repository.clone(),
                clock.clone(),
            ),
            delete_completed_activity: DeleteCompletedActivityService::new(
                activity_repository,
                clock.clone(),
            ),
            activity_state_publisher,
        };

        Ok(Self { activity })
    }
}
