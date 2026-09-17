import { expect, it } from 'vitest';
import { createGameRegistry } from './registry';
import type { GameDefinition } from './contracts';
const game: GameDefinition = {
  id: 'test',
  name: 'Test',
  description: 'A test',
  players: '1',
  location: 'Desk',
  status: 'planned',
};
it('discovers games, protects metadata and handles missing IDs', () => {
  const registry = createGameRegistry([game]);
  expect(registry.get('test')?.name).toBe('Test');
  expect(registry.get('missing')).toBeUndefined();
  expect(Object.isFrozen(registry.get('test'))).toBe(true);
  registry.all().pop();
  expect(registry.all()).toHaveLength(1);
});
it('rejects duplicates and playable games without a loader', () => {
  expect(() => createGameRegistry([game, game])).toThrow('Duplicate game');
  expect(() => createGameRegistry([{ ...game, status: 'playable' }])).toThrow(
    'Missing loader',
  );
});
