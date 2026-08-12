export type Locale = 'en' | 'fr';

export const LOCALES: Locale[] = ['en', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export const STORAGE_KEY = 'openfinance.locale';

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

export type MessageTree = { [key: string]: string | MessageTree };

/** Resolve `a.b.c` in a nested dictionary. */
export function resolveMessage(tree: MessageTree, path: string): string | undefined {
  const parts = path.split('.');
  let cur: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (cur == null || typeof cur === 'string') return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/** Replace `{{name}}` placeholders. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`,
  );
}
