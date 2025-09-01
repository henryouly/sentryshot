"use client"

import { Filter } from "lucide-react";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table"

export type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

function LevelHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <span>Level</span>
        <button
          aria-label="Level filter"
          onClick={() => setOpen((s) => !s)}
          className="p-1 rounded hover:bg-gray-200"
          title="Filter levels"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
      {open && <div className="absolute z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
        <div className="p-2">
          <select className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>}
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
    header: () => <LevelHeader />,
    size: 100,
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
