use axum::{
    Json,
    body::Body,
    extract::{Path, State},
    http::{HeaderMap, StatusCode, header},
    response::{IntoResponse, Redirect, Response},
    routing::get,
};
use async_trait::async_trait;
use common::{
    ArcLogger, LogSource,
};
use plugin::{Plugin, PreLoadPlugin, types::Router};
use rand::{Rng, distr::Alphanumeric};
use rust_embed::{EmbeddedFiles, RustEmbed};
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

struct Env {
    // Add any environment variables needed for the plugin here.
}

struct FrontendPlugin {
    logger: ArcLogger,
    env: Arc<Env>,
    web_assets: EmbeddedFiles,
    etag: String,
}

impl FrontendPlugin {
    fn new(logger: ArcLogger) -> Self {
        let frontend_etag: String = rand::rng()
            .sample_iter(&Alphanumeric)
            .take(8)
            .map(char::from)
            .collect();
        Self { 
            logger, 
            env: Arc::new(Env::default()), 
            web_assets: WebAssets::load(),
            etag: frontend_etag,
        }
    }
}

impl Default for Env {
    fn default() -> Self {
        Self {
            // Initialize default environment variables here.
        }
    }
}

#[async_trait]
impl Plugin for FrontendPlugin {
    fn route(&self, router: Router) -> Router {
        router
            // Expose a lightweight API that returns the current env as JSON.
            .route_no_auth(
                "/frontend/api/env",
                get(api_env_handler).with_state(self.env.clone()),
            )
            // Serve frontend static files.
            // In a production setting, you might want to serve these files directly from a CDN or
            // web server like Nginx for better performance.
            .route_no_auth(
                "/frontend/{*file}",
                get(frontend_handler).with_state((self.web_assets.clone(), self.etag.clone())),
            )
            .route_no_auth(
                "/frontend",
                get(|| async {
                    Redirect::to("/frontend/live")
                }),
            )
    }
}

async fn api_env_handler(State(env): State<Arc<Env>>) -> Json<serde_json::Value> {
    Json(json!({
        "test": "value"
    }))
}

#[derive(RustEmbed)]
#[folder = "../../frontend/dist"]
struct WebAssets;

/// Serve frontend static files, but fall back to `index.html` for SPA client-side routes.
async fn frontend_handler(
    Path(path): Path<String>,
    headers: HeaderMap,
    State(assets_and_etag): State<(EmbeddedFiles, String)>,
) -> Response {
    let (assets, etag) = assets_and_etag;

    if let Some(if_none_match) = headers.get(header::IF_NONE_MATCH) {
        if let Ok(if_none_match) = if_none_match.to_str() {
            if if_none_match == etag {
                return StatusCode::NOT_MODIFIED.into_response();
            }
        }
    }

    if let Some(content) = assets.get(path.as_str()) {
        let body = Body::from(content.clone());
        let mime = mime_guess::from_path(&path).first_or_octet_stream();
        return (
            [
                (header::CONTENT_TYPE, mime.as_ref()),
                (header::ETAG, etag.as_str()),
            ],
            body,
        )
            .into_response();
    }

    if let Some(content) = assets.get("index.html") {
        let body = Body::from(content.clone());
        return (
            [
                (header::CONTENT_TYPE, "text/html; charset=UTF-8"),
                (header::ETAG, etag.as_str()),
            ],
            body,
        )
            .into_response();
    }

    (StatusCode::NOT_FOUND, "404 Not Found").into_response()
}
