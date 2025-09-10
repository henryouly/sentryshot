import { createEffect, createResource, type Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';

// @ts-ignore: legacy module without types
import { newViewer } from "@/components/viewer/live";
// @ts-ignore: legacy module without types
import { setGlobals } from "@/components/viewer/libs/common";

import AppSidebar from '@/components/AppSidebar';


type EnvData = {
  flags?: Record<string, unknown>;
  monitorConfig?: Record<string, unknown>;
  monitorsInfo?: Record<string, unknown>;
  monitor_info?: Record<string, unknown>;
  monitorGroup?: Record<string, unknown>;
  logSources?: Array<unknown>;
  csrfToken?: string;
};

function applyEnvGlobals(envData?: EnvData) {
  if (!envData) return;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";
  // Prefer new snake_case key if present, fall back to old camelCase
  const monitorsInfo = envData.monitorsInfo ?? envData.monitor_info ?? {};

  setGlobals({
    currentPage: "frontend/live",
    isAdmin: true,
    flags: envData.flags || {},
    monitors: envData.monitorConfig || {},
    monitorsInfo,
    monitorGroups: envData.monitorGroup || {},
    logSources: envData.logSources || [],
    tz,
    csrfToken: envData.csrfToken || "",
  });
}

const LiveView: Component = () => {
  let contentGridRef;
  const gridSize = 3;

  const [envData] = createResource<EnvData>(async () => {
    const res = await fetch("/frontend/api/env");
    if (!res.ok) {
      throw new Error(`API call failed with status: ${res.status}`);
    }
    return res.json() as Promise<EnvData>;
  });

  createEffect(() => {
    if (envData.loading) {
      console.log("Loading env data...");
      return;
    }
    if (envData.error) {
      console.error("Error loading env data:", envData.error);
      return;
    }
    const env = envData();
    if (env) {
      applyEnvGlobals(env);
      if (contentGridRef) {
        const viewer = newViewer(contentGridRef, env.monitorsInfo);
        viewer.reset();
      }
    }
  });

  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content w-full">
        <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
          <PanelLeft class='w-4 h-4 mr-1' />
        </label>
        <div
          ref={contentGridRef}
          style={{ display: "grid", "grid-template-columns": `repeat(${gridSize}, 1fr)` }}
        />
      </div>
      <AppSidebar />
    </div>
  );
};

export default LiveView;
