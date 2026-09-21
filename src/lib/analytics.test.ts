// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { trackEvent } from './analytics';
afterEach(() => {
  Reflect.deleteProperty(window, 'gtag');
});
it('does not throw when gtag has not loaded', () => {
  expect(() =>
    trackEvent('game_start', { game_id: 'pen-fight' }),
  ).not.toThrow();
});
it('forwards the event name and params to gtag once loaded', () => {
  const gtag = vi.fn();
  window.gtag = gtag;
  trackEvent('game_start', { game_id: 'pen-fight' });
  expect(gtag).toHaveBeenCalledWith('event', 'game_start', {
    game_id: 'pen-fight',
  });
});
it('forwards no params when none are given', () => {
  const gtag = vi.fn();
  window.gtag = gtag;
  trackEvent('game_ready');
  expect(gtag).toHaveBeenCalledWith('event', 'game_ready', undefined);
});
