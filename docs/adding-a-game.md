# Adding a game

1. Create `src/games/<id>/` with independent rules and useful unit tests. Keep game logic out of React.
2. Export `mount({ parent, onState }): GameLifecycle` from a lazy runtime. Report state, support restart and make destroy idempotent.
3. Add serializable metadata to `src/games/catalog.ts`, and attach the runtime loader in `src/games/registry.ts`. Playable games need `load: () => import('./<id>/runtime')`; planned entries need no loader. IDs must be unique.
4. Use logical coordinates and responsive sizing, generous touch targets and cancelled-input handling.
5. Destroy canvases and renderer instances; remove observers, listeners and timers; guard async work. Exercise repeated mount/unmount and restarts.
6. Run install, build, lint, tests and type checking. Check touch, mouse, desktop, tablet, mobile, results and offline behavior.

The current page discovers games directly from the registry. Adding one does not require changing another game or importing it into the page. Add registry-driven location navigation as the neighbourhood grows. Extract shared mechanics only when a second game demonstrates a real need.
