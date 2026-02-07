use std::path::PathBuf;

use derive_new::new;

#[derive(new)]
pub struct DatabaseConfig {
    pub database_path: PathBuf,
}
