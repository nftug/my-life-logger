use domain::{
    entity::{Category, CategoryId},
    values::CategoryReference,
};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryResponseDto {
    pub id: CategoryId,
    pub name: String,
}

impl From<&Category> for CategoryResponseDto {
    fn from(category: &Category) -> Self {
        CategoryResponseDto {
            id: category.id(),
            name: category.name().to_string(),
        }
    }
}

impl From<&CategoryReference> for CategoryResponseDto {
    fn from(category_reference: &CategoryReference) -> Self {
        CategoryResponseDto {
            id: category_reference.category_id(),
            name: category_reference.name().to_string(),
        }
    }
}
