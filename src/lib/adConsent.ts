/** First-party choice before AdSense personalization cookies. */
export type AdConsentChoice = 'personalized' | 'non-personalized';

const STORAGE_KEY = 'openfinance.adConsent';
const listeners = new Set<() => void>();

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

/** Must run before the first `adsbygoogle.push`. */
export function applyAdsPersonalizationFlag(choice: AdConsentChoice | null): void {
  if (typeof window === 'undefined' || !choice) return;
  window.adsbygoogle = window.adsbygoogle ?? [];
  window.adsbygoogle.requestNonPersonalizedAds = choice === 'non-personalized' ? 1 : 0;
}
