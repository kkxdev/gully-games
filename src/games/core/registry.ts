import type { GameDefinition } from './contracts';
export function createGameRegistry(definitions: readonly GameDefinition[]) {
  const games = new Map<string, GameDefinition>();
  for (const game of definitions) {
    if (games.has(game.id)) throw new Error(`Duplicate game: ${game.id}`);
    if (game.status === 'playable' && !game.load) throw new Error(`Missing loader: ${game.id}`);
    games.set(game.id, Object.freeze({ ...game }));
  }
  return { all: () => [...games.values()], get: (id: string) => games.get(id) };
}
