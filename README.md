# Gully Games

A neighbourhood of Indian childhood games from the 1980s and 1990s. Enter the
School Desk to create a challenge invitation or play **Pen Fight** against the
CPU. Realtime room service is explicitly still in development.

## Development

Requires Node.js 22.12+ and npm; CI uses Node 24 LTS. No environment variables, accounts or backend.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Routes are the neighbourhood, school, CPU practice,
and room-code lobby. Pull back from the blue pen and release to flick in
practice. Touch and mouse work; Esc cancels aiming.

```sh
npm run build
npm start
npm run lint
npm test
npm run typecheck
npm run format:check
```

## Stack and architecture

Next.js App Router, strict TypeScript, React, Phaser **3** with bundled Matter physics, responsive CSS, ESLint, Prettier and Vitest. Exact versions and a lockfile make installation reproducible. Phaser 3 is intentional despite the existence of Phaser 4.

- `src/app`: server-rendered page, layout, CSS and manifest.
- `src/components`: generic typed GameHost, registry launcher/registration and service worker registration.
- `src/games/core`: generic lifecycle contracts/controller, registry and type-only React UI contract; an isolated Phaser 3.90 cleanup adapter.
- `src/games/catalog.ts`: serializable metadata for server rendering.
- `src/games/registry.ts`: client discovery and lazy loaders.
- `src/games/pen-fight`: game-specific state/definition, pure rules, CPU aiming, Phaser runtime and React HUD/presentation.
- `public`: original geometric icons, offline fallback and service worker.

Each typed definition pairs a runtime with its own React presentation; the registry preserves that pairing through a component closure. Shared state contains lifecycle status and an optional result only. Phaser loads only after the React host mounts. The host owns teardown; the scene owns physics, inputs and timers. Rules have no React or Phaser dependency. New games register metadata and a runtime without changing unrelated UI.

## PWA

Serve production on HTTPS (localhost works) to install where supported. The manifest, PNG icons and service worker provide a standalone foundation. A visit after the worker controls the page caches the shell and loaded immutable assets for offline rematches. First-ever offline visits show a fallback. Development does not register the worker. Updates wait naturally to avoid interrupting matches; clear site data when debugging old production caches.

See [social alpha specification](docs/social-alpha-spec.md),
[delivery tracker](docs/social-alpha-tracker.md), [vision](docs/product-vision.md),
[architecture](docs/architecture.md), [roadmap](docs/game-roadmap.md) and
[adding a game](docs/adding-a-game.md).

## Verification

GitHub Actions runs npm ci, typecheck, lint, Vitest, format check and build for pushes and pull requests. Happy DOM is a test-only dependency for real React effect/StrictMode checks; Phaser is verified in a browser rather than mocked as a renderer. See [Phaser lifecycle investigation](docs/phaser-lifecycle.md) and [Kanche design observations](docs/kanche-design-notes.md).
