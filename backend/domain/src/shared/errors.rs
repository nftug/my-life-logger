use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("すでに進行中の活動があります")]
    AlreadyActive,
    #[error("進行中の活動が見つかりません")]
    NoActiveActivity,
    #[error("この活動はすでに停止されています")]
    AlreadyStopped,
    #[error("活動時間の範囲が不正です")]
    InvalidTimeRange,
    #[error("活動が指定した日付に属していません")]
    ActivityNotInSpecifiedDate,
    #[error("活動時間が既存の活動と重複しています")]
    ActivityOverlap,
    #[error("活動が見つかりません")]
    ActivityNotFound,
    #[error("カテゴリが見つかりません")]
    CategoryNotFound,
    #[error("Category name already exists")]
    CategoryNameAlreadyExists,
    #[error("Category color must be in #RRGGBB format")]
    InvalidCategoryColor,
    #[error(transparent)]
    Persistence(#[from] PersistenceError),
    #[error("{0}")]
    GenericError(String),
}

#[derive(Error, Debug)]
pub enum PersistenceError {
    #[error("データベースエラー: {0}")]
    DatabaseError(String),
    #[error("{0}")]
    HydrationError(String),
    #[error("データが見つかりません")]
    NotFound,
}
