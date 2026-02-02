use derive_new::new;

#[derive(new)]
pub struct DatabaseConfig {
    pub url: String,
}
