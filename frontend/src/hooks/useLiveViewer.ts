import { useEffect, useRef } from "react";
import type { EnvData } from "./useEnv";
// @ts-ignore: legacy module without types
import { newViewer } from "@/components/viewer/live";
// @ts-ignore: legacy module without types
import { setGlobals } from "@/components/viewer/libs/common";
import { applyEnvGlobals } from "./useEnv";

export function useLiveViewer({
  envData,
  contentGridRef,
  gridSize,
}: {
  envData?: EnvData;
  contentGridRef: React.RefObject<HTMLDivElement | null>;
  gridSize: number;
}) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!envData) return;

    applyEnvGlobals(envData);

    if (contentGridRef.current) {
      const viewer = newViewer(contentGridRef.current, envData.monitorsInfo);
      viewerRef.current = viewer;
      // No grid size API in live viewer; trigger a layout reset
      viewer.reset();
    }

    return () => {
      try {
        viewerRef.current?.exitFullscreen?.();
      } catch {
        /* ignore */
      }
      viewerRef.current = null;
    };
  }, [envData, contentGridRef]);

  useEffect(() => {
    if (viewerRef.current && typeof viewerRef.current.reset === "function") {
      try {
        viewerRef.current.reset();
      } catch {
        /* ignore */
      }
    }
  }, [gridSize]);

  return viewerRef;
}
