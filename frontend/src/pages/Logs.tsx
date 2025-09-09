import type { Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';

import AppSidebar from '@/components/AppSidebar';
import { columns, logs } from '@/components/logs-viewer/columns';
import { SolidTable } from '@/components/logs-viewer/SolidTable';

const Logs: Component = () => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content w-full">
        <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden  top-4 left-4">
          <PanelLeft class='w-4 h-4 mr-1' />
        </label>
        <SolidTable data={logs} columns={columns} />
      </div>
      <AppSidebar />
    </div>
  );
};

export default Logs;
