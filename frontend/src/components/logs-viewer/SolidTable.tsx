import { For } from 'solid-js';
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/solid-table';

interface SolidTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
}

export function SolidTable<T>(props: SolidTableProps<T>) {
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
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div class="overflow-hidden border-gray-600 w-full">
      <table class="table table-auto">
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
