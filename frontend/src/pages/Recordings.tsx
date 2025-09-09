import type { Component } from 'solid-js';
import AppSidebar from '@/components/AppSidebar';

const Recordings: Component = () => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col items-center justify-center">
        <label for="my-drawer-2" class="btn btn-primary drawer-button lg:hidden">
          Open drawer
        </label>
        This is the Recordings page.
      </div>
      <AppSidebar />
    </div>
  );
};

export default Recordings;
