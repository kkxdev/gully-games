import type { BaseGameState } from '../core/contracts';
import type { Match, Side } from './rules';
export type PenFightPhase = 'aiming' | 'moving' | 'round-over' | 'match-over';
export interface PenFightState extends BaseGameState {
  scores: Match['scores'];
  round: number;
  turn: Side;
  phase: PenFightPhase;
  power: number;
  message: string;
}
