import { useQuery } from "@tanstack/react-query";
// @ts-ignore: legacy module without types
import { setGlobals } from "@/components/viewer/libs/common";

export type EnvData = {
  flags?: Record<string, unknown>;
  monitorConfig?: Record<string, unknown>;
  monitorsInfo?: Record<string, unknown>;
  monitor_info?: Record<string, unknown>;
  monitorGroup?: Record<string, unknown>;
  logSources?: Array<unknown>;
  csrfToken?: string;
};

export function applyEnvGlobals(envData?: EnvData) {
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

export function useEnvQuery() {
  return useQuery({
    queryKey: ["env"],
    queryFn: async ({ signal }) => {
      const res = await fetch("/frontend/api/env", { signal });
      if (!res.ok) {
        throw new Error(`API call failed with status: ${res.status}`);
      }
      return res.json() as Promise<EnvData>;
    },
  });
}
