// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
const upstream = vi.hoisted(() => ({
  throwDuringStart: false,
  deferDestroy: false,
}));
// A small lifecycle facade reproduces the inspected Phaser 3.90 leak, without a renderer.
vi.mock('phaser', async () => {
  const { EventEmitter } = await import('node:events');
  return {
    Core: { Events: { DESTROY: 'destroy' } },
    Game: class {
      events = new EventEmitter();
      constructor() {
        this.start();
      }
      start() {
        document.addEventListener('visibilitychange', () => {});
        window.onblur = () => {};
        window.onfocus = () => {};
        if (upstream.throwDuringStart) throw new Error('upstream boot failed');
      }
      destroy() {
        if (!upstream.deferDestroy) this.events.emit('destroy');
      }
    },
  };
});
import { Phaser390LifecycleGame } from './phaser-390-lifecycle-game';
afterEach(() => {
  upstream.throwDuringStart = false;
  upstream.deferDestroy = false;
  vi.restoreAllMocks();
  window.onblur = null;
  window.onfocus = null;
});
it('restores the document method immediately and removes captured listeners on destroy', () => {
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  const previousBlur = vi.fn(),
    previousFocus = vi.fn();
  window.onblur = previousBlur;
  window.onfocus = previousFocus;
  const game = new Phaser390LifecycleGame();
  expect(document.addEventListener).toBe(add);
  const [type, listener] = add.mock.calls[0];
  game.destroy(true);
  expect(remove).toHaveBeenCalledWith(type, listener, undefined);
  expect(window.onblur).toBe(previousBlur);
  expect(window.onfocus).toBe(previousFocus);
});
it('does not overwrite focus handlers replaced by another owner', () => {
  const game = new Phaser390LifecycleGame();
  const other = vi.fn();
  window.onfocus = other;
  window.onblur = other;
  game.destroy(true);
  expect(window.onfocus).toBe(other);
  expect(window.onblur).toBe(other);
});
it('restores the exact document descriptor when upstream start throws', () => {
  const add = vi.spyOn(document, 'addEventListener');
  const descriptor = Object.getOwnPropertyDescriptor(
    document,
    'addEventListener',
  );
  upstream.throwDuringStart = true;
  expect(() => new Phaser390LifecycleGame()).toThrow('upstream boot failed');
  expect(Object.getOwnPropertyDescriptor(document, 'addEventListener')).toEqual(
    descriptor,
  );
  // The simulated constructor threw before returning ownership; release its test listener.
  for (const [type, listener] of add.mock.calls)
    document.removeEventListener(type, listener);
});

it('releases ownership before deferred destruction to avoid restoring retired handlers', () => {
  upstream.deferDestroy = true;
  const original = vi.fn();
  window.onfocus = original;
  window.onblur = original;
  const first = new Phaser390LifecycleGame();
  first.destroy(true);
  const second = new Phaser390LifecycleGame();
  first.events.emit('destroy');
  second.destroy(true);
  second.events.emit('destroy');
  expect(window.onfocus).toBe(original);
  expect(window.onblur).toBe(original);
});
