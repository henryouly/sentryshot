import { useEffect, useRef, useState } from "react";
import { columns, type LogEntry } from "@/components/logs-viewer/columns";
import { DataTable } from "@/components/logs-viewer/data-table";

const DEFAULT_LEVELS = ["error", "warning", "info"];
const MOCK_LOGS = [
  {
    level: "info",
    source: "app",
    monitorID: "123",
    message: "Application started",
    time: Date.now() * 1000,
  },
  {
    level: "error",
    source: "app",
    monitorID: "123",
    message: "Application crashed",
    time: (Date.now() + 1000) * 1000,
  },
  {
    level: "info",
    source: "app",
    monitorID: "123",
    message: "Application stopped",
    time: (Date.now() + 2000) * 1000,
  }
]

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
  if (time !== undefined) params.set("time", String(time));
  params.set("limit", "100");

  const url = `/api/log/query?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    // throw new Error(`fetchLogs: ${res.status}`);
    return MOCK_LOGS; // Fallback to mock logs on error
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

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchLogs(DEFAULT_LEVELS, [], []);
        if (!mounted) return;
        setLogs(data);
        if (data.length) lastTimeRef.current = data[data.length - 1].time;
      } catch (e) {
        console.error("initial logs fetch failed", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    let running = true;

    (async function pollLoop() {
      while (running) {
        const last = lastTimeRef.current ?? Date.now() * 1000; // microseconds
        const newLogs = await slowPoll(
          DEFAULT_LEVELS,
          [],
          [],
          last,
          controller.signal
        );
        if (!running) break;
        if (newLogs && newLogs.length) {
          setLogs((prev) => {
            const merged = [...prev, ...newLogs];
            // cap
            return merged.slice(-500);
          });
          lastTimeRef.current = newLogs[newLogs.length - 1].time;
        }
        // small delay to avoid hot-loop (server may block until data available)
        await new Promise((r) => setTimeout(r, 100));
      }
    })();

    return () => {
      running = false;
      controller.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = logsContainerRef.current;
      // Only auto-scroll if user is near the bottom
      if (scrollHeight - scrollTop < clientHeight + 200) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 gap-4">
      <DataTable columns={columns} data={logs} />
    </div>
  );
}