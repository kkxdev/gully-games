import type { RegisteredGame } from './game-ui';
export function createGameRegistry(definitions: readonly RegisteredGame[]) {
  const games = new Map<string, RegisteredGame>();
  for (const game of definitions) {
    if (games.has(game.id)) throw new Error(`Duplicate game: ${game.id}`);
    if (game.status === 'playable' && !game.Component)
      throw new Error(`Missing presentation: ${game.id}`);
    games.set(game.id, Object.freeze({ ...game }));
  }
  return { all: () => [...games.values()], get: (id: string) => games.get(id) };
}
