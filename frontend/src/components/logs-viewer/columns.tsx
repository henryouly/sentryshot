import { ColumnDef } from '@tanstack/solid-table';
import LogBadge from './LevelBadge';
import SourceBadge from './SourceBadge';

export type LogEntry = {
  level: string;
  source?: string;
  monitorID?: string;
  message: string;
  time: number; // microseconds like server
};

export const columns: ColumnDef<LogEntry, any>[] = [
  {
    accessorKey: 'time',
    header: 'Time',
    cell: ({ row }) => {
      const microseconds = parseFloat(row.getValue('time'));
      const milliseconds = Math.floor(microseconds / 1000);
      const d = new Date(milliseconds);
      const short = d.toLocaleTimeString();
      const full = d.toISOString();
      return <span title={full}>{short}</span>;
    },
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const lv = row.getValue('level') as string;
      return <LogBadge level={lv} />;
    },
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => {
      const msg = row.getValue('message') as string;
      return <div>{msg}</div>;
    },
  },
  {
    accessorKey: 'source',
    header: () => <span class='hidden md:table-cell'>Source</span>,
    cell: ({ row }) => {
      const source = row.getValue('source') as string;
      return <span class='hidden md:table-cell'><SourceBadge source={source} /></span>;
    },
    filterFn: 'arrIncludesSome',
  },
  {
    accessorKey: 'monitorID',
    header: () => <span class='hidden md:table-cell'>Monitor</span>,
    cell: ({ row }) => {
      const monitorID = row.getValue('monitorID') as string;
      return <span class='hidden md:table-cell'><SourceBadge source={monitorID} /></span>;
    },
    filterFn: 'arrIncludesSome',
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
