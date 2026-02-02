use derive_new::new;

use crate::entity::{Category, CategoryId};

#[derive(Debug, Clone, PartialEq, Eq, new)]
pub struct CategoryReference {
    category_id: CategoryId,
    name: String,
}

impl CategoryReference {
    pub fn category_id(&self) -> CategoryId {
        self.category_id
    }

    pub fn name(&self) -> &str {
        &self.name
    }
}

impl From<Category> for CategoryReference {
    fn from(category: Category) -> Self {
        CategoryReference::new(category.id(), category.name().to_string())
    }
}
