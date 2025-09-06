import { useEffect, useRef } from "react";
import type { EnvData } from "./useEnv";
// @ts-ignore: legacy module without types
import { newViewer } from "@/components/viewer/recordings";
// @ts-ignore: legacy module without types
import { setGlobals, newMonitorNameByID } from "@/components/viewer/libs/common";
import { applyEnvGlobals } from "./useEnv";


export const useRecordingsViewer = ({ envData, contentGridRef, gridSize }: {
  envData?: EnvData;
  contentGridRef: React.RefObject<HTMLDivElement | null>;
  gridSize: number;
}) => {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!envData) {
      return;
    }
    applyEnvGlobals(envData);

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
  }, [envData, contentGridRef]);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.setGridSize(gridSize);
      viewerRef.current.reset();
    }
  }, [gridSize]);

  return viewerRef;
};
