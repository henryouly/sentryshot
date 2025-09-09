import type { Component } from 'solid-js';

import { Film, ScrollText, Settings, Video } from 'lucide-solid';

const items = [
  {
    title: "Live View",
    url: "/live",
    icon: Video,
  },
  {
    title: "Recordings",
    url: "/recordings",
    icon: Film,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: ScrollText,
  },
]

const AppSidebar: Component = () => {
  return (
    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        <li class="menu-title mb-2"><span>Sentryshot</span></li>
        {items.map((item) => (
          <li>
            <a href={item.url}>
              <item.icon class='w-4 h-4 mr-1' />
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppSidebar;
