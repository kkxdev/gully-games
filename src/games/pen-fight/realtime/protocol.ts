export const PROTOCOL_VERSION = 1 as const;
export type PlayMode = 'practice' | 'realtime';
export type Seat = 'host' | 'guest';
export type RoomPhase =
  | 'waiting'
  | 'ready'
  | 'playing'
  | 'round-over'
  | 'match-over'
  | 'abandoned'
  | 'expired';

export interface GuestProfile {
  nickname: string;
}

export interface RoomPlayer extends GuestProfile {
  seat: Seat;
  connected: boolean;
  ready: boolean;
  colour: 'blue' | 'red';
}

export interface RoomSnapshot {
  code: string;
  phase: RoomPhase;
  players: Partial<Record<Seat, RoomPlayer>>;
  turnId: number;
  activeSeat: Seat;
  scores: Record<Seat, number>;
  expiresAt: string;
}

export interface FlickCommand {
  commandId: string;
  turnId: number;
  direction: { x: number; y: number };
  power: number;
}

export interface ResolvedTurn {
  turnId: number;
  keyframes: Array<{
    atMs: number;
    pens: Record<Seat, { x: number; y: number; angle: number }>;
  }>;
  durationMs: number;
  outcome: Seat | 'draw' | null;
  resultingState: RoomSnapshot;
}

export type ClientMessage =
  | { version: 1; type: 'authenticate'; seatToken: string }
  | { version: 1; type: 'ready'; ready: boolean }
  | ({ version: 1; type: 'flick' } & FlickCommand)
  | { version: 1; type: 'rematch'; accept: boolean }
  | { version: 1; type: 'heartbeat'; sentAt: number }
  | { version: 1; type: 'leave' };

export type ServerMessage =
  | { version: 1; type: 'snapshot'; snapshot: RoomSnapshot }
  | {
      version: 1;
      type: 'presence';
      seat: Seat;
      connected: boolean;
      reconnectBy?: string;
    }
  | { version: 1; type: 'turn-resolved'; turn: ResolvedTurn }
  | {
      version: 1;
      type: 'match-event';
      event: 'started' | 'round-ended' | 'match-ended' | 'rematch-started';
    }
  | {
      version: 1;
      type: 'error';
      code: string;
      message: string;
      recoverable: true;
    }
  | {
      version: 1;
      type: 'room-ended';
      reason: 'full' | 'expired' | 'abandoned' | 'unauthorized';
    };
