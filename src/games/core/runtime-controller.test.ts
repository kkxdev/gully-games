// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { BaseGameState, GameMountOptions, GameRuntime } from './contracts';
import { createRuntimeController } from './runtime-controller';
interface WordState extends BaseGameState {
  word: string;
}
const state: WordState = { status: 'playing', word: 'mohalla' };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function fixture(loadRuntime?: () => Promise<GameRuntime<WordState>>) {
  const lifecycle = { restart: vi.fn(), destroy: vi.fn() };
  let callbacks: GameMountOptions<WordState> | undefined;
  const mount = vi.fn((options: GameMountOptions<WordState>) => {
    callbacks = options;
    options.onState(state);
    return lifecycle;
  });
  const onState = vi.fn(),
    onReady = vi.fn(),
    onError = vi.fn();
  const controller = createRuntimeController({
    parent: document.createElement('div'),
    loadRuntime: loadRuntime ?? (() => Promise.resolve({ mount })),
    onState,
    onReady,
    onError,
  });
  return {
    controller,
    lifecycle,
    mount,
    onState,
    onReady,
    onError,
    callbacks: () => callbacks,
  };
}
describe('runtime ownership', () => {
  it('mounts typed state, restarts and destroys exactly once', async () => {
    const f = fixture();
    await f.controller.ready;
    expect(f.onState).toHaveBeenCalledWith(state);
    expect(f.onReady).toHaveBeenCalledOnce();
    f.controller.restart();
    expect(f.lifecycle.restart).toHaveBeenCalledOnce();
    f.controller.destroy();
    f.controller.destroy();
    f.controller.restart();
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
    expect(f.lifecycle.restart).toHaveBeenCalledOnce();
    f.callbacks()?.onState(state);
    f.callbacks()?.onError?.(new Error('late'));
    expect(f.onState).toHaveBeenCalledOnce();
    expect(f.onError).not.toHaveBeenCalled();
  });
  it('does not start loading after immediate disposal', async () => {
    const loader = vi.fn();
    const f = fixture(loader);
    f.controller.destroy();
    await f.controller.ready;
    expect(loader).not.toHaveBeenCalled();
  });
  it('never mounts an import resolved after disposal', async () => {
    const pending = deferred<GameRuntime<WordState>>();
    const f = fixture(() => pending.promise);
    await Promise.resolve();
    f.controller.destroy();
    pending.resolve({ mount: f.mount });
    await f.controller.ready;
    expect(f.mount).not.toHaveBeenCalled();
    expect(f.onReady).not.toHaveBeenCalled();
  });
  it('ignores imports rejected after disposal', async () => {
    const pending = deferred<GameRuntime<WordState>>();
    const f = fixture(() => pending.promise);
    await Promise.resolve();
    f.controller.destroy();
    pending.reject(new Error('late'));
    await f.controller.ready;
    expect(f.onError).not.toHaveBeenCalled();
  });
  it('allows independent remounts after disposal', async () => {
    const first = fixture();
    await first.controller.ready;
    first.controller.destroy();
    const second = fixture();
    await second.controller.ready;
    expect(first.lifecycle.destroy).toHaveBeenCalledOnce();
    expect(second.mount).toHaveBeenCalledOnce();
    expect(second.lifecycle.destroy).not.toHaveBeenCalled();
    second.controller.destroy();
  });
});
describe('failure isolation', () => {
  it('reports rejected and synchronously throwing loaders', async () => {
    for (const loader of [
      () => Promise.reject('failed'),
      () => {
        throw 'failed';
      },
    ]) {
      const f = fixture(loader);
      await f.controller.ready;
      expect(f.onError).toHaveBeenCalledWith({
        phase: 'load',
        cause: 'failed',
      });
      expect(f.onReady).not.toHaveBeenCalled();
    }
  });
  it('reports mount exceptions', async () => {
    const f = fixture(() =>
      Promise.resolve({
        mount: () => {
          throw new Error('bad mount');
        },
      }),
    );
    await f.controller.ready;
    expect(f.onError).toHaveBeenCalledWith({
      phase: 'mount',
      cause: expect.any(Error),
    });
  });
  it('releases a runtime that reports an error synchronously while mounting', async () => {
    const lifecycle = { restart: vi.fn(), destroy: vi.fn() };
    const f = fixture(() =>
      Promise.resolve({
        mount: (options) => {
          options.onError?.('scene failed');
          options.onState(state);
          return lifecycle;
        },
      }),
    );
    await f.controller.ready;
    expect(lifecycle.destroy).toHaveBeenCalledOnce();
    expect(f.onReady).not.toHaveBeenCalled();
    expect(f.onState).not.toHaveBeenCalled();
    expect(f.onError).toHaveBeenCalledWith({
      phase: 'runtime',
      cause: 'scene failed',
    });
  });
  it('destroys after runtime failure and suppresses later state/errors', async () => {
    const f = fixture();
    await f.controller.ready;
    f.callbacks()?.onError?.('physics failed');
    f.callbacks()?.onState(state);
    f.callbacks()?.onError?.('again');
    f.controller.destroy();
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
    expect(f.onError).toHaveBeenCalledOnce();
    expect(f.onState).toHaveBeenCalledOnce();
  });
  it('handles a failed restart without leaking ownership', async () => {
    const f = fixture();
    await f.controller.ready;
    f.lifecycle.restart.mockImplementation(() => {
      throw 'restart failed';
    });
    f.controller.restart();
    f.controller.destroy();
    expect(f.onError).toHaveBeenCalledWith({
      phase: 'restart',
      cause: 'restart failed',
    });
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
  });
  it('logs teardown failures without updating a disposed host', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = fixture();
    await f.controller.ready;
    f.lifecycle.destroy.mockImplementation(() => {
      throw 'cleanup failed';
    });
    f.controller.destroy();
    f.controller.destroy();
    expect(f.lifecycle.destroy).toHaveBeenCalledOnce();
    expect(f.onError).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('Game cleanup failed', 'cleanup failed');
    log.mockRestore();
  });
});
