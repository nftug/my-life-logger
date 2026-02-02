use domain::entity::{Category, CategoryId};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryResponseDto {
    pub id: CategoryId,
    pub name: String,
}

impl CategoryResponseDto {
    pub fn from_domain(category: &Category) -> Self {
        CategoryResponseDto {
            id: category.id(),
            name: category.name().to_string(),
        }
    }
}
