/** First-party choice before AdSense personalization cookies. */
export type AdConsentChoice = 'personalized' | 'non-personalized';

const STORAGE_KEY = 'openfinance.adConsent';
const listeners = new Set<() => void>();

/** Google Privacy & messaging debug (`?fc=alwaysshow&fctype=gdpr`). */
export function isFundingChoicesDebug(
  search = typeof window !== 'undefined' ? window.location.search : '',
): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  return params.get('fc') === 'alwaysshow';
}

export function getAdConsent(): AdConsentChoice | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'personalized' || value === 'non-personalized') return value;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

export function setAdConsent(choice: AdConsentChoice): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
  }
  applyAdsPersonalizationFlag(choice);
  for (const listener of listeners) listener();
}

export function subscribeAdConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Consent required before Display units, except FC debug preview where Google
 * must load immediately so `?fc=alwaysshow` can render the CMP UI.
 */
export function resolveAdConsentForAds(search?: string): AdConsentChoice | null {
  if (isFundingChoicesDebug(search)) return 'personalized';
  return getAdConsent();
}

/** Must run before the first `adsbygoogle.push`. */
export function applyAdsPersonalizationFlag(choice: AdConsentChoice | null): void {
  if (typeof window === 'undefined' || !choice) return;
  window.adsbygoogle = window.adsbygoogle ?? [];
  window.adsbygoogle.requestNonPersonalizedAds = choice === 'non-personalized' ? 1 : 0;
}
