export interface Player { id: string; name: string; kind: 'human' | 'cpu' }
export type Score = Record<string, number>;
export interface GameResult { winner: string | null; scores: Score }
export interface GameSession { id: string; gameId: string; players: readonly Player[] }
export interface GameMetadata { id: string; name: string; description: string; players: string; location: string; status: 'playable' | 'planned' }
export interface GameLifecycle { destroy(): void; restart(): void }
export interface GameState { scores: Score; round: number; turn: string; phase: 'aiming' | 'moving' | 'round-over' | 'match-over'; power: number; message: string; result?: GameResult }
export interface GameMountOptions { parent: HTMLElement; onState: (state: GameState) => void }
export interface GameDefinition extends GameMetadata { load?: () => Promise<{ mount: (options: GameMountOptions) => GameLifecycle }> }
