use crate::{define_id, shared::EntityIdTrait};

define_id!(CategoryId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Category {
    id: CategoryId,
    name: String,
}

impl Category {
    pub fn id(&self) -> CategoryId {
        self.id
    }
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn hydrate(id: CategoryId, name: String) -> Self {
        Self { id, name }
    }

    pub fn new(name: String) -> Self {
        Self {
            id: CategoryId::new_v4(),
            name: name.trim().to_owned(),
        }
    }

    pub fn rename(&mut self, new_name: String) {
        self.name = new_name.trim().to_owned();
    }
}

impl std::fmt::Display for Category {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.name)
    }
}
