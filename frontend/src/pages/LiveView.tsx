import { useEffect, useRef } from "react";
// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/live";

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
    const SCRIPT_ID = "sentryshot-live-runtime-module";

    {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;

      // Get these from .env.local for now. Switch to json from rust backend later.
      s.textContent = `
        const CurrentPage = 'frontend/live';
        const CSRFToken = '${import.meta.env.VITE_CSRF_TOKEN}';
        const Flags = JSON.parse('${import.meta.env.VITE_FLAGS}');
        const IsAdmin = true;
        const TZ = '${import.meta.env.VITE_TZ}';
        const LogSources = JSON.parse('${import.meta.env.VITE_LOG_SOURCES}');
        const MonitorGroups = JSON.parse('${import.meta.env.VITE_MONITOR_GROUPS}');
        const Monitors = JSON.parse('${import.meta.env.VITE_MONITORS}');
        const MonitorsInfo = JSON.parse('${import.meta.env.VITE_MONITORS_INFO}');
      `;
      document.body.appendChild(s);
    }

    const viewer = newViewer(
      contentGridRef.current!,
      JSON.parse(import.meta.env.VITE_MONITORS_INFO)
    );
    viewer.reset();

    return () => {
      // Remove the runtime module script on unmount
      const s = document.getElementById(SCRIPT_ID);
      if (s && s.parentElement) s.parentElement.removeChild(s);

      // Cleanup placeholders the module populated (best-effort)
      contentGridRef.current?.replaceChildren();
    };
  }, []);

  return (
    <>
      <div style={{ visibility: "hidden" }}>
        <button id="topbar-options-btn" style={{ visibility: "hidden" }}>
          <img
            className="icon-filter p-3"
            style={{ aspectRatio: "1", width: "var(--topbar-height)" }}
            src="assets/icons/feather/sliders.svg"
          />
        </button>
      </div>
      <VideoGrid gridSize={3} />
    </>
  );
}
