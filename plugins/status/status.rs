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
use sysinfo::{Disks, System};
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
    system: Mutex<System>,
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
            cpu_usage: 0,
            ram_usage: 0,
            disk_usage: 0,
            disk_usage_formatted: "Loading...".to_string(),
        }));

        let sys = System::new_all();

        Self { rt_handle, logger, status, system: Mutex::new(sys) }
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
    let guard = match status.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            eprintln!("Status mutex poisoned in status_api_handler; recovering inner value.");
            poisoned.into_inner()
        }
    };
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
            let (cpu_usage, ram_usage) = {
                let mut sys = match self.system.lock() {
                    Ok(guard) => guard,
                    Err(poisoned) => {
                        self.logger.log(LogEntry::new2(
                            LogLevel::Warn,
                            "status",
                            "Mutex poisoned while locking system; using inner value.",
                        ));
                        poisoned.into_inner()
                    }
                };
                sys.refresh_cpu_usage();
                sys.refresh_memory();

                let cpu_usage = sys.global_cpu_usage() as u8;

                let total_mem = sys.total_memory(); // KB
                let used_mem = sys.used_memory(); // KB
                let ram_usage = if total_mem > 0 {
                    ((used_mem as f64 / total_mem as f64) * 100.0).round() as u8
                } else {
                    0
                };

                self.logger.log(LogEntry::new2(LogLevel::Debug, "status", format!("CPU {}%, RAM {}%", cpu_usage, ram_usage).as_str()));

                (cpu_usage, ram_usage)
            };

            // Compute disk metrics from a freshly refreshed disk list.
            let (disk_usage_percent, disk_formatted) = {
                let mut disk_usage_percent = 0_u8;
                let mut disk_formatted = String::new();
                // Build a refreshed disk list locally instead of depending on `sys.disks()`.
                let disks = Disks::new_with_refreshed_list();
                if let Some(disk) = disks.iter().max_by_key(|d| d.total_space()) {
                    let total = disk.total_space();
                    let available = disk.available_space();
                    if total > 0 {
                        let used = total - available;
                        disk_usage_percent = ((used as f64 / total as f64) * 100.0).round() as u8;
                    }
                    // Format in GiB for readability.
                    let used_gib = (total - available) as f64 / (1024.0 * 1024.0 * 1024.0);
                    let total_gib = total as f64 / (1024.0 * 1024.0 * 1024.0);
                    disk_formatted = format!("{:.0}G / {:.0}G", used_gib, total_gib);
                }
                (disk_usage_percent, disk_formatted)
            };

            if let Ok(mut s) = self.status.lock() {
                s.cpu_usage = cpu_usage;
                s.ram_usage = ram_usage;
                s.disk_usage = disk_usage_percent;
                s.disk_usage_formatted = disk_formatted;
            }

            let sleep = || {
                let _enter = self.rt_handle.enter();
                tokio::time::sleep(Duration::from_secs(30))
            };
            tokio::select! {
                () = token.cancelled() => return Ok(()),
                () = sleep() => {}
            }
        }
    }
}
