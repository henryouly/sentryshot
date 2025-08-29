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
    Arc::new(StatusPlugin {})
}

struct StatusPlugin;

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
            let addition = include_str!("templates/status.tpl");

            // Mock status data.
            let status = Status {
              cpu_usage: 42,
              ram_usage: 33,
              disk_usage: 73,
              disk_usage_formatted: "120G / 160G".to_string(),
            };

            // Replace template tokens with mock values so the upon template
            // engine sees concrete values when rendering.
            let mut filled = addition.to_string();
            filled = filled.replace("{{ .status.CPUUsage }}", &format!("{}", status.cpu_usage));
            filled = filled.replace("{{ .status.RAMUsage }}", &format!("{}", status.ram_usage));
            filled = filled.replace("{{ .status.DiskUsage }}", &format!("{}", status.disk_usage));
            filled = filled.replace(
              "{{ .status.DiskUsageFormatted }}",
              &status.disk_usage_formatted,
            );

            *sidebar = sidebar.replace(target, &(filled + target));
        }
    }

    fn route(&self, router: Router) -> Router {
        router
    }
}
