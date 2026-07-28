use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use domain::{
    entity::{Category, CategoryId},
    interface::CategoryRepository,
    service::CategoryNameValidationService,
    shared::errors::PersistenceError,
};

use super::{
    CreateCategoryRequestDto, CreateCategoryService, RenameCategoryIdentityDto,
    RenameCategoryRequestDto, RenameCategoryService,
};
use crate::shared::ApplicationError;

struct TestCategoryRepository {
    categories: Mutex<Vec<Category>>,
}

impl TestCategoryRepository {
    fn new(categories: Vec<Category>) -> Self {
        Self {
            categories: Mutex::new(categories),
        }
    }
}

#[async_trait]
impl CategoryRepository for TestCategoryRepository {
    async fn find_by_id(
        &self,
        category_id: CategoryId,
    ) -> Result<Option<Category>, PersistenceError> {
        Ok(self
            .categories
            .lock()
            .expect("test repository lock should not be poisoned")
            .iter()
            .find(|category| category.id() == category_id)
            .cloned())
    }

    async fn find_by_name(&self, name: &str) -> Result<Option<Category>, PersistenceError> {
        Ok(self
            .categories
            .lock()
            .expect("test repository lock should not be poisoned")
            .iter()
            .find(|category| category.name().eq_ignore_ascii_case(name))
            .cloned())
    }

    async fn find_all(&self) -> Result<Vec<Category>, PersistenceError> {
        Ok(self
            .categories
            .lock()
            .expect("test repository lock should not be poisoned")
            .clone())
    }

    async fn save(&self, category: &Category) -> Result<(), PersistenceError> {
        let mut categories = self
            .categories
            .lock()
            .expect("test repository lock should not be poisoned");

        if let Some(existing) = categories
            .iter_mut()
            .find(|existing| existing.id() == category.id())
        {
            *existing = category.clone();
        } else {
            categories.push(category.clone());
        }

        Ok(())
    }

    async fn delete(&self, category_id: CategoryId) -> Result<(), PersistenceError> {
        let mut categories = self
            .categories
            .lock()
            .expect("test repository lock should not be poisoned");
        let original_len = categories.len();
        categories.retain(|category| category.id() != category_id);

        if categories.len() == original_len {
            return Err(PersistenceError::NotFound);
        }

        Ok(())
    }
}

#[tokio::test]
async fn create_rejects_duplicate_names_after_trimming_and_ignoring_ascii_case() {
    let repository = Arc::new(TestCategoryRepository::new(Vec::new()));
    let category_name_validation = Arc::new(CategoryNameValidationService::new(repository.clone()));
    let service = CreateCategoryService::new(repository.clone(), category_name_validation);

    service
        .handle(CreateCategoryRequestDto {
            name: "Work".to_owned(),
        })
        .await
        .expect("first category should be created");

    for name in ["Work", " Work ", "work"] {
        let error = service
            .handle(CreateCategoryRequestDto {
                name: name.to_owned(),
            })
            .await
            .expect_err("duplicate category name should be rejected");

        assert!(matches!(error, ApplicationError::CategoryNameAlreadyExists));
    }

    let categories = repository.find_all().await.expect("categories should load");
    assert_eq!(categories.len(), 1);
    assert_eq!(categories[0].name(), "Work");
}

#[tokio::test]
async fn rename_rejects_another_category_name_but_allows_its_own_name() {
    let work = Category::new("Work".to_owned());
    let rest = Category::new("Rest".to_owned());
    let rest_id = rest.id();
    let repository = Arc::new(TestCategoryRepository::new(vec![work.clone(), rest]));
    let category_name_validation = Arc::new(CategoryNameValidationService::new(repository.clone()));
    let service = RenameCategoryService::new(repository.clone(), category_name_validation);

    let error = service
        .handle(
            RenameCategoryIdentityDto {
                category_id: rest_id,
            },
            RenameCategoryRequestDto {
                name: " work ".to_owned(),
            },
        )
        .await
        .expect_err("another category's name should be rejected");
    assert!(matches!(error, ApplicationError::CategoryNameAlreadyExists));

    service
        .handle(
            RenameCategoryIdentityDto {
                category_id: work.id(),
            },
            RenameCategoryRequestDto {
                name: " WORK ".to_owned(),
            },
        )
        .await
        .expect("a category should be allowed to retain its own name");

    let renamed = repository
        .find_by_id(work.id())
        .await
        .expect("category should load")
        .expect("category should exist");
    assert_eq!(renamed.name(), "WORK");
}
