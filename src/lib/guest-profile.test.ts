import { describe, expect, it } from 'vitest';
import { normalizeNickname, validateNickname } from './guest-profile';

describe('guest nicknames', () => {
  it('trims and collapses whitespace without interpreting markup', () => {
    expect(normalizeNickname('  Bunty   <b>  ')).toBe('Bunty <b>');
    expect(validateNickname('  Bunty   <b>  ')).toEqual({
      ok: true,
      nickname: 'Bunty <b>',
    });
  });
  it('requires a name and limits it by grapheme clusters', () => {
    expect(validateNickname('   ').ok).toBe(false);
    expect(validateNickname('👍🏽'.repeat(20)).ok).toBe(true);
    expect(validateNickname('👍🏽'.repeat(21)).ok).toBe(false);
  });
  it('rejects control characters', () => {
    expect(validateNickname('Bunty\u0000').ok).toBe(false);
  });
});
