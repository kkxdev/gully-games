import { createGameRegistry } from './core/registry';
import { gameCatalog } from './catalog';
export const gameRegistry = createGameRegistry(
  gameCatalog.map((game) => ({
    ...game,
    ...(game.id === 'pen-fight'
      ? { load: () => import('./pen-fight/runtime') }
      : {}),
  })),
);
