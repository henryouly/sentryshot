// SPDX-License-Identifier: GPL-2.0-or-later

use async_trait::async_trait;
use common::{
    ArcLogger, LogSource, LogEntry, LogLevel,
    monitor::ArcMonitor,
};
use plugin::{Plugin, PreLoadPlugin, types::{Router, Templates}};
use axum::{Json, extract::State, routing::get};
use serde_json::json;
use std::ffi::c_char;
use std::sync::{Arc, Mutex};
use thiserror::Error;
use tokio::runtime::Handle;
use tokio::time::Duration;
use tokio_util::sync::CancellationToken;


#[unsafe(no_mangle)]
pub extern "C" fn version() -> *const c_char {
    plugin::get_version()
}

#[unsafe(no_mangle)]
pub extern "Rust" fn pre_load() -> Box<dyn PreLoadPlugin> {
    Box::new(PreLoadStatus)
}

struct PreLoadStatus;

impl PreLoadPlugin for PreLoadStatus {
    fn add_log_source(&self) -> Option<LogSource> {
        #[allow(clippy::unwrap_used)]
        Some("status".try_into().unwrap())
    }

    fn set_new_auth(&self) -> Option<plugin::types::NewAuthFn> {
        None
    }
}

#[unsafe(no_mangle)]
pub extern "Rust" fn load(app: &dyn plugin::Application) -> Arc<dyn Plugin> {
    Arc::new(StatusPlugin::new(app.rt_handle(), app.logger()))
}

struct StatusPlugin {
    rt_handle: Handle,
    logger: ArcLogger,
    status: Arc<Mutex<Status>>,
}

struct Status {
  cpu_usage: u8,
  ram_usage: u8,
  disk_usage: u8,
  disk_usage_formatted: String,
}

#[derive(Debug, Error)]
enum RunError {
}

impl StatusPlugin {
    fn new(rt_handle: Handle, logger: ArcLogger) -> Self {
        let status = Arc::new(Mutex::new(Status {
            cpu_usage: 42,
            ram_usage: 37,
            disk_usage: 67,
            disk_usage_formatted: "120G / 160G".to_string(),
        }));

        Self { rt_handle, logger, status }
    }
}

#[async_trait]
impl Plugin for StatusPlugin {
    fn edit_templates(&self, templates: &mut Templates) {
        if let Some(sidebar) = templates.get_mut("sidebar") {
            let target = "<!-- NAVBAR_BOTTOM -->";
            let addition = include_str!("templates/status.tpl").to_string();
            *sidebar = sidebar.replace(target, &(addition + target));
        }
    }

    async fn on_monitor_start(&self, token: CancellationToken, _monitor: ArcMonitor) {
        let _ = self.run(&token).await;
    }

    fn route(&self, router: Router) -> Router {
        // Expose a lightweight API that returns the current status as JSON.
        router.route_no_auth("/api/status", get(status_api_handler).with_state(self.status.clone()))
    }
}

async fn status_api_handler(State(status): State<Arc<Mutex<Status>>>) -> Json<serde_json::Value> {
    let guard = status.lock().unwrap_or_else(|e| e.into_inner());
    Json(json!({
        "cpu_usage": guard.cpu_usage,
        "ram_usage": guard.ram_usage,
        "disk_usage": guard.disk_usage,
        "disk_usage_formatted": guard.disk_usage_formatted,
    }))
}

impl StatusPlugin {
    async fn run(
        &self,
        token: &CancellationToken,
    ) -> Result<(), RunError> {
        loop {
            self.logger.log(LogEntry::new2(LogLevel::Debug, "status", "heartbeat"));

            // Update the shared status (simple simulation for now)
            if let Ok(mut s) = self.status.lock() {
                s.cpu_usage = s.cpu_usage.wrapping_add(1) % 100;
                s.ram_usage = s.ram_usage.wrapping_add(1) % 100;
                s.disk_usage = s.disk_usage.wrapping_add(1) % 100;
                s.disk_usage_formatted = format!("{}G / 160G", 120 + s.disk_usage as i32);
            }

            let sleep = || {
                let _enter = self.rt_handle.enter();
                tokio::time::sleep(Duration::from_secs(10))
            };
            tokio::select! {
                () = token.cancelled() => return Ok(()),
                () = sleep() => {}
            }
        }
    }
}
