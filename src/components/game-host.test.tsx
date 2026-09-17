// @vitest-environment happy-dom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BaseGameState,
  GameMountOptions,
  GameRuntime,
} from '../games/core/contracts';
import type {
  GamePresentationProps,
  ReactGameDefinition,
} from '../games/core/game-ui';
import { GameHost } from './game-host';
interface WordState extends BaseGameState {
  word: string;
}
function Presentation({
  state,
  restart,
  canRestart,
  children,
}: GamePresentationProps<WordState>) {
  return (
    <section>
      <output>{state?.word ?? 'No word'}</output>
      {children}
      <button disabled={!canRestart} onClick={restart}>
        Restart
      </button>
    </section>
  );
}
function fixture() {
  const lifecycle = { restart: vi.fn(), destroy: vi.fn() };
  let callbacks: GameMountOptions<WordState> | undefined;
  const mount = vi.fn((options: GameMountOptions<WordState>) => {
    callbacks = options;
    options.parent.appendChild(document.createElement('canvas'));
    options.onState({ status: 'playing', word: 'school' });
    return {
      restart: lifecycle.restart,
      destroy: () => {
        lifecycle.destroy();
        options.parent.replaceChildren();
      },
    };
  });
  const definition: ReactGameDefinition<WordState> = {
    id: 'word-test',
    name: 'Word Test',
    description: 'Test',
    players: '1',
    location: 'Test',
    status: 'playable',
    loadRuntime: () => Promise.resolve({ mount }),
    Presentation,
  };
  return { definition, mount, lifecycle, callbacks: () => callbacks };
}
let root: Root, container: HTMLDivElement;
beforeEach(() => {
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    configurable: true,
    value: true,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
describe('generic React host', () => {
  it('renders non-physics state and restarts its runtime', async () => {
    const f = fixture();
    await act(async () => root.render(<GameHost definition={f.definition} />));
    expect(container.querySelector('output')?.textContent).toBe('school');
    expect(container.textContent).not.toContain('FLICK');
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    await act(async () => container.querySelector('button')?.click());
    expect(f.lifecycle.restart).toHaveBeenCalledOnce();
  });
  it('survives StrictMode effect replay and remounts with one canvas', async () => {
    const f = fixture();
    await act(async () =>
      root.render(
        <StrictMode>
          <GameHost definition={f.definition} />
        </StrictMode>,
      ),
    );
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    expect(f.mount).toHaveBeenCalledOnce();
    await act(async () => root.render(null));
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
    await act(async () =>
      root.render(
        <StrictMode>
          <GameHost definition={f.definition} />
        </StrictMode>,
      ),
    );
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    expect(f.mount).toHaveBeenCalledTimes(2);
  });
  it('does not mount a runtime loaded after React unmounts', async () => {
    const f = fixture();
    let resolve!: (runtime: GameRuntime<WordState>) => void;
    f.definition.loadRuntime = () =>
      new Promise((yes) => {
        resolve = yes;
      });
    await act(async () => root.render(<GameHost definition={f.definition} />));
    await act(async () => root.render(null));
    await act(async () => resolve({ mount: f.mount }));
    expect(f.mount).not.toHaveBeenCalled();
  });
  it('shows friendly errors while retaining diagnostic details', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    f.definition.loadRuntime = () =>
      Promise.reject(new Error('sensitive stack details'));
    await act(async () => root.render(<GameHost definition={f.definition} />));
    expect(container.textContent).toContain('Please refresh');
    expect(container.textContent).not.toContain('sensitive stack details');
    expect(container.querySelector('button')?.disabled).toBe(true);
    expect(log).toHaveBeenCalledWith(
      'Game word-test failed during load',
      expect.any(Error),
    );
  });
  it('disables controls and destroys the runtime after an asynchronous failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    await act(async () => root.render(<GameHost definition={f.definition} />));
    await act(async () => f.callbacks()?.onError?.('failed'));
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
    expect(container.querySelector('button')?.disabled).toBe(true);
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
  });
});
