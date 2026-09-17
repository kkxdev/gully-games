import { registerGame } from '../components/register-game';
import { createGameRegistry } from './core/registry';
import { gameCatalog } from './catalog';
import { penFightDefinition } from './pen-fight/definition';
export const gameRegistry = createGameRegistry([
  registerGame(penFightDefinition),
  ...gameCatalog.filter((game) => game.status === 'planned'),
]);
