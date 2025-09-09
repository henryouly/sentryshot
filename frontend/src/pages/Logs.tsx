import type { Component } from 'solid-js';
import { PanelLeft } from 'lucide-solid';
import AppSidebar from '@/components/AppSidebar';
import { columns, logs } from '@/components/logs-viewer/columns';
import { SolidTable } from '@/components/logs-viewer/SolidTable';

const Logs: Component = () => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
        <PanelLeft class='w-4 h-4 mr-1' />
      </label>
      <div class="drawer-content flex flex-col items-center justify-center">
        <SolidTable data={logs} columns={columns} />
      </div>
      <AppSidebar />
    </div>
  );
};

export default Logs;
