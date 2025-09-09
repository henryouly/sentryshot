import type { Component } from 'solid-js';

import Film from 'lucide-solid/icons/film';
import ScrollText from 'lucide-solid/icons/scroll-text';
import Settings from 'lucide-solid/icons/settings';
import Video from 'lucide-solid/icons/video';

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
      <ul class="menu bg-base-200 text-base-content min-h-full w-50 p-2">
        <div class="menu-title mb-2"><span>Sentryshot</span></div>
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
