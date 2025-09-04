import { useEffect, useRef } from "react";
// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/live";
// @ts-ignore: This module is legacy and has no types
import { setGlobals } from "@/components/viewer/libs/common";

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
    // Set global variables for the viewer module
    setGlobals({
      currentPage: 'frontend/live',
      csrfToken: import.meta.env.VITE_CSRF_TOKEN,
      flags: JSON.parse(import.meta.env.VITE_FLAGS),
      isAdmin: true,
      tz: import.meta.env.VITE_TZ,
      logSources: JSON.parse(import.meta.env.VITE_LOG_SOURCES),
      monitorGroups: JSON.parse(import.meta.env.VITE_MONITOR_GROUPS),
      monitors: JSON.parse(import.meta.env.VITE_MONITORS),
      monitorsInfo: JSON.parse(import.meta.env.VITE_MONITORS_INFO),
    });

    const viewer = newViewer(
      contentGridRef.current!,
      JSON.parse(import.meta.env.VITE_MONITORS_INFO)
    );
    viewer.reset();

    return () => {
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
