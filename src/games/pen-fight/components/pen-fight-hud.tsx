import { useId } from 'react';
import type { GamePresentationProps } from '../../core/game-ui';
import type { PenFightState } from '../types';
export function PenFightScoreboard({ state }: { state: PenFightState | null }) {
  return (
    <div className="scoreboard">
      <div className="score player">
        <span>YOU / BLUE</span>
        <strong>{state?.scores.player ?? 0}</strong>
      </div>
      <div className="round">
        <span>BEST OF FIVE</span>
        <strong>
          {state?.phase === 'match-over'
            ? 'Final score'
            : `Round ${state?.round ?? 1}`}
        </strong>
        <small>First to 3 · draws replay</small>
      </div>
      <div className="score cpu">
        <span>CPU / RED</span>
        <strong>{state?.scores.cpu ?? 0}</strong>
      </div>
    </div>
  );
}
export function PenFightHUD({
  state,
  restart,
  canRestart,
}: Omit<GamePresentationProps<PenFightState>, 'children'>) {
  const powerId = useId();
  return (
    <>
      <div className="game-status">
        <p role="status" aria-live="polite">
          {state?.message ?? 'Setting up your desk…'}
        </p>
        <button onClick={restart} disabled={!canRestart}>
          ↻ Restart match
        </button>
      </div>
      <div className="power-row">
        <label htmlFor={powerId}>FLICK POWER</label>
        <meter id={powerId} min="0" max="1" value={state?.power ?? 0} />
        <span>{Math.round((state?.power ?? 0) * 100)}%</span>
      </div>
      <p className="control-note">
        Grab the blue pen → pull backward to aim → let go!{' '}
        <span>Touch & mouse · Esc cancels aim</span>
      </p>
    </>
  );
}
