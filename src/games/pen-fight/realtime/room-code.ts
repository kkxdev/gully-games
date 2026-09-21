const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 6;

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isRoomCode(value: string): boolean {
  const code = normalizeRoomCode(value);
  return (
    code.length === ROOM_CODE_LENGTH &&
    [...code].every((character) => ALPHABET.includes(character))
  );
}

export function createRoomCode(random: () => number = Math.random): string {
  return Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ALPHABET[Math.floor(random() * ALPHABET.length)],
  ).join('');
}
