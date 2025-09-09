import type { Component } from 'solid-js';
import PanelLeft from 'lucide-solid/icons/panel-left';

import AppSidebar from '@/components/AppSidebar';

const Recordings: Component = () => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <label for="my-drawer-2" class="btn btn-ghost drawer-button lg:hidden">
        <PanelLeft class='w-4 h-4 mr-1' />
      </label>
      <div class="drawer-content flex flex-col items-center justify-center">
        This is the Recordings page.
      </div>
      <AppSidebar />
    </div>
  );
};

export default Recordings;
