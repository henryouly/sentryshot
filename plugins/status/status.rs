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
            let addition = "<div class=\"p-2\">Hello world</div>";
            *sidebar = sidebar.replace(target, &(addition.to_owned() + target));
        }
    }

    fn route(&self, router: Router) -> Router {
        router
    }
}
