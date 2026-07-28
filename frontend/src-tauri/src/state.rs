use std::{io, sync::Arc};

use application::{
    activity::{
        ActivityStatePublisher, CancelActiveActivityService, DeleteCompletedActivityService,
        GetActivityStateService, SaveActiveActivityService, SaveCompletedActivityService,
        StartActivityService, StopActivityService,
    },
    category::{
        CreateCategoryService, DeleteCategoryService, GetAllCategoriesService,
        RenameCategoryService,
    },
};
use domain::{
    audit::clock::SystemClock,
    interface::{ActivityStateRepository, CategoryRepository},
    service::CategoryNameValidationService,
};
use infrastructure::{
    activity::ActivityStateRepositoryImpl,
    category::CategoryRepositoryImpl,
    database::{ConnectionPool, DatabaseConfig},
};
use tauri::Manager;

pub struct AppState {
    pub activity: ActivityServices,
    pub category: CategoryServices,
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

pub struct CategoryServices {
    pub create_category: CreateCategoryService,
    pub rename_category: RenameCategoryService,
    pub delete_category: DeleteCategoryService,
    pub get_all_categories: GetAllCategoriesService,
}

impl AppState {
    pub async fn new(app: &tauri::App) -> Result<Self, anyhow::Error> {
        let app_config_dir = app.path().app_config_dir()?;
        std::fs::create_dir_all(&app_config_dir)?;
        let database_config = DatabaseConfig::new(app_config_dir.join("my_life_logger.db"));

        let pool = ConnectionPool::new(&database_config)
            .await
            .map_err(|err| io::Error::other(err.to_string()))?;

        let activity_repository: Arc<dyn ActivityStateRepository> =
            Arc::new(ActivityStateRepositoryImpl::new(pool.clone()));
        let category_repository: Arc<dyn CategoryRepository> =
            Arc::new(CategoryRepositoryImpl::new(pool));
        let category_name_validation = Arc::new(CategoryNameValidationService::new(
            category_repository.clone(),
        ));

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

        let category = CategoryServices {
            create_category: CreateCategoryService::new(
                category_repository.clone(),
                category_name_validation.clone(),
            ),
            rename_category: RenameCategoryService::new(
                category_repository.clone(),
                category_name_validation,
            ),
            delete_category: DeleteCategoryService::new(category_repository.clone()),
            get_all_categories: GetAllCategoriesService::new(category_repository),
        };

        Ok(Self { activity, category })
    }
}
