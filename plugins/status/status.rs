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

#[async_trait]
impl Plugin for StatusPlugin {
    fn edit_templates(&self, templates: &mut Templates) {
        // Append "Hello world" to sidebar (similar pattern to auth_basic)
        if let Some(sidebar) = templates.get_mut("sidebar") {
            let target = "<!-- NAVBAR_BOTTOM -->";
            let addition = r#"<style>
		#logout {
			margin-bottom: 0;
		}

		.statusbar {
			width: var(--sidebar-width);
			margin-bottom: 0.4rem;
		}
		.statusbar li {
			margin-top: 0.2rem;
		}

		.statusbar-text-container {
			display: flex;
		}
		.statusbar-text {
			padding-right: 0.4rem;
			padding-left: 0.4rem;
			color: var(--color-text);
			font-size: 0.4em;
		}
		.statusbar-number {
			margin-left: auto;
		}
		.statusbar-progressbar {
			height: 0.3rem;
			margin-right: 0.3rem;
			margin-left: 0.3rem;
			padding: 0.05rem;
			background: var(--color0);
			border-radius: 0.2rem;
		}
		.statusbar-progressbar span {
			display: block;
			width: 50%;
			height: 100%;
			background: var(--color1);
			border-top-left-radius: 0.5rem;
			border-top-right-radius: 0.2rem;
			border-bottom-right-radius: 0.2rem;
			border-bottom-left-radius: 0.5rem;
		}
	</style>
	<ul class="statusbar">
		<li>
			<div class="statusbar-text-container">
				<span class="statusbar-text">CPU</span>
				<span class="statusbar-text statusbar-number"
					>{{ .status.CPUUsage }}%</span
				>
			</div>
			<div class="statusbar-progressbar">
				<span style="width: {{ .status.CPUUsage }}%"></span>
			</div>
		</li>
		<li>
			<div class="statusbar-text-container">
				<span class="statusbar-text">RAM</span>
				<span class="statusbar-text statusbar-number"
					>{{ .status.RAMUsage }}%</span
				>
			</div>
			<div class="statusbar-progressbar">
				<span style="width: {{ .status.RAMUsage }}%"></span>
			</div>
		</li>
		<li>
			<div class="statusbar-text-container">
				<span class="statusbar-text">DISK</span>
				<span
					style="margin: auto; font-size: 0.35rem"
					class="statusbar-text"
					>{{ .status.DiskUsageFormatted }}</span
				>
				<span class="statusbar-text statusbar-number"
					>{{ .status.DiskUsage }}%</span
				>
			</div>
			<div class="statusbar-progressbar">
				<span style="width: {{ .status.DiskUsage }}%"></span>
			</div>
		</li>
	</ul>"#;
			// Mock status data struct.
			struct Status {
				cpu_usage: u8,
				ram_usage: u8,
				disk_usage: u8,
				disk_usage_formatted: String,
			}

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
