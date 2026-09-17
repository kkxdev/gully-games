import * as Phaser from 'phaser';
const destroying = new WeakSet<Phaser.Game>();
const visibilityCleanup = new WeakMap<Phaser.Game, () => void>();

/** Phaser 3.90.0 leaves its anonymous visibility listener and window handlers
 * after destroy. No public API exposes that listener. Keep this version-specific
 * workaround here, and retest on upgrades. See docs/phaser-lifecycle.md.
 */
export class Phaser390LifecycleGame extends Phaser.Game {
  protected start(): void {
    const add = document.addEventListener;
    const descriptor = Object.getOwnPropertyDescriptor(
      document,
      'addEventListener',
    );
    const registrations: {
      type: string;
      listener: EventListenerOrEventListenerObject;
      options?: boolean | AddEventListenerOptions;
    }[] = [];
    const previousBlur = window.onblur,
      previousFocus = window.onfocus;
    let assignedBlur = previousBlur,
      assignedFocus = previousFocus;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      for (const { type, listener, options } of registrations)
        document.removeEventListener(type, listener, options);
      if (window.onblur === assignedBlur) window.onblur = previousBlur;
      if (window.onfocus === assignedFocus) window.onfocus = previousFocus;
      visibilityCleanup.delete(this);
    };
    const capture = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (type.endsWith('visibilitychange'))
        registrations.push({ type, listener, options });
      add.call(document, type, listener, options);
    };
    Object.defineProperty(document, 'addEventListener', {
      configurable: true,
      writable: true,
      value: capture,
    });
    visibilityCleanup.set(this, cleanup);
    this.events.once(Phaser.Core.Events.DESTROY, cleanup);
    let bootFailed = false;
    try {
      super.start();
    } catch (cause) {
      bootFailed = true;
      throw cause;
    } finally {
      assignedBlur = window.onblur;
      assignedFocus = window.onfocus;
      if (descriptor)
        Object.defineProperty(document, 'addEventListener', descriptor);
      else Reflect.deleteProperty(document, 'addEventListener');
      if (bootFailed || destroying.has(this)) cleanup();
    }
  }
  destroy(removeCanvas: boolean, noReturn = false): void {
    // Release before another instance starts, not only at deferred DESTROY.
    // Otherwise the newer instance could later restore a retired game's handlers.
    destroying.add(this);
    visibilityCleanup.get(this)?.();
    super.destroy(removeCanvas, noReturn);
  }
}
