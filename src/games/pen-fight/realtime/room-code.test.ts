import { describe, expect, it } from 'vitest';
import { createRoomCode, isRoomCode, normalizeRoomCode } from './room-code';

describe('room codes', () => {
  it('creates six-character codes from the unambiguous alphabet', () => {
    expect(createRoomCode(() => 0)).toBe('222222');
    expect(isRoomCode(createRoomCode(() => 0.999))).toBe(true);
  });
  it('normalizes case and rejects ambiguous or malformed codes', () => {
    expect(normalizeRoomCode(' abcd23 ')).toBe('ABCD23');
    expect(isRoomCode('abcd23')).toBe(true);
    expect(isRoomCode('ABCO23')).toBe(false);
    expect(isRoomCode('ABC23')).toBe(false);
  });
});
