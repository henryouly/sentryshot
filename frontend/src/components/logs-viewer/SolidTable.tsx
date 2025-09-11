import { createEffect, createSignal, For } from 'solid-js';
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/solid-table';
import FilterPopover from './FilterPopover';
import PauseResumeButton from './PauseResumeButton';

interface SolidTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  availableSources?: string[];
  availableMonitors?: string[];
  filters?: { levels?: string[]; sources?: string[], monitors?: string[] };
  paused?: boolean;
  onTogglePause?: () => void;
}

export function SolidTable<T>(props: SolidTableProps<T>) {
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([])
  const [selectedLevels, setSelectedLevels] = createSignal<string[]>(props.filters?.levels ?? []);
  const [selectedSources, setSelectedSources] = createSignal<string[]>(props.filters?.sources ?? []);
  const [selectedMonitors, setSelectedMonitors] = createSignal<string[]>(props.filters?.monitors ?? []);

  const table = createSolidTable({
    get data() { return props.data; },
    get columns() { return props.columns; },
    state: {
      get sorting() {
        return [
          {
            id: 'time',
            desc: true
          }
        ]
      },
      get columnFilters() { return columnFilters(); },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
  });

  createEffect(() => {
    const column = table.getColumn("level");
    if (column) {
      column.setFilterValue(selectedLevels());
    }
  });

  createEffect(() => {
    const column = table.getColumn("source");
    if (column) {
      column.setFilterValue(selectedSources());
    }
  });

  createEffect(() => {
    const column = table.getColumn("monitorID");
    if (column) {
      column.setFilterValue(selectedMonitors());
    }
  });

  return (
    <div class="overflow-hidden border-gray-600 w-full h-full">
      <div class='flex items-center p-4 gap-2'>
        <input
          placeholder="Filter messages..."
          class="input p-2 border"
          value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
          onInput={e => table.getColumn("message")?.setFilterValue(e.target.value)}
        />
        <FilterPopover
          levels={props.filters?.levels ?? []}
          monitors={props.filters?.monitors ?? []}
          availableSources={props.availableSources ?? []}
          availableMonitors={props.availableMonitors ?? []}
          onChange={(levels, sources, monitors) => {
            setSelectedLevels(levels);
            setSelectedSources(sources);
            setSelectedMonitors(monitors);
          }}
        />
        <PauseResumeButton paused={!!props.paused} onToggle={() => props.onTogglePause?.()} />
      </div>
      <table class="table table-sm lg:table-md table-zebra w-full">
        <thead>
          <For each={table.getHeaderGroups()}>
            {headerGroup => (
              <tr>
                <For each={headerGroup.headers}>
                  {header => (
                    <th colSpan={header.colSpan} >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {row => (
              <tr>
                <For each={row.getVisibleCells()}>
                  {cell => (
                    <td>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
