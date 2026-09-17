import { useEffect, useId, useRef } from 'react';
import type { RoundOutcome } from '../rules';
import type { PenFightState } from '../types';

function Confetti() {
  const colors = ['#e8b84f', '#245fbd', '#cf6548', '#558769', '#faf0ba'];
  return (
    <div className="pen-confetti" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${(i % 9) * 0.09}s`,
            animationDuration: `${2.4 + (i % 4) * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
function FallenPen() {
  return (
    <svg className="fallen-pen" viewBox="0 0 100 66" aria-hidden="true">
      <path
        d="M10 25H67V56"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g className="fallen-pen-body" transform="rotate(35 70 30)">
        <rect x="43" y="26" width="43" height="8" rx="4" fill="#245fbd" />
        <path d="M86 26L96 30L86 34Z" fill="#bcc7cb" />
        <path d="M49 28H61" stroke="#fff" strokeWidth="2" />
      </g>
      <path
        d="M80 8L83 14M92 17L86 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function PenFightRoundFeedback({ outcome }: { outcome: RoundOutcome }) {
  return (
    <div
      className={`pen-round-feedback pen-round-${outcome}`}
      role="status"
      aria-live="polite"
    >
      {outcome === 'player' && <Confetti />}
      {outcome === 'cpu' && <FallenPen />}
      <strong>
        {outcome === 'player'
          ? 'Round won!'
          : outcome === 'cpu'
            ? 'CPU takes the round'
            : 'Both pens down. Draw!'}
      </strong>
      <span>
        {outcome === 'draw'
          ? 'Same round, fresh pens.'
          : 'Fresh pens. Next round…'}
      </span>
    </div>
  );
}
export function PenFightMatchResult({
  state,
  restart,
  canRestart,
}: {
  state: PenFightState;
  restart: () => void;
  canRestart: boolean;
}) {
  const won = state.result?.winner === 'player';
  const titleId = useId(),
    descriptionId = useId();
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      className={`pen-match-result ${won ? 'pen-match-win' : 'pen-match-loss'}`}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {won && <Confetti />}
      <div className="pen-result-card">
        <div className="pen-result-art" aria-hidden="true">
          {won ? <span className="pen-win-star">✦</span> : <FallenPen />}
        </div>
        <p className="pen-result-eyebrow">
          {won ? 'LUNCH-BREAK CHAMPION' : 'THE DESK HAS SPOKEN'}
        </p>
        <h3 id={titleId}>{won ? 'You win!' : 'You lost this match.'}</h3>
        <p id={descriptionId}>
          {won
            ? 'Bragging rights are yours. The bell can wait.'
            : 'CPU wins. Pick up your pen — the rematch is yours.'}
        </p>
        <div
          className="pen-result-score"
          aria-label={`Final score: you ${state.scores.player}, CPU ${state.scores.cpu}`}
        >
          <span>
            You <strong>{state.scores.player}</strong>
          </span>
          <span aria-hidden="true">:</span>
          <span>
            <strong>{state.scores.cpu}</strong> CPU
          </span>
        </div>
        <button ref={button} onClick={restart} disabled={!canRestart}>
          ↻ Restart match
        </button>
      </div>
    </div>
  );
}
