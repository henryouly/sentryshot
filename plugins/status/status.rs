// SPDX-License-Identifier: GPL-2.0-or-later

use async_trait::async_trait;
use common::{
    ArcLogger, LogSource, LogEntry, LogLevel,
    monitor::ArcMonitor,
};
use plugin::{Plugin, PreLoadPlugin, types::{Router, Templates}};
use std::ffi::c_char;
use std::sync::Arc;
use thiserror::Error;
use tokio::runtime::Handle;
use tokio::time::Duration;
use tokio_util::sync::CancellationToken;
use upon::{Engine, Template};


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
    engine: Engine<'static>,
    template: Template<'static>,
    rt_handle: Handle,
    logger: ArcLogger,
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
        let engine = Engine::new();
        let template = engine
            .compile(include_str!("templates/status.tpl"))
            .expect("failed to compile status plugin template");
        Self { engine, template, rt_handle, logger }
    }
}

#[async_trait]
impl Plugin for StatusPlugin {
    fn edit_templates(&self, templates: &mut Templates) {
        // Append "Hello world" to sidebar (similar pattern to auth_basic)
        if let Some(sidebar) = templates.get_mut("sidebar") {
            let target = "<!-- NAVBAR_BOTTOM -->";

            // Mock status data.
            let status = Status {
              cpu_usage: 42,
              ram_usage: 33,
              disk_usage: 73,
              disk_usage_formatted: "120G / 160G".to_string(),
            };

            let rendered = self
                .template
                .render(
                    &self.engine,
                    upon::value! { status: { 
                        CPUUsage: status.cpu_usage,
                        RAMUsage: status.ram_usage,
                        DiskUsage: status.disk_usage,
                        DiskUsageFormatted: status.disk_usage_formatted,
                    } },
                )
                .to_string()
                .expect("failed to render status template");

            *sidebar = sidebar.replace(target, &(rendered + target));
        }
    }

    async fn on_monitor_start(&self, token: CancellationToken, _monitor: ArcMonitor) {
        let _ = self.run(&token).await;
    }

    fn route(&self, router: Router) -> Router {
        router
    }
}

impl StatusPlugin {
    async fn run(
        &self,
        token: &CancellationToken,
    ) -> Result<(), RunError> {
        loop {
            self.logger.log(LogEntry::new2(LogLevel::Debug, "status", "heartbeat"));

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
