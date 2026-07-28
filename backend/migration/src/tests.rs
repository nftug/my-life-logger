use sea_orm_migration::{
    MigrationTrait, SchemaManager,
    sea_orm::{ConnectionTrait, Database},
};

use crate::m20220101_000001_create_table::Migration;

#[tokio::test]
async fn category_name_index_rejects_case_insensitive_duplicates() {
    let database = Database::connect("sqlite::memory:")
        .await
        .expect("in-memory database should connect");
    Migration
        .up(&SchemaManager::new(&database))
        .await
        .expect("schema and unique index should be created");

    database
        .execute_unprepared("INSERT INTO categories (id, name) VALUES ('1', 'Work')")
        .await
        .expect("first category should be inserted");
    let result = database
        .execute_unprepared("INSERT INTO categories (id, name) VALUES ('2', 'work')")
        .await;

    assert!(result.is_err(), "case-insensitive duplicate should fail");

    let category = database
        .query_one_raw(sea_orm_migration::sea_orm::Statement::from_string(
            sea_orm_migration::sea_orm::DatabaseBackend::Sqlite,
            "SELECT color FROM categories WHERE id = '1'",
        ))
        .await
        .expect("category should load")
        .expect("category should exist");
    let color: String = category
        .try_get("", "color")
        .expect("color should be present");

    assert_eq!(color, "#8B5CF6");
}
