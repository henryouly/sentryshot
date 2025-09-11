import { type Component } from 'solid-js';

const LEVELS: Record<string, { class: string; label: string; title: string }> = {
  error: { class: 'badge-error', label: 'E', title: 'error' },
  warning: { class: 'badge-warning', label: 'W', title: 'warning' },
  info: { class: 'badge-info', label: 'I', title: 'info' },
  debug: { class: 'badge-success', label: 'D', title: 'debug' },
};

const LogBadge: Component<{ level?: string }> = (props) => {
  const lvl = (props.level ?? '').toLowerCase();
  const cfg = LEVELS[lvl] ?? { class: 'bg-gray-400 text-white', label: lvl ? lvl[0].toUpperCase() : '?', title: lvl || 'unknown' };

  return (
    <span
      class={`badge badge-soft ${cfg.class} text-xs font-mono px-2 py-1`}
      title={cfg.title}
    >
      {cfg.label}
    </span>
  );
};

export default LogBadge;
