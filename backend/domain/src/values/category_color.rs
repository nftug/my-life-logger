use std::fmt;

use crate::shared::errors::DomainError;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CategoryColor(String);

impl CategoryColor {
    pub fn new(value: String) -> Result<Self, DomainError> {
        if value.len() != 7
            || !value.starts_with('#')
            || !value.as_bytes()[1..].iter().all(u8::is_ascii_hexdigit)
        {
            return Err(DomainError::InvalidCategoryColor);
        }

        Ok(Self(value.to_ascii_uppercase()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for CategoryColor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::CategoryColor;
    use crate::shared::errors::DomainError;

    #[test]
    fn normalizes_valid_colors_to_uppercase() {
        let color = CategoryColor::new("#f43f5e".to_owned()).expect("color should be valid");

        assert_eq!(color.as_str(), "#F43F5E");
    }

    #[test]
    fn rejects_invalid_colors() {
        let error = CategoryColor::new("violet".to_owned()).expect_err("color should be invalid");

        assert!(matches!(error, DomainError::InvalidCategoryColor));
    }
}
