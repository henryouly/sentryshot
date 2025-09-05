import { useEffect, useRef } from 'react';

// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/recordings";
// @ts-ignore: This module is legacy and has no types
import { newMonitorNameByID, setGlobals } from "@/components/viewer/libs/common";

// Helper function to fetch environment data
async function fetchEnvData(signal: AbortSignal) {
  try {
    const res = await fetch('/frontend/api/env', { signal });
    if (!res.ok) {
      throw new Error(`API call failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // The request was intentionally cancelled, no need to log
      return {};
    }
    console.warn('Failed to fetch /frontend/api/env', err);
    return {};
  }
}

export default function Recordings() {
  const contentGridRef = useRef<HTMLDivElement>(null);
  const gridSize = 3; // Default grid size for recordings view

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const initializeViewer = async () => {
      try {
        const fetchedData = await fetchEnvData(signal);

        // Merge fetched data with default env vars
        setGlobals({
          currentPage: 'frontend/live',
          isAdmin: true,
          flags: fetchedData.flags || {},
          monitors: fetchedData.monitorConfig || {},
          monitorsInfo: fetchedData.monitorsInfo || [],
          monitorGroups: fetchedData.monitorGroup || {},
          logSources: fetchedData.logSources || [],
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC',
          csrfToken: fetchedData.csrfToken || '',
        });


        // Check if the DOM element exists before creating the viewer
        if (contentGridRef.current) {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
          const isAdmin = true;
          const csrfToken = fetchedData.csrfToken || '';
          const monitorNameByID = newMonitorNameByID(fetchedData.monitorsInfo);

          const viewer = newViewer(monitorNameByID, contentGridRef.current, tz, isAdmin, csrfToken);
          viewer.setGridSize(gridSize);
          viewer.reset();
        }

      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    initializeViewer();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div>
      <div
        ref={contentGridRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, overflowY: "auto" }}
      />
    </div>
  );
}
