import { createEffect, createSignal, type Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';

import AppSidebar from '@/components/AppSidebar';
import { columns, DEFAULT_LOGS, type LogEntry } from '@/components/logs-viewer/columns';
import { SolidTable } from '@/components/logs-viewer/SolidTable';

const DEFAULT_LEVELS = ["error", "warning", "info"];

async function fetchLogs(
  levels: string[],
  sources: string[],
  monitors: string[],
  time?: number
): Promise<LogEntry[]> {
  const params = new URLSearchParams();
  if (levels.length) params.set("levels", levels.join(","));
  if (sources.length) params.set("sources", sources.join(","));
  if (monitors.length) params.set("monitors", monitors.join(","));
  if (time !== undefined) {
    params.set("time", String(time));
  } else {
    // Set default time to now - 5secs.
    params.set("time", String(Date.now() * 1000 - 5 * 1000 * 1000));
  }
  params.set("limit", "100");

  const url = `/api/log/query?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    // throw new Error(`fetchLogs: ${res.status}`);
    return DEFAULT_LOGS; // Fallback to mock logs on error
  }
  return (await res.json()) as LogEntry[];
}

async function slowPoll(
  levels: string[],
  sources: string[],
  monitors: string[],
  time: number,
  signal: AbortSignal
): Promise<LogEntry[] | null> {
  const params = new URLSearchParams();
  if (levels.length) params.set("levels", levels.join(","));
  if (sources.length) params.set("sources", sources.join(","));
  if (monitors.length) params.set("monitors", monitors.join(","));
  params.set("time", String(time));
  params.set("limit", "200");
  const url = `/api/log/slow-poll?${params.toString()}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    return (await res.json()) as LogEntry[];
  } catch (e) {
    if ((e as any)?.name === "AbortError") return null;
    console.error(e);
    return null;
  }
}

const Logs: Component = () => {
  const [logs, setLogs] = createSignal<LogEntry[]>([]);
  let lastTimeRef: number | undefined = undefined;

  createEffect(() => {
    (async () => {
      try {

        const data = await fetchLogs(DEFAULT_LEVELS, [], []);
        setLogs(data);
        if (data.length) {
          lastTimeRef = data[data.length - 1].time;
        }
      } catch (e) {
        console.error("initial logs fetch failed", e);
      }
    })();
  });

  createEffect(() => {
    const abortController = new AbortController();
    let running = true;
    (async () => {
      while (running) {
        const last = lastTimeRef ?? Date.now() * 1000;
        const newLogs = await slowPoll(DEFAULT_LEVELS, [], [], last, abortController.signal);
        if (!running) break;
        if (newLogs && newLogs.length) {
          setLogs((prev) => [...prev, ...newLogs].slice(-500)); // Keep last 500 logs
          lastTimeRef = newLogs[newLogs.length - 1].time;
        }
        // small delay to avoid hot-loop (server may block until data available)
        await new Promise((r) => setTimeout(r, 100));
      }
    })();
  });

  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content w-full">
        <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden  top-4 left-4">
          <PanelLeft class='w-4 h-4 mr-1' />
        </label>
        <SolidTable data={logs()} columns={columns} />
      </div>
      <AppSidebar />
    </div>
  );
};

export default Logs;
