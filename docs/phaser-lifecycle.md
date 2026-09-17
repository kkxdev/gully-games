# Phaser 3.90 lifecycle investigation

## Finding

The pinned **Phaser 3.90.0** implementation of `src/core/VisibilityHandler.js` registers an anonymous document `visibilitychange` callback and assigns `window.onblur` and `window.onfocus`. It retains no externally accessible removal handle. `Game.start` calls it after `postBoot` and starting the loop. `Game.runDestroy` destroys scenes/renderer/loop and emits DESTROY, but does not remove that document listener or restore those window properties.

This occurs in ordinary production mount/destroy cycles, not only HMR. React StrictMode and switching between games amplify it by repeating lifetimes. A plain Phaser.Game with `destroy(true)` therefore does not satisfy the platform's listener cleanup requirement.

[Documented destroy behavior](https://docs.phaser.io/api-documentation/3.90.0/class/game#destroy) flags next-frame destruction and exposes DESTROY. It does not expose the VisibilityHandler callback. preBoot/postBoot cannot directly remove an anonymous callback. autoFocus false avoids focusing the window but does not disable VisibilityHandler registration. Copying Phaser startup or patching its distributed bundle would introduce more coupling.

## Decision

Retain and rename the original adapter as `Phaser390LifecycleGame` in `src/games/core/phaser-390-lifecycle-game.ts`. Its only responsibility is this verified upstream lifecycle defect. Inheritance is justified by needing the protected synchronous start hook; other orchestration uses composition.

The adapter captures document visibility registrations only while calling super.start. It immediately restores the original document method/descriptor in finally, including on exceptions. It captures the prior window handlers and restores them only if still owned. Cleanup is idempotent and runs both when destroy is requested and on DESTROY. Releasing before deferred destruction prevents the next game from capturing handlers belonging to a retiring game and restoring those dead handlers later. Destruction requested before startup is tracked without reading undocumented Phaser fields.

This is still a scoped monkey-patch and remains technical debt. It assumes sequentially hosted games, not simultaneous Phaser instances with independent window ownership. Do not spread this workaround into scenes or HUDs. Phaser remains pinned until the relevant checks are repeated.

Pen Fight uses documented scene stop and destroy APIs for normal teardown, removes its canvas immediately and disconnects its observer. Engine resource release remains asynchronous by Phaser design; stopped scenes do not keep simulating. Runtime callbacks are gated after disposal.

## Verification and upgrade checklist

The local Chrome comparison reproduced one remaining visibilitychange listener and retained blur/focus handlers after plain Phaser destruction. Five actual Pen Fight mount/restart/double-destroy cycles left zero tracked global listeners, observers, canvases and late reports. Immediate destroy-before-update followed by remount produced one active canvas, no disposed state reports, and restored window handlers after cleanup. Production desktop/touch, tablet resizing, restart, fall scoring and offline reload checks also passed. These checks are local evidence, not a claim of real-device Safari coverage or an executed GitHub Actions run.

Unit tests reproduce the specific upstream registration behavior with a small non-rendering facade. They cover document descriptor restoration, owned/unowned window handlers, startup exceptions and remounting before the prior DESTROY event. Host/controller tests use real React in Happy DOM and verify StrictMode replay, unmount/remount, late imports, double disposal and errors.

In a real browser, compare plain Phaser.Game with the adapter, then test the actual Pen Fight runtime. Track window/document listeners, focus/blur properties, ResizeObservers, canvas count and post-disposal callbacks. Run several mount → restart → destroy → destroy cycles and rapid remounts, including destruction before the first scene update. After deferred destruction, no owned listeners, observers, canvases or callbacks should remain. Also test hidden tabs and HMR manually, because browser scheduling differs from a DOM test environment.

On Phaser upgrades:

1. Re-read VisibilityHandler, Game.start, Game.destroy/runDestroy and scene shutdown/destroy source for the exact pinned version.
2. Run the plain-game comparison. Remove this adapter if upstream exposes supported cleanup or fixes the leak.
3. Re-run adapter/host unit tests, browser listener and rapid-switch checks, React StrictMode, startup cancellation, touch/keyboard cancellation and resize tests.
4. Verify production build, PWA/offline reload, real-device behavior and window handler coexistence.

Do not call private runDestroy directly or set noReturn true: this platform must be able to mount another game on the same page.
