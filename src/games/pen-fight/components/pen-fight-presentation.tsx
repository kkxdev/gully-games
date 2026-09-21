import { useEffect, useRef } from 'react';
import type { GamePresentationProps } from '../../core/game-ui';
import { trackEvent } from '@/lib/analytics';
import { penFightMetadata } from '../metadata';
import type { PenFightState } from '../types';
import { PenFightHUD, PenFightScoreboard } from './pen-fight-hud';
import { PenFightMatchResult, PenFightRoundFeedback } from './pen-fight-result';
import './pen-fight-feedback.css';
export function PenFightPresentation({
  state,
  restart,
  canRestart,
  children,
}: GamePresentationProps<PenFightState>) {
  const completed = state?.phase === 'match-over';
  const trackedRound = useRef<string | null>(null);
  useEffect(() => {
    if (state?.phase !== 'round-over' || !state.roundResult) return;
    const key = `${state.round}-${state.roundResult}`;
    if (trackedRound.current === key) return;
    trackedRound.current = key;
    trackEvent('round_complete', {
      game_id: penFightMetadata.id,
      round: state.round,
      outcome: state.roundResult,
    });
  }, [state?.phase, state?.round, state?.roundResult]);
  return (
    <div className="play-layout">
      <div className="game-main">
        <div className="game-title">
          <h2>{penFightMetadata.name}</h2>
          <span className="live-label">
            {completed ? '● MATCH FINISHED' : '● READY TO PLAY'}
          </span>
        </div>
        <section className="game-shell" aria-label="Pen Fight game">
          <div inert={completed}>
            <PenFightScoreboard state={state} />
            <div
              className="canvas-wrap"
              aria-label="School desk. Drag your blue pen backward and release to flick."
            >
              {children}
              {state?.phase === 'round-over' && state.roundResult && (
                <PenFightRoundFeedback
                  key={`${state.round}-${state.roundResult}`}
                  outcome={state.roundResult}
                />
              )}
            </div>
            <PenFightHUD
              state={state}
              restart={restart}
              canRestart={canRestart}
            />
          </div>
          {completed && state && (
            <PenFightMatchResult
              state={state}
              restart={restart}
              canRestart={canRestart}
            />
          )}
        </section>
      </div>
      <aside className="notebook">
        <span className="paper-tab">THE RULES</span>
        <h3>
          Settle it
          <br />
          on the desk.
        </h3>
        <p>{penFightMetadata.description}</p>
        <ol>
          <li>Pull your blue pen backward.</li>
          <li>Aim the arrow at the red pen.</li>
          <li>Release to flick. Knock it off!</li>
        </ol>
        <p className="margin-note">
          Keep yours on the desk.
          <br />
          First to 3 wins. ✎
        </p>
        <div className="desk-doodle">──── ✒ ────</div>
        <small>For fingers, mice & fierce rivals.</small>
      </aside>
    </div>
  );
}
