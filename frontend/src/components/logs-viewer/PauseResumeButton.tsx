import { type Component } from 'solid-js';
import Play from 'lucide-solid/icons/play';
import Pause from 'lucide-solid/icons/pause';

const PauseResumeButton: Component<{ paused: boolean; onToggle: () => void }> = (props) => {
  return (
    <button class="btn btn-square btn-ghost" title={props.paused ? 'Resume' : 'Pause'} onClick={props.onToggle}>
      {props.paused ? <Play class="w-4 h-4" /> : <Pause class="w-4 h-4" />}
    </button>
  );
};

export default PauseResumeButton;
