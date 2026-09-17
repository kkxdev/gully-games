import { expect, expectTypeOf, it } from 'vitest';
import type { BaseGameState, GameMountOptions } from '../games/core/contracts';
import type {
  GamePresentationProps,
  ReactGameDefinition,
} from '../games/core/game-ui';
import { createGameRegistry } from '../games/core/registry';
import type { PenFightState } from '../games/pen-fight/types';
import { registerGame } from './register-game';
interface WordState extends BaseGameState {
  word: string;
}
it('registers different typed state structures without casting or a universal union', () => {
  const wordGame: ReactGameDefinition<WordState> = {
    id: 'words',
    name: 'Words',
    description: 'Type test',
    players: '1',
    location: 'Test',
    status: 'playable',
    loadRuntime: async () => ({
      mount: ({ onState }) => {
        onState({
          status: 'completed',
          word: 'school',
          result: { winner: null },
        });
        return { restart() {}, destroy() {} };
      },
    }),
    Presentation: ({ state }) => <p>{state?.word}</p>,
  };
  const physicsGame: ReactGameDefinition<PenFightState> = {
    ...wordGame,
    id: 'physics',
    loadRuntime: async () => ({
      mount: () => ({ restart() {}, destroy() {} }),
    }),
    Presentation: ({ state }) => <p>{state?.power}</p>,
  };
  const registry = createGameRegistry([
    registerGame(wordGame),
    registerGame(physicsGame),
  ]);
  expect(registry.all()).toHaveLength(2);
  expect(registry.get('words')?.Component).toBeTypeOf('function');
  expectTypeOf<
    GamePresentationProps<WordState>['state']
  >().toEqualTypeOf<WordState | null>();
  expectTypeOf<
    Parameters<GameMountOptions<PenFightState>['onState']>[0]
  >().toEqualTypeOf<PenFightState>();
  expectTypeOf<WordState>().not.toExtend<PenFightState>();
});
