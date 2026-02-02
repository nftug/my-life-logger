use async_trait::async_trait;
use chrono::NaiveDate;
use derive_new::new;
use domain::{
    aggregate::ActivityState, audit::AuditContext, interface::ActivityStateRepository,
    shared::errors::PersistenceError,
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, TransactionTrait};

use crate::{
    activity::mapper::ActivityMapper,
    database::{
        ConnectionPool,
        connection_pool::log_db_error,
        entity::{activities, categories, prelude::Activities},
    },
};

#[derive(new)]
pub struct ActivityStateRepositoryImpl {
    pool: ConnectionPool,
}

#[async_trait]
impl ActivityStateRepository for ActivityStateRepositoryImpl {
    async fn load(
        &self,
        ctx: &AuditContext,
        date: NaiveDate,
    ) -> Result<Option<ActivityState>, PersistenceError> {
        let results = Activities::find()
            .filter(activities::Column::Date.eq(date))
            .find_also_related(categories::Entity)
            .all(self.pool.inner_ref())
            .await
            .map_err(log_db_error)?;

        let activities_all: Vec<_> = results
            .into_iter()
            .filter_map(|(a, c_opt)| c_opt.map(|c| ActivityMapper::to_domain(ctx, a, c)))
            .collect::<Result<_, _>>()?;

        if activities_all.is_empty() {
            Ok(None)
        } else {
            Ok(Some(ActivityState::hydrate(date, activities_all)?))
        }
    }

    async fn save(&self, activity_state: &ActivityState) -> Result<(), PersistenceError> {
        let db = self.pool.inner_ref();
        let txn = db.begin().await.map_err(log_db_error)?;

        Activities::delete_many()
            .filter(activities::Column::Date.eq(activity_state.date()))
            .exec(&txn)
            .await
            .map_err(log_db_error)?;

        let activities: Vec<_> = activity_state.all().collect();

        if !activities.is_empty() {
            let activity_models: Vec<_> = activities
                .into_iter()
                .map(ActivityMapper::to_active_model)
                .collect();

            Activities::insert_many(activity_models)
                .exec(&txn)
                .await
                .map_err(log_db_error)?;
        }

        txn.commit().await.map_err(log_db_error)?;

        Ok(())
    }
}
