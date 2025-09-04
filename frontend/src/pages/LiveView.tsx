import { useEffect, useRef } from "react";
// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/live";
// @ts-ignore: This module is legacy and has no types
import { setGlobals } from "@/components/viewer/libs/common";

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

export default function LiveView() {
  const contentGridRef = useRef<HTMLDivElement>(null);

  const VideoGrid = ({ gridSize }: { gridSize: number }) => {
    return (
      <div
        ref={contentGridRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      />
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const initializeViewer = async () => {
      // Create a single object with the environment variables
      const envVars = {
        csrfToken: import.meta.env.VITE_CSRF_TOKEN,
        tz: import.meta.env.VITE_TZ,
        logSources: JSON.parse(import.meta.env.VITE_LOG_SOURCES),
        monitorGroups: JSON.parse(import.meta.env.VITE_MONITOR_GROUPS),
      };

      try {
        const fetchedData = await fetchEnvData(signal);

        // Merge fetched data with default env vars
        setGlobals({
          currentPage: 'frontend/live',
          isAdmin: true,
          ...envVars,
          flags: fetchedData.flags,
          monitors: fetchedData.monitorConfig,
          monitorsInfo: fetchedData.monitorsInfo,
        });

        // Check if the DOM element exists before creating the viewer
        if (contentGridRef.current) {
          const viewer = newViewer(contentGridRef.current, fetchedData.monitorsInfo);
          viewer.reset();
        }

      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    initializeViewer();

    return () => {
      // Abort the fetch request if the component unmounts
      controller.abort();
      // Cleanup placeholders the module populated (best-effort)
      contentGridRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div>
      <VideoGrid gridSize={3} />
    </div>
  );
}
