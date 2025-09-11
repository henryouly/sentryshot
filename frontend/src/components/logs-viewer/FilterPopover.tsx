import { createSignal, For, type Component } from 'solid-js';
import LogBadge from './LogBadge';
import Filter from 'lucide-solid/icons/filter';

type Props = {
  levels: string[];
  monitors: string[];
  availableMonitors: string[];
  onChange: (levels: string[], monitors: string[]) => void;
};

const ALL_LEVELS = ['error', 'warning', 'info', 'debug'];
const DEFAULT_LEVELS = ['error', 'warning', 'info'];

const FilterPopover: Component<Props> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [selLevels, setSelLevels] = createSignal<string[]>(props.levels ?? DEFAULT_LEVELS);
  const [selMonitors, setSelMonitors] = createSignal<string[]>(props.monitors ?? []);

  function toggleLevel(l: string) {
    setSelLevels((prev) => (prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]));
  }

  function toggleMonitor(m: string) {
    setSelMonitors((prev) => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));
  }

  function apply() {
    props.onChange(selLevels(), selMonitors());
    setOpen(false);
  }

  function reset() {
    setSelLevels(DEFAULT_LEVELS);
    setSelMonitors([]);
  }

  return (
    <div class="relative">
      <button class="btn btn-square btn-ghost" onClick={() => setOpen(v => !v)} aria-expanded={open()} title="Filters">
        <Filter class="w-4 h-4" />
      </button>

      {open() && (
        <div class="absolute right-0 z-20 mt-2 p-4 bg-base-100 border border-gray-300 rounded shadow w-72">
          <div class="mb-3">
            <div class="font-medium mb-2">Levels</div>
            <div class="flex gap-2 flex-wrap">
              <For each={ALL_LEVELS}>{level => (
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selLevels().includes(level)} onChange={() => toggleLevel(level)} />
                  <LogBadge level={level} />
                  <span class="text-sm capitalize">{level}</span>
                </label>
              )}</For>
            </div>
          </div>

          <div class="mb-3">
            <div class="font-medium mb-2">Monitors</div>
            <div class="max-h-40 overflow-auto border border-gray-300 rounded p-2">
              <For each={props.availableMonitors}>{m => (
                <label class="flex items-center gap-2">
                  <input type="checkbox" checked={selMonitors().includes(m)} onChange={() => toggleMonitor(m)} />
                  <span class="text-sm">{m}</span>
                </label>
              )}</For>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button class="btn btn-sm" onClick={reset}>Reset</button>
            <button class="btn btn-sm btn-primary" onClick={apply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPopover;
