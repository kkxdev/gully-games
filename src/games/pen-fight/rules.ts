export type Side = 'player' | 'cpu';
export type RoundOutcome = Side | 'draw';
export interface Match { scores: Record<Side, number>; round: number; winner: Side | null }
export const initialMatch = (): Match => ({ scores: { player: 0, cpu: 0 }, round: 1, winner: null });
export function roundOutcome(playerOff: boolean, cpuOff: boolean): RoundOutcome | null {
  if (playerOff && cpuOff) return 'draw';
  return playerOff ? 'cpu' : cpuOff ? 'player' : null;
}
// Draws replay the round: five decisive rounds maximum, first to three.
export function completeRound(match: Match, outcome: RoundOutcome): Match {
  if (match.winner || outcome === 'draw') return match;
  const scores = { ...match.scores, [outcome]: match.scores[outcome] + 1 };
  return { scores, round: match.round + (scores[outcome] < 3 ? 1 : 0), winner: scores[outcome] >= 3 ? outcome : null };
}
export interface Vector { x: number; y: number }
export function calculateFlick(origin: Vector, pointer: Vector, maxDrag = 130) {
  const dx = origin.x - pointer.x, dy = origin.y - pointer.y;
  const length = Math.hypot(dx, dy);
  const power = Math.min(1, length / maxDrag);
  return { x: length ? dx / length : 0, y: length ? dy / length : 0, power };
}
export function cpuFlick(cpu: Vector, player: Vector, random: () => number = Math.random) {
  const angle = Math.atan2(player.y - cpu.y, player.x - cpu.x) + (random() - 0.5) * 0.22;
  return { x: Math.cos(angle), y: Math.sin(angle), power: Math.min(0.85, 0.4 + Math.hypot(player.x - cpu.x, player.y - cpu.y) / 850 + random() * 0.12) };
}
