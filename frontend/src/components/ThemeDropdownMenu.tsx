import { createEffect, createSignal, type Component } from 'solid-js';
import Palette from 'lucide-solid/icons/palette';

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


const ThemeDropdownMenu: Component = () => {
  const theme = localStorage.getItem("theme") ?? "default";
  const [currentTheme, setCurrentTheme] = createSignal<string>(theme);

  createEffect(() => {
    localStorage.setItem("theme", currentTheme());
    document.documentElement.setAttribute("data-theme", currentTheme());
  }, [currentTheme]);

  return (
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
  );
}
export default ThemeDropdownMenu;
