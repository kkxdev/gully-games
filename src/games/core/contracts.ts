export interface Player {
  id: string;
  name: string;
  kind: 'human' | 'cpu';
}
export type Score = Record<string, number>;
export interface GameResult {
  winner: string | null;
  scores?: Score;
}
export interface GameSession {
  id: string;
  gameId: string;
  players: readonly Player[];
}
export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  players: string;
  location: string;
  status: 'playable' | 'planned';
}
export interface GameLifecycle {
  destroy(): void;
  restart(): void;
}
/** Lifecycle state only. Each game owns its simulation and presentation fields. */
export type GameStatus = 'ready' | 'playing' | 'completed' | 'error';
export interface BaseGameState {
  status: GameStatus;
  result?: GameResult;
}
export interface GameMountOptions<
  TState extends BaseGameState = BaseGameState,
> {
  parent: HTMLElement;
  onState: (state: TState) => void;
  onError?: (cause: unknown) => void;
}
export interface GameRuntime<TState extends BaseGameState = BaseGameState> {
  mount(options: GameMountOptions<TState>): GameLifecycle;
}
export interface GameDefinition<
  TState extends BaseGameState = BaseGameState,
> extends GameMetadata {
  loadRuntime: () => Promise<GameRuntime<TState>>;
}
