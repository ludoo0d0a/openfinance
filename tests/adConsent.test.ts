import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyAdsPersonalizationFlag,
  getAdConsent,
  setAdConsent,
  subscribeAdConsent,
} from '../src/lib/adConsent';

function installBrowserStubs() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => store.clear(),
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  vi.stubGlobal('window', { adsbygoogle: undefined as Window['adsbygoogle'] });
}

describe('adConsent', () => {
  beforeEach(() => {
    installBrowserStubs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with no stored choice', () => {
    expect(getAdConsent()).toBeNull();
  });

  it('persists personalized and non-personalized choices', () => {
    setAdConsent('personalized');
    expect(getAdConsent()).toBe('personalized');
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(0);

    setAdConsent('non-personalized');
    expect(getAdConsent()).toBe('non-personalized');
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });

  it('notifies subscribers when the choice changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAdConsent(listener);
    setAdConsent('personalized');
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setAdConsent('non-personalized');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('applies the NPA flag without persisting when called directly', () => {
    applyAdsPersonalizationFlag('non-personalized');
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
    expect(getAdConsent()).toBeNull();
  });
});
