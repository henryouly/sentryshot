import { createEffect, createSignal, type Component } from 'solid-js';

import Film from 'lucide-solid/icons/film';
import ScrollText from 'lucide-solid/icons/scroll-text';
import Settings from 'lucide-solid/icons/settings';
import Video from 'lucide-solid/icons/video';
import Palette from 'lucide-solid/icons/palette';

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

const themes = [
  "default",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
].map(t => ({ name: t.charAt(0).toUpperCase() + t.slice(1), value: t }));


const AppSidebar: Component = () => {
  const theme = localStorage.getItem("theme") ?? "default";
  const [currentTheme, setCurrentTheme] = createSignal<string>(theme);

  createEffect(() => {
    localStorage.setItem("theme", currentTheme());
    document.documentElement.setAttribute("data-theme", currentTheme());
  }, [currentTheme]);

  return (
    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-50 p-2">
        <div class="menu-title mb-2 flex">
          <div class='flex items-center font-bold text-lg'>
            Sentryshot
          </div>
          <div class="dropdown dropdown-end ml-auto">
            <div tabindex="0" role="button" class="btn m-1">
              <Palette class='w-4 h-4' />
            </div>
            <ul tabindex="0" class="dropdown-content bg-base-300 rounded-box z-1 w-30 p-2 shadow-2xl">
              {
                themes.map(theme =>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      class="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                      aria-label={theme.name}
                      onChange={() => {
                        setCurrentTheme(theme.value);
                      }}
                      value={theme.value} />
                  </li>
                )
              }
            </ul>
          </div>
        </div>
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
