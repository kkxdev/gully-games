import type { GamePresentationProps } from '../../core/game-ui';
import { penFightMetadata } from '../metadata';
import type { PenFightState } from '../types';
import { PenFightHUD, PenFightScoreboard } from './pen-fight-hud';
export function PenFightPresentation({
  state,
  restart,
  canRestart,
  children,
}: GamePresentationProps<PenFightState>) {
  return (
    <div className="play-layout">
      <div className="game-main">
        <div className="game-title">
          <h2>{penFightMetadata.name}</h2>
          <span className="live-label">● READY TO PLAY</span>
        </div>
        <section className="game-shell" aria-label="Pen Fight game">
          <PenFightScoreboard state={state} />
          <div
            className="canvas-wrap"
            aria-label="School desk. Drag your blue pen backward and release to flick."
          >
            {children}
          </div>
          <PenFightHUD
            state={state}
            restart={restart}
            canRestart={canRestart}
          />
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
