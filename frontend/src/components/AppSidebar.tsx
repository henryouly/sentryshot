import type { Component } from 'solid-js';

const AppSidebar: Component = () => {
  return (
    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        <li><a href="/live">Live View</a></li>
        <li><a href="/recordings">Recordings</a></li>
        <li><a href="/logs">Logs</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </div>
  );
};

export default AppSidebar;
