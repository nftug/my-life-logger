use domain::entity::Category;
use sea_orm::ActiveValue::Set;

use crate::database::entity::categories;

pub struct CategoryMapper;

impl CategoryMapper {
    pub fn to_domain(model: categories::Model) -> Category {
        Category::hydrate(model.id.into(), model.name)
    }

    pub fn to_active_model(category: &Category) -> categories::ActiveModel {
        categories::ActiveModel {
            id: Set(category.id().into()),
            name: Set(category.name().to_string()),
        }
    }
}
