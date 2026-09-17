# Adding a game

The extension flow is **Game Registry → Game Definition → GameHost → Runtime + Game-Specific UI**. A game defines its own state; the host requires only lifecycle status and an optional result.

1. Create `src/games/<id>/` with metadata, `types.ts`, pure rules, runtime, React presentation and useful tests. Domain types belong in that module.
2. Define `YourState extends BaseGameState`. It can have words, marbles, innings or wind without rounds or flick power. GameResult scores are optional.
3. Export `mount(options: GameMountOptions<YourState>): GameLifecycle` from the runtime. It reports `YourState`, supports restart and idempotent destroy, and can report fatal failures via `options.onError`. Roll back allocations if mounting throws.
4. Pair the lazy runtime and correctly typed presentation in `ReactGameDefinition<YourState>`. Presentation receives typed nullable state, restart, canRestart and children. Put children in a surface with a suitable size/aspect ratio; they contain the host mount element and loading/error content. HUD/layout and controls are game-owned. Do not run game rules in React.
5. Add serializable metadata to `src/games/catalog.ts`, importing only the game's metadata module. Add `registerGame(yourDefinition)` to `src/games/registry.ts`. No changes to GameHost, Pen Fight or unrelated modules are required. Planned games require metadata only.
6. Use logical coordinates, responsive sizing and generous touch targets. Handle secondary pointers, cancelled input and hidden tabs. If using Phaser 3.90, use the isolated lifecycle adapter and review its documented limitations.
7. Destroy listeners, observers, timers, worlds, canvases and renderer instances. Stop simulation immediately; account for Phaser's deferred engine destruction. Check StrictMode, late import resolution, double destroy and rapid switching.
8. Run npm ci, typecheck, lint, tests, format check and build. Verify mouse/touch, narrow mobile/tablet/desktop, resizing without score reset, results and offline loading in a real browser.

An illustrative scoreless definition looks like this (not a shipped game):

```tsx
interface WordState extends BaseGameState {
  word: string;
}

const definition: ReactGameDefinition<WordState> = {
  ...metadata,
  loadRuntime: () => import('./runtime'),
  Presentation: ({ state, children, restart, canRestart }) => (
    <section>
      <p>{state?.word}</p>
      <div style={{ position: 'relative', height: 400 }}>{children}</div>
      <button onClick={restart} disabled={!canRestart}>
        Restart
      </button>
    </section>
  ),
};
```

Registration uses a component closure to preserve the definition's state type in a registry containing different games. There is no cast to a common simulation state and no central switch on game IDs.

The app owns routing/navigation and the overall neighbourhood shell. Core owns lifecycle, metadata, base state, registry and presentation plumbing. Each game owns rules, runtime, state, UI and tests.

**Do not extract shared gameplay mechanics until at least two games demonstrate the same abstraction.** Kanche may independently use flicking and Matter, but a shared FlickEngine or generic physics engine is not justified yet.
