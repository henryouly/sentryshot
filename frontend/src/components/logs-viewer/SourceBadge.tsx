import { type Component } from 'solid-js';

const SourceBadge: Component<{ source: string }> = (props) => {
  const src = (props.source ?? '').toLowerCase();

  return (
    <span
      class={`badge badge-soft badge-info text-xs font-mono px-2 py-1`}
      title={src}
    >
      {src}
    </span>
  );
};

export default SourceBadge;
