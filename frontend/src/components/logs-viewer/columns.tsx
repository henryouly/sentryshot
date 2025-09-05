"use client"

import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { type Column, type ColumnDef } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

function LevelHeader({ column }: { column: Column<LogEntry, unknown> }) {
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["error", "warning", "info"]);

  useEffect(() => {
    if (column) {
      column.setFilterValue(selectedLevels);
    }
  }, [selectedLevels, column]);

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <span>Level</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Filter className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by level</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["error", "warning", "info", "debug"].map((level) => (
              <DropdownMenuCheckboxItem
                key={level}
                checked={selectedLevels.includes(level)}
                onCheckedChange={(checked) => setSelectedLevels(
                  (prev) => checked ? [...prev, level]
                    : prev.filter((l) => l !== level))}
              >
                {level}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "time",
    header: "Time",
    size: 180,
    cell: ({ row }) => {
      const microseconds = parseFloat(row.getValue("time"));
      const milliseconds = Math.floor(microseconds / 1000);
      const formatted = new Date(milliseconds).toLocaleString();
      return formatted;
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => <LevelHeader column={column} />,
    size: 100,
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: "source",
    header: "Source",
    size: 150,
  },
  {
    accessorKey: "monitorID",
    header: "Monitor ID",
    size: 150,
  },
  {
    accessorKey: "message",
    header: "Message",
    size: 0,
    cell: ({ row }) => {
      const message: string = row.getValue("message");
      return <div className="whitespace-pre-wrap font-mono text-xs">{message}</div>;
    },
  },
]
