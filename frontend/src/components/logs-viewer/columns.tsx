"use client"

import { type ColumnDef } from "@tanstack/react-table"

export type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

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
    header: "Level",
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
