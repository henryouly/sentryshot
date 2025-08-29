// SPDX-License-Identifier: GPL-2.0-or-later

use async_trait::async_trait;
use common::{
    LogSource
};
use plugin::{Plugin, PreLoadPlugin, types::{Router, Templates}};
use std::ffi::c_char;
use std::sync::Arc;

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
        None
    }

    fn set_new_auth(&self) -> Option<plugin::types::NewAuthFn> {
        None
    }
}

#[unsafe(no_mangle)]
pub extern "Rust" fn load(_app: &dyn plugin::Application) -> Arc<dyn Plugin> {
    // Create an engine and pre-compile the status template so any syntax
    // errors are discovered at plugin load time.
    let engine = upon::Engine::new();
    // Compile the status template; panic on error since we cannot return
    // a Result from the `load` symbol.
    let template = engine
        .compile(include_str!("templates/status.tpl"))
        .expect("failed to compile status plugin template");

    Arc::new(StatusPlugin { engine, template })
}

struct StatusPlugin {
    engine: upon::Engine<'static>,
    template: upon::Template<'static>,
}

struct Status {
  cpu_usage: u8,
  ram_usage: u8,
  disk_usage: u8,
  disk_usage_formatted: String,
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

    fn route(&self, router: Router) -> Router {
        router
    }
}
