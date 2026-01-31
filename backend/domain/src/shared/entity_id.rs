#[macro_export]
macro_rules! define_id {
    ($id_type: ident) => {
        #[derive(
            Debug, Clone, Copy, PartialEq, Eq, Hash, Default, serde::Deserialize, serde::Serialize,
        )]
        #[serde(into = "uuid::Uuid", from = "uuid::Uuid")]
        pub struct $id_type(uuid::Uuid);

        impl $id_type {
            pub fn raw(self) -> uuid::Uuid {
                self.0
            }
        }

        impl $crate::shared::entity_id::id_type::EntityIdTrait for $id_type {}

        impl From<uuid::Uuid> for $id_type {
            fn from(u: uuid::Uuid) -> Self {
                Self(u)
            }
        }

        impl From<$id_type> for uuid::Uuid {
            fn from(id: $id_type) -> Self {
                id.0
            }
        }

        impl std::str::FromStr for $id_type {
            type Err = Box<dyn std::error::Error>;
            fn from_str(s: &str) -> Result<Self, Self::Err> {
                Ok(Self(uuid::Uuid::parse_str(s)?))
            }
        }

        impl std::fmt::Display for $id_type {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }
    };
}

pub mod id_type {
    use uuid::Uuid;

    pub trait EntityIdTrait:
        Sized + Clone + std::fmt::Debug + PartialEq + Eq + Copy + From<Uuid> + Into<Uuid>
    {
        fn new() -> Self {
            Self::from(Uuid::new_v4())
        }
    }
}

pub use define_id;
pub use id_type::EntityIdTrait;
