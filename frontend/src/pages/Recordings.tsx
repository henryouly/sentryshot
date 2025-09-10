import { createEffect, createResource, createSignal, type Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';
import Plus from 'lucide-solid/icons/plus';
import Minus from 'lucide-solid/icons/minus';

// @ts-ignore: legacy module without types
import { newViewer } from "@/components/viewer/recordings";
// @ts-ignore: legacy module without types
import { setGlobals, newMonitorNameByID } from "@/components/viewer/libs/common";

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

const Recordings: Component = () => {
  let contentGridRef;
  const MIN_GRID = 1;
  const MAX_GRID = 4;
  const [gridSize, setGridSize] = createSignal<number>(3);

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
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
        const isAdmin = true;
        const csrfToken = env.csrfToken || '';
        const monitorNameByID = newMonitorNameByID(env.monitorsInfo);

        const viewer = newViewer(monitorNameByID, contentGridRef, tz, isAdmin, csrfToken);
        viewer.setGridSize(gridSize());
        viewer.reset();
      }
    }
  });

  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content w-full">
        <div class="flex items-center gap-2 p-2">
          <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
            <PanelLeft class='w-4 h-4' />
          </label>
          <button
            type="button"
            class="btn btn-square btn-ghost"
            aria-label="Decrease grid size"
            onClick={() => setGridSize((s) => Math.max(MIN_GRID, s - 1))}
            disabled={gridSize() <= MIN_GRID}
          >
            <Plus class='w-4 h-4' />
          </button>
          <button
            type="button"
            class="btn btn-square btn-ghost"
            aria-label="Increase grid size"
            onClick={() => setGridSize((s) => Math.min(MAX_GRID, s + 1))}
            disabled={gridSize() >= MAX_GRID}
          >
            <Minus class='w-4 h-4' />
          </button>
        </div>
        <div
          ref={contentGridRef}
          style={{ display: "grid", "grid-template-columns": `repeat(${gridSize()}, 1fr)`, "overflow-y": "auto" }}
        />
      </div>
      <AppSidebar />
    </div>
  );
};

export default Recordings;
