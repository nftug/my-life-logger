use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("categories")
                    .if_not_exists()
                    .col(uuid("id").primary_key())
                    .col(string("name"))
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table("activities")
                    .if_not_exists()
                    .col(uuid("id").primary_key())
                    .col(uuid("category_id"))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-activities-category_id")
                            .from("activities", "category_id")
                            .to("categories", "id")
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .col(string_null("description"))
                    .col(date_time("started_at"))
                    .col(date_time_null("ended_at"))
                    .col(date("date").not_null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("activities").to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table("categories").to_owned())
            .await?;

        Ok(())
    }
}
