import type { BaseGameState } from '@/games/core/contracts';
import type { ReactGameDefinition, RegisteredGame } from '@/games/core/game-ui';
import { GameHost } from './game-host';
/** Close over TState rather than casting a typed definition to a common state. */
export function registerGame<TState extends BaseGameState>(
  definition: ReactGameDefinition<TState>,
): RegisteredGame {
  if (definition.status !== 'playable')
    throw new Error(`Cannot register unplayable runtime: ${definition.id}`);
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    players: definition.players,
    location: definition.location,
    status: definition.status,
    Component: function RegisteredGameHost() {
      return <GameHost key={definition.id} definition={definition} />;
    },
  };
}
