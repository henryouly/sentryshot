import type { Component } from 'solid-js';
import { PanelLeft } from 'lucide-solid';
import AppSidebar from '@/components/AppSidebar';

const Logs: Component = () => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
        <PanelLeft class='w-4 h-4 mr-1' />
      </label>
      <div class="drawer-content flex flex-col items-center justify-center">
        This is the Logs page.
      </div>
      <AppSidebar />
    </div>
  );
};

export default Logs;
