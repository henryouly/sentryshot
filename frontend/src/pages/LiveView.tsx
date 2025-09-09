import { createEffect, type Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';
// @ts-ignore: legacy module without types
import { newViewer } from "@/components/viewer/live";

import AppSidebar from '@/components/AppSidebar';

const LiveView: Component = () => {
  let contentGridRef;
  const gridSize = 3;
  const envData = { monitorsInfo: [] }; // Placeholder for environment data

  createEffect(() => {
    if (contentGridRef) {
      const viewer = newViewer(contentGridRef, envData.monitorsInfo);
      viewer.reset();
    }
  }, [envData, contentGridRef]);

  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
        <PanelLeft class='w-4 h-4 mr-1' />
      </label>
      <div class="drawer-content flex flex-col items-center justify-center">
        <div
          ref={contentGridRef}
          style={{ display: "grid", "grid-template-columns": `repeat(${gridSize}, 1fr)` }}
        />
      </div>
      <AppSidebar />
    </div>
  );
};

export default LiveView;
