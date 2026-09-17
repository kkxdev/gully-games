'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameDefinition, GameLifecycle, GameState } from '@/games/core/contracts';
export function GameHost({ definition }: { definition: GameDefinition }) {
  const parent = useRef<HTMLDivElement>(null);
  const runtime = useRef<GameLifecycle | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    definition.load?.().then(({ mount }) => {
      if (disposed || !parent.current) return;
      runtime.current = mount({ parent: parent.current, onState: (next) => { if (!disposed) setState(next); } });
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; runtime.current?.destroy(); runtime.current = null; };
  }, [definition]);
  return <section className="game-shell" aria-label={`${definition.name} game`}>
    <div className="scoreboard">
      <div className="score player"><span>YOU / BLUE</span><strong>{state?.scores.player ?? 0}</strong></div>
      <div className="round"><span>BEST OF FIVE</span><strong>Round {state?.round ?? 1}</strong><small>First to 3 · draws replay</small></div>
      <div className="score cpu"><span>CPU / RED</span><strong>{state?.scores.cpu ?? 0}</strong></div>
    </div>
    <div className="canvas-wrap" ref={parent} aria-label="School desk. Drag your blue pen backward and release to flick." />
    <div className="game-status"><p role="status" aria-live="polite">{error ? 'The desk could not load. Please refresh to try again.' : state?.message ?? 'Setting up your desk…'}</p><button onClick={() => runtime.current?.restart()} disabled={!state}>↻ Restart match</button></div>
    <div className="power-row"><label htmlFor="power">FLICK POWER</label><meter id="power" min="0" max="1" value={state?.power ?? 0} /><span>{Math.round((state?.power ?? 0) * 100)}%</span></div>
    <p className="control-note">Grab the blue pen → pull backward to aim → let go! <span>Touch & mouse · Esc cancels aim</span></p>
  </section>;
}
