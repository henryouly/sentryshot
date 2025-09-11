import { createSignal, For } from 'solid-js';
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/solid-table';
import FilterPopover from './FilterPopover';
import PauseResumeButton from './PauseResumeButton';

interface SolidTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  availableMonitors?: string[];
  filters?: { levels?: string[]; monitors?: string[] };
  onFiltersChange?: (levels: string[], monitors: string[]) => void;
  paused?: boolean;
  onTogglePause?: () => void;
}

export function SolidTable<T>(props: SolidTableProps<T>) {
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({
    monitorID: false,
    source: false,
  })

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
      get columnVisibility() { return columnVisibility(); },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div class="overflow-hidden border-gray-600 w-full">
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
          availableMonitors={props.availableMonitors ?? []}
          onChange={(levels, monitors) => props.onFiltersChange?.(levels, monitors)}
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
                    <th colSpan={header.colSpan}>
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
