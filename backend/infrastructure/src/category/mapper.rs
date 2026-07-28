use domain::{entity::Category, shared::errors::PersistenceError, values::CategoryColor};
use sea_orm::ActiveValue::Set;

use crate::database::entity::categories;

pub struct CategoryMapper;

impl CategoryMapper {
    pub fn to_domain(model: categories::Model) -> Result<Category, PersistenceError> {
        let color = CategoryColor::new(model.color)
            .map_err(|error| PersistenceError::HydrationError(error.to_string()))?;
        Ok(Category::hydrate(model.id.into(), model.name, color))
    }

    pub fn to_active_model(category: &Category) -> categories::ActiveModel {
        categories::ActiveModel {
            id: Set(category.id().into()),
            name: Set(category.name().to_string()),
            color: Set(category.color().to_string()),
        }
    }
}
