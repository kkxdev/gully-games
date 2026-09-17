import * as Phaser from 'phaser';

/** Phaser 3.90 leaves its visibility listener and window handlers after destroy.
 * Capture only the synchronous start hook's registrations, then restore globals.
 * Keep this adapter version-specific; re-check it when upgrading Phaser.
 */
export class ManagedPhaserGame extends Phaser.Game {
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
    const previousBlur = window.onblur;
    const previousFocus = window.onfocus;
    document.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (type.endsWith('visibilitychange'))
        registrations.push({ type, listener, options });
      add.call(document, type, listener, options);
    }) as typeof document.addEventListener;
    try {
      super.start();
    } finally {
      if (descriptor)
        Object.defineProperty(document, 'addEventListener', descriptor);
      else Reflect.deleteProperty(document, 'addEventListener');
    }
    const assignedBlur = window.onblur;
    const assignedFocus = window.onfocus;
    this.events.once(Phaser.Core.Events.DESTROY, () => {
      for (const { type, listener, options } of registrations)
        document.removeEventListener(type, listener, options);
      if (window.onblur === assignedBlur) window.onblur = previousBlur;
      if (window.onfocus === assignedFocus) window.onfocus = previousFocus;
    });
  }
}
