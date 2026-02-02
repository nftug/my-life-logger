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
                .iter()
                .map(|activity| ActivityMapper::to_active_model(activity))
                .collect();

            Activities::insert_many(activity_models)
                .exec(&txn)
                .await
                .map_err(log_db_error)?;
        }

        txn.commit().await.map_err(log_db_error)?;

        Ok(())
    }

    async fn load(
        &self,
        ctx: &AuditContext,
        date: NaiveDate,
    ) -> Result<Option<ActivityState>, PersistenceError> {
        let db = self.pool.inner_ref();

        let results = Activities::find()
            .filter(activities::Column::Date.eq(date))
            .find_also_related(categories::Entity)
            .all(db)
            .await
            .map_err(log_db_error)?;

        if results.is_empty() {
            return Ok(None);
        }

        let activities_all: Vec<_> = results
            .into_iter()
            .map(|(activity_model, category_model)| {
                ActivityMapper::to_domain(ctx, activity_model, category_model.unwrap())
            })
            .collect::<Result<_, _>>()?;

        let activity_state = ActivityState::hydrate(date, activities_all)
            .map_err(|err| PersistenceError::DatabaseError(err.to_string()))?;

        Ok(Some(activity_state))
    }
}
