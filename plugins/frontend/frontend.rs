use async_trait::async_trait;
use common::{
    ArcLogger, LogSource,
};
use plugin::{Plugin, PreLoadPlugin, types::Router};
use axum::{Json, extract::State, routing::get};
use serde_json::json;
use std::ffi::c_char;
use std::sync::Arc;


#[unsafe(no_mangle)]
pub extern "C" fn version() -> *const c_char {
    plugin::get_version()
}

#[unsafe(no_mangle)]
pub extern "Rust" fn pre_load() -> Box<dyn PreLoadPlugin> {
    Box::new(PreLoadFrontend)
}

struct PreLoadFrontend;

impl PreLoadPlugin for PreLoadFrontend {
    fn add_log_source(&self) -> Option<LogSource> {
        #[allow(clippy::unwrap_used)]
        Some("frontend".try_into().unwrap())
    }
}

#[unsafe(no_mangle)]
pub extern "Rust" fn load(app: &dyn plugin::Application) -> Arc<dyn Plugin> {
    Arc::new(FrontendPlugin::new(app.logger()))
}

struct Settings {
    // Add any configuration settings needed for the plugin here.
}

struct FrontendPlugin {
    logger: ArcLogger,
    settings: Arc<Settings>,
}

impl FrontendPlugin {
    fn new(logger: ArcLogger) -> Self {
        Self { logger, settings: Arc::new(Settings::default()) }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            // Initialize default settings here.
        }
    }
}

#[async_trait]
impl Plugin for FrontendPlugin {
    fn route(&self, router: Router) -> Router {
        // Expose a lightweight API that returns the current status as JSON.
        router.route_no_auth("/frontend/api/config", get(config_api_handler).with_state(self.settings.clone()))
    }
}

async fn config_api_handler(State(settings): State<Arc<Settings>>) -> Json<serde_json::Value> {
    Json(json!({
        "test": "value"
    }))
}
