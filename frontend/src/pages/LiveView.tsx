import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/live";
// @ts-ignore: This module is legacy and has no types
import { setGlobals } from "@/components/viewer/libs/common";

import { Button } from "@/components/ui/button";

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

  const VideoGrid = ({ initialGridSize }: { initialGridSize: number }) => {
    const [gridSize, setGridSize] = useState(initialGridSize);

    return (
      <div>

        <div className="mb-4 flex">
          <Button
            className="mr-2"
            variant={"secondary"}
            aria-label="Decrease grid size"
            onClick={() => {
              if (contentGridRef.current) {
                setGridSize(Math.max(1, gridSize - 1));
              }
            }}
            disabled={gridSize <= 1}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            className="mr-2"
            variant={"secondary"}
            aria-label="Increase grid size"
            onClick={() => {
              if (contentGridRef.current) {
                setGridSize(Math.min(4, gridSize + 1));
              }
            }}
            disabled={gridSize >= 4}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={contentGridRef}
          style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        />

      </div>
    );
  };

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
    <VideoGrid initialGridSize={3} />
  );
}
