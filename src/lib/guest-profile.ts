export const NICKNAME_MAX_GRAPHEMES = 20;

function graphemes(value: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: 'grapheme',
    });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
}

export function normalizeNickname(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateNickname(
  value: string,
): { ok: true; nickname: string } | { ok: false; message: string } {
  const nickname = normalizeNickname(value);
  if (!nickname)
    return { ok: false, message: 'Write the name your friend knows.' };
  if (graphemes(nickname).length > NICKNAME_MAX_GRAPHEMES)
    return { ok: false, message: 'Keep it to 20 characters or fewer.' };
  if (/\p{Cc}/u.test(nickname))
    return {
      ok: false,
      message: 'That name contains an unsupported character.',
    };
  return { ok: true, nickname };
}
