import { ColumnDef } from '@tanstack/solid-table';

export type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

export const columns: ColumnDef<LogEntry, any>[] = [
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
  },
];

export const DEFAULT_LOGS: LogEntry[] = [
  { time: 1672531199000000, level: 'info', source: 'system', monitorID: 'mon1', message: 'System started successfully.' },
  { time: 1672531299000000, level: 'warning', source: 'auth', monitorID: 'mon2', message: 'Multiple failed login attempts detected.' },
  { time: 1672531399000000, level: 'error', source: 'database', monitorID: 'mon3', message: 'Database connection lost.' },
  { time: 1672531499000000, level: 'debug', source: 'api', monitorID: 'mon4', message: 'API request received with payload size of 512 bytes.' },
  { time: 1672531599000000, level: 'info', source: 'system', monitorID: 'mon1', message: 'Scheduled backup completed successfully.' },
  { time: 1672531699000000, level: 'error', source: 'payment', monitorID: 'mon5', message: 'Payment processing failed for transaction ID 12345.' },
  { time: 1672531799000000, level: 'warning', source: 'network', monitorID: 'mon6', message: 'High latency detected in network communication.' },
  { time: 1672531899000000, level: 'debug', source: 'auth', monitorID: 'mon2', message: 'User session token refreshed.' },
  { time: 1672531999000000, level: 'info', source: 'api', monitorID: 'mon4', message: 'New user registration completed.' },
  { time: 1672532099000000, level: 'error', source: 'system', monitorID: 'mon1', message: 'Unexpected shutdown due to power failure.' },
];
