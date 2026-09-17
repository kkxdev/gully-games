# Gully Games

A neighbourhood of Indian childhood games from the 1980s and 1990s. Start at the school desk with **Pen Fight**, a playable solo match against the CPU. The future lobby connects the school, gully, playground and rooftop.

## Development

Requires Node.js 22.12+ and npm. No environment variables, accounts or backend.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Pull back from the blue pen and release to flick. Touch and mouse work; Esc cancels aiming. Knock the red pen off while keeping yours on the desk. First to three wins. Draws replay, and starting turns alternate by decisive round.

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
- `src/components`: client GameHost and service worker registration.
- `src/games/core`: framework-independent contracts and registry factory.
- `src/games/catalog.ts`: serializable metadata for server rendering.
- `src/games/registry.ts`: client discovery and lazy loaders.
- `src/games/pen-fight`: pure rules, CPU aiming and Phaser runtime.
- `public`: original geometric icons, offline fallback and service worker.

Phaser loads only after the React host mounts. The host owns teardown; the scene owns physics, inputs and timers. Rules have no React or Phaser dependency. New games register metadata and a runtime without changing unrelated UI.

## PWA

Serve production on HTTPS (localhost works) to install where supported. The manifest, PNG icons and service worker provide a standalone foundation. A visit after the worker controls the page caches the shell and loaded immutable assets for offline rematches. First-ever offline visits show a fallback. Development does not register the worker. Updates wait naturally to avoid interrupting matches; clear site data when debugging old production caches.

See [vision](docs/product-vision.md), [architecture](docs/architecture.md), [roadmap](docs/game-roadmap.md) and [adding a game](docs/adding-a-game.md).
