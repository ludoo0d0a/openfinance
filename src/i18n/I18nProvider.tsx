import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { fr } from './locales/fr';
import {
  detectLocale,
  interpolate,
  resolveMessage,
  STORAGE_KEY,
  type Locale,
  type MessageTree,
} from './types';
import { I18nContext, type I18nContextValue } from './context';

const DICTS: Record<Locale, MessageTree> = { en, fr };

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Force locale (prerender). Omit to detect from storage / navigator. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const fromLocale = resolveMessage(DICTS[locale], key);
      const fallback = locale === 'en' ? undefined : resolveMessage(DICTS.en, key);
      const template = fromLocale ?? fallback ?? key;
      return interpolate(template, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
