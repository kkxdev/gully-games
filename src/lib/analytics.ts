export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined
>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
/** No-op when GA hasn't loaded (SSR, tests, consent declined, blocked). */
export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function')
    return;
  window.gtag('event', name, params);
}
