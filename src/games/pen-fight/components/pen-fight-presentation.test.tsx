// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { trackEvent } from '@/lib/analytics';
import type { PenFightState } from '../types';
import { PenFightPresentation } from './pen-fight-presentation';
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
let root: Root, container: HTMLDivElement;
beforeEach(() => {
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    configurable: true,
    value: true,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  vi.mocked(trackEvent).mockClear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
const playing: PenFightState = {
  status: 'playing',
  scores: { player: 0, cpu: 0 },
  round: 1,
  turn: 'player',
  phase: 'aiming',
  power: 0,
  message: 'Your turn.',
};
it('announces a win, focuses the rematch control, celebrates and clears the result on restart', async () => {
  const won: PenFightState = {
    ...playing,
    status: 'completed',
    phase: 'match-over',
    scores: { player: 3, cpu: 1 },
    result: { winner: 'player' },
  };
  const restart = vi.fn();
  const render = (state: PenFightState) => (
    <PenFightPresentation state={state} restart={restart} canRestart>
      <div data-testid="surface" />
    </PenFightPresentation>
  );
  await act(async () => root.render(render(won)));
  const result = container.querySelector('[role=dialog]');
  expect(result?.textContent).toContain('You win!');
  expect(result?.querySelector('.pen-confetti')).not.toBeNull();
  const button = result?.querySelector('button');
  expect(document.activeElement).toBe(button);
  expect(container.querySelector('[inert]')).not.toBeNull();
  const surface = container.querySelector('[data-testid=surface]');
  await act(async () => button?.click());
  expect(restart).toHaveBeenCalledOnce();
  await act(async () => root.render(render(playing)));
  expect(container.querySelector('[role=dialog]')).toBeNull();
  expect(container.querySelector('[inert]')).toBeNull();
  expect(container.querySelector('[data-testid=surface]')).toBe(surface);
});
it('makes defeat explicit with a fallen pen and final score', async () => {
  const lost: PenFightState = {
    ...playing,
    status: 'completed',
    phase: 'match-over',
    scores: { player: 2, cpu: 3 },
    result: { winner: 'cpu' },
  };
  await act(async () =>
    root.render(
      <PenFightPresentation state={lost} restart={() => {}} canRestart>
        <div />
      </PenFightPresentation>,
    ),
  );
  const result = container.querySelector('[role=dialog]');
  expect(result?.textContent).toContain('You lost this match.');
  expect(result?.textContent).toContain('CPU wins.');
  expect(result?.querySelector('.fallen-pen')).not.toBeNull();
  expect(result?.querySelector('.pen-confetti')).toBeNull();
  expect(
    result?.querySelector('[aria-label="Final score: you 2, CPU 3"]'),
  ).not.toBeNull();
  expect(result?.querySelector('button')?.disabled).toBe(false);
});
it('shows domain-typed round outcomes without interrupting automatic round progression', async () => {
  for (const outcome of ['player', 'cpu', 'draw'] as const) {
    const state: PenFightState = {
      ...playing,
      phase: 'round-over',
      roundResult: outcome,
    };
    await act(async () =>
      root.render(
        <PenFightPresentation state={state} restart={() => {}} canRestart>
          <div />
        </PenFightPresentation>,
      ),
    );
    expect(container.querySelector('[role=dialog]')).toBeNull();
    expect(
      container.querySelector('.pen-round-feedback')?.textContent,
    ).toContain(
      outcome === 'player'
        ? 'Round won!'
        : outcome === 'cpu'
          ? 'CPU takes the round'
          : 'Draw!',
    );
  }
});
it('reports a round_complete GA4 event once per resolved round', async () => {
  const over: PenFightState = {
    ...playing,
    phase: 'round-over',
    roundResult: 'player',
  };
  const render = (state: PenFightState) => (
    <PenFightPresentation state={state} restart={() => {}} canRestart>
      <div />
    </PenFightPresentation>
  );
  await act(async () => root.render(render(over)));
  expect(trackEvent).toHaveBeenCalledOnce();
  expect(trackEvent).toHaveBeenCalledWith('round_complete', {
    game_id: 'pen-fight',
    round: 1,
    outcome: 'player',
  });
  await act(async () => root.render(render(over)));
  expect(trackEvent).toHaveBeenCalledOnce();
  await act(async () => root.render(render({ ...over, round: 2 })));
  expect(trackEvent).toHaveBeenCalledTimes(2);
  expect(trackEvent).toHaveBeenLastCalledWith('round_complete', {
    game_id: 'pen-fight',
    round: 2,
    outcome: 'player',
  });
});
