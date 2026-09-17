# Architecture

Next.js owns navigation, metadata and presentation. A serializable metadata catalog drives the server page; the client registry attaches lazy runtime loaders. No loader function crosses the server/client props boundary. GameHost loads a runtime in a client effect, passes a parent and state callback, and holds a GameLifecycle. Async cancellation prevents mounting after unmount and ignores late state. Cleanup destroys the runtime. React never imports Phaser at runtime.

Plain TypeScript contracts include GameDefinition, GameMetadata, GameSession, GameResult, Player, Score and GameLifecycle. Registry validation rejects duplicate IDs and missing playable loaders. Definitions are frozen. Session is a data contract only; there is no session service or persistence. The observable state describes this prototype and should evolve only when another game needs it.

Pen Fight owns a Matter scene, graphics, input, physics and turn timers. Pure rules calculate vectors, CPU aim, outcomes and immutable match progression. CPU aim targets the player with ±0.11 radians of error and bounded distance-sensitive power.

The scene uses 900 × 540 coordinates, zero gravity, rectangular pens, friction and restitution. FIT scaling and ResizeObserver adapt to available space. A 76-unit pick radius supports touch. Only the active pointer can aim or release. Outside release, pointer cancellation, page hiding and Esc cancel aiming.

A pen falls when its centre crosses the desk edge; falling is latched and its body moved out of play. Results wait for both pens to settle, so both may fall in the same flick. Linear and angular motion must be quiet for 450ms. A 12-second safety timeout ends pathological motion. Draws replay; first to three wins within five decisive rounds. The opening side alternates by decisive round number. Restart clears timers, bodies and scores.

Runtime teardown disconnects its observer and destroys Phaser and its canvas. Scene shutdown removes browser, keyboard and pointer listeners. Phaser owns scene timers, world and renderer. No universal physics wrapper or giant game engine is introduced.

Native manifest and service worker APIs avoid an extra PWA dependency. Navigations are network-first; immutable static assets are cache-first. Offline capability needs a controlled visit with required chunks loaded. Cache versions should change with cache policy. Development never registers the worker. Updates wait until old clients close.

Known limits: no persistence, sound, keyboard flicking, multiplayer, telemetry or full neighbourhood lobby. Browser checks cover orchestration and lifecycle; Vitest covers deterministic logic.

A version-specific `ManagedPhaserGame` adapter addresses Phaser 3.90's visibility leak. It captures document visibility registrations only during the synchronous protected `start` hook, restores the document method immediately, and removes those registrations on game destruction. It restores prior window focus/blur handlers when still owned. Scene input cleanup listens to both shutdown and destruction. Re-check this adapter when upgrading Phaser; it assumes the current single-active-game page. Browser lifecycle checks track global listeners, canvases, observer counts and callbacks over repeated mount/destroy cycles.
