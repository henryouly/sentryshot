import { createEffect, createSignal, type Component } from 'solid-js';

import { A } from "@solidjs/router";

import Film from 'lucide-solid/icons/film';
import ScrollText from 'lucide-solid/icons/scroll-text';
import Settings from 'lucide-solid/icons/settings';
import Video from 'lucide-solid/icons/video';

import ThemeDropdownMenu from '@/components/ThemeDropdownMenu';

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
];

const AppSidebar: Component = () => {
  const theme = localStorage.getItem("theme") ?? "default";
  const [currentTheme, setCurrentTheme] = createSignal<string>(theme);

  createEffect(() => {
    localStorage.setItem("theme", currentTheme());
    document.documentElement.setAttribute("data-theme", currentTheme());
  });

  return (
    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-50 p-2">
        <div class="menu-title mb-2 flex">
          <div class='flex items-center font-bold text-lg'>
            Sentryshot
          </div>
          <ThemeDropdownMenu />
        </div>
        {items.map((item) => (
          <li>
            <A
              href={item.url}
              class="hover:bg-primary! hover:text-primary-content! focus-visible:bg-primary! focus-visible:text-primary-content!"
            >
              <item.icon class='w-4 h-4 mr-1' />
              {item.title}
            </A>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppSidebar;
