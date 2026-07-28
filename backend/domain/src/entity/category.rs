use crate::{define_id, shared::EntityIdTrait, values::CategoryColor};

define_id!(CategoryId);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Category {
    id: CategoryId,
    name: String,
    color: CategoryColor,
}

impl Category {
    pub fn id(&self) -> CategoryId {
        self.id
    }
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn color(&self) -> &CategoryColor {
        &self.color
    }

    pub fn hydrate(id: CategoryId, name: String, color: CategoryColor) -> Self {
        Self { id, name, color }
    }

    pub fn new(name: String, color: CategoryColor) -> Self {
        Self {
            id: CategoryId::new_v4(),
            name: name.trim().to_owned(),
            color,
        }
    }

    pub fn rename(&mut self, new_name: String, color: CategoryColor) {
        self.name = new_name.trim().to_owned();
        self.color = color;
    }
}

impl std::fmt::Display for Category {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.name)
    }
}
