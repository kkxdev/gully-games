import type { ComponentType, ReactNode } from 'react';
import type { BaseGameState, GameDefinition, GameMetadata } from './contracts';

/** React presentation is paired with a state type before entering the registry. */
export interface GamePresentationProps<TState extends BaseGameState> {
  state: TState | null;
  restart: () => void;
  canRestart: boolean;
  children: ReactNode;
}
export interface ReactGameDefinition<
  TState extends BaseGameState,
> extends GameDefinition<TState> {
  Presentation: ComponentType<GamePresentationProps<TState>>;
}
/** A component closure preserves the runtime/UI pairing in a heterogeneous registry. */
export interface RegisteredGame extends GameMetadata {
  Component?: ComponentType;
}
