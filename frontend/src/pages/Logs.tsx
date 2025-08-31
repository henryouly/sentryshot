import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";

type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

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
  if (time !== undefined) params.set("time", String(time));
  params.set("limit", "100");

  const url = `/api/log/query?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchLogs: ${res.status}`);
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

function fmtTime(us: number) {
  // server uses microseconds in original code; convert to ms
  const ms = Math.floor(us / 1000);
  return new Date(ms).toLocaleString();
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Time</TableHead>
            <TableHead className="w-[100px]">Level</TableHead>
            <TableHead className="w-[150px]">Source</TableHead>
            <TableHead className="w-[150px]">Monitor</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((l, i) => (
              <TableRow key={`${l.time}-${i}`}>
                <TableCell className="font-mono text-xs">
                  {fmtTime(l.time)}
                </TableCell>
                <TableCell>
                  {l.level}
                </TableCell>
                <TableCell className="text-xs font-mono">{l.source ?? "-"}</TableCell>
                <TableCell className="text-xs font-mono">{l.monitorID ?? "-"}</TableCell>
                <TableCell className="whitespace-pre-wrap font-mono text-xs">
                  {l.message}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}