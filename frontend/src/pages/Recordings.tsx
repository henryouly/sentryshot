import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';

// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/recordings";
// @ts-ignore: This module is legacy and has no types
import { newMonitorNameByID, setGlobals } from "@/components/viewer/libs/common";

export default function Recordings() {
  const contentGridRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [gridSize, setGridSize] = useState(3); // Default grid size for recordings view

  const { data: envData, isLoading, isError } = useQuery({
    queryKey: ['env'],
    queryFn: async ({ signal }) => {
      const res = await fetch('/frontend/api/env', { signal });
      if (!res.ok) {
        throw new Error(`API call failed with status: ${res.status}`);
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (isLoading || isError || !envData) {
      return;
    }

    // Merge fetched data with default env vars
    setGlobals({
      currentPage: 'frontend/live',
      isAdmin: true,
      flags: envData.flags || {},
      monitors: envData.monitorConfig || {},
      monitorsInfo: envData.monitorsInfo || [],
      monitorGroups: envData.monitorGroup || {},
      logSources: envData.logSources || [],
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC',
      csrfToken: envData.csrfToken || '',
    });


    // Check if the DOM element exists before creating the viewer
    if (contentGridRef.current) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
      const isAdmin = true;
      const csrfToken = envData.csrfToken || '';
      const monitorNameByID = newMonitorNameByID(envData.monitorsInfo);

      const viewer = newViewer(monitorNameByID, contentGridRef.current, tz, isAdmin, csrfToken);
      viewerRef.current = viewer;
      viewer.setGridSize(gridSize);
      viewer.reset();
    }

    return () => {
      viewerRef.current?.exitFullscreen();
      viewerRef.current = null;
    };
  }, [envData, isLoading, isError]);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.setGridSize(gridSize);
      viewerRef.current.reset();
    }
  }, [gridSize]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading environment data.</div>;
  }

  return (
    <div>

      <div className="mb-4 flex">
        <Button
          className="mr-2"
          variant={"secondary"}
          aria-label="Decrease grid size"
          onClick={() => setGridSize(Math.max(1, gridSize - 1))}
          disabled={gridSize <= 1}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          className="mr-2"
          variant={"secondary"}
          aria-label="Increase grid size"
          onClick={() => setGridSize(Math.min(4, gridSize + 1))}
          disabled={gridSize >= 4}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={contentGridRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, overflowY: "auto" }}
      />
    </div>
  );
}
