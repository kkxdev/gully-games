'use client';
import { gameRegistry } from '@/games/registry';
export function GameLauncher({ gameId }: { gameId: string }) {
  const game = gameRegistry.get(gameId);
  const Component = game?.Component;
  if (!Component)
    return (
      <p role="status">
        This game is not available yet. Please choose another game.
      </p>
    );
  return <Component key={game.id} />;
}
