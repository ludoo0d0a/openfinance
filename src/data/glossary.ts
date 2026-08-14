import type { CodeEntry, CodeFamily, Locale } from '@/types';
import { CODES } from './codes';
import { GLOSSARY_ENTRIES } from './glossaryEntries';
import { GLOSSARY_MASTERCARD } from './glossaryMastercard';
import type { GlossaryCategory, GlossaryEntry } from './glossaryTypes';

export type {
  GlossaryCategory,
  GlossaryEntry,
  GlossaryLink,
  GlossarySource,
  GlossarySourceId,
} from './glossaryTypes';
export { GLOSSARY_SOURCES, g } from './glossaryTypes';

/** Bilingual overlays for codes that already had a glossary entry. */
const CODE_OVERLAYS: Record<string, Partial<GlossaryEntry>> = {
  mtch: {
    name: { en: 'Match', fr: 'Correspondance' },
    aliases: { en: ['match', 'VoP match'], fr: ['match', 'correspondance VoP'] },
    definition: {
      en: 'VoP outcome: the typed payee name matches the account holder. Safe to proceed with the credit transfer.',
      fr: 'Résultat VoP : le nom saisi correspond au titulaire du compte. On peut poursuivre le virement en sécurité.',
    },
    seeAlso: ['vop', 'cmtc', 'nmtc'],
  },
  cmtc: {
    name: { en: 'Close match', fr: 'Correspondance proche' },
    aliases: {
      en: ['close match', 'CMTC'],
      fr: ['correspondance proche', 'quasi-correspondance', 'CMTC'],
    },
    definition: {
      en: 'VoP outcome: not an exact match, but a close one. The report returns the suggested legal name. The PSU must see it and confirm before the payment continues.',
      fr: 'Résultat VoP : pas une correspondance exacte, mais proche. Le rapport renvoie le nom légal suggéré. Le PSU doit le voir et confirmer avant de poursuivre le paiement.',
    },
    seeAlso: ['vop', 'mtch', 'nmtc'],
  },
  nmtc: {
    name: { en: 'No match', fr: 'Aucune correspondance' },
    aliases: {
      en: ['no match', 'mismatch', 'NMTC'],
      fr: ['aucune correspondance', 'non-correspondance', 'mismatch', 'NMTC'],
    },
    definition: {
      en: 'VoP outcome: the name does not match the account. The PSU may still proceed after an explicit risk acceptance; log that consent for liability.',
      fr: 'Résultat VoP : le nom ne correspond pas au compte. Le PSU peut quand même continuer après acceptation explicite du risque ; journalisez ce consentement pour la responsabilité.',
    },
    seeAlso: ['vop', 'mtch', 'cmtc'],
  },
};

export function slugCodeId(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function entryFromCode(c: CodeEntry): GlossaryEntry {
  const id = slugCodeId(c.code);
  const overlay = CODE_OVERLAYS[id];
  return {
    id,
    term: c.code,
    name: overlay?.name ?? { en: c.name, fr: c.name },
    aliases: overlay?.aliases ?? { en: [c.name], fr: [c.name] },
    category: 'code',
    definition: overlay?.definition ?? { en: c.description, fr: c.description },
    seeAlso: overlay?.seeAlso,
    family: c.family,
    severity: c.severity,
    http: c.http,
    action: c.action,
  };
}

/**
 * Payments / Open Finance glossary. English is the working language of the
 * catalog; French names and definitions sit on the same entries.
 * Status and error codes from `codes.ts` are merged in as category `code`.
 * ISO message ids (pacs.008, …) are category `message` when authored —
 * currently acmt.023 / acmt.024 only.
 */
export const GLOSSARY: GlossaryEntry[] = [...GLOSSARY_ENTRIES, ...GLOSSARY_MASTERCARD, ...CODES.map(entryFromCode)];

export const GLOSSARY_CODES = GLOSSARY.filter((e) => e.category === 'code');

export const CODE_FAMILIES = [
  'iso-tx-status',
  'iso-status-reason',
  'bg-error',
  'stet-error',
  'ukob-error',
  'sca-status',
  'consent-status',
  'scheme-status',
] as const satisfies readonly CodeFamily[];

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, Record<Locale, string>> = {
  concept: { en: 'Concept', fr: 'Concept' },
  regulation: { en: 'Regulation', fr: 'Réglementation' },
  message: { en: 'Message', fr: 'Message' },
  code: { en: 'Code', fr: 'Code' },
  scheme: { en: 'Scheme', fr: 'Schéma' },
};

export function glossaryById(id: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.id === id);
}

export function codeByValue(code: string): GlossaryEntry | undefined {
  const q = code.toLowerCase();
  return GLOSSARY_CODES.find((e) => e.term.toLowerCase() === q);
}

export function glossaryHref(entry: Pick<GlossaryEntry, 'id' | 'category'>): string {
  return entry.category === 'code'
    ? `/glossary?category=code&id=${encodeURIComponent(entry.id)}`
    : `/glossary?id=${encodeURIComponent(entry.id)}`;
}

export function localizeGlossaryEntry(entry: GlossaryEntry, locale: Locale) {
  return {
    ...entry,
    displayName: entry.name[locale] ?? entry.name.en,
    displayDefinition: entry.definition[locale] ?? entry.definition.en,
    displayAliases: entry.aliases[locale] ?? entry.aliases.en,
    categoryLabel: GLOSSARY_CATEGORY_LABELS[entry.category][locale],
  };
}

/**
 * Rank a glossary hit: 0 exact term, 1 exact alias/name, 2 prefix, 3 contains
 * in term/name/alias, 4 definition/action. Null = no match.
 */
export function glossaryMatchRank(entry: GlossaryEntry, query: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const term = entry.term.toLowerCase();
  const names = [entry.name.en, entry.name.fr].map((s) => s.toLowerCase());
  const aliases = [...entry.aliases.en, ...entry.aliases.fr].map((s) => s.toLowerCase());
  const labels = [term, entry.id.toLowerCase(), ...names, ...aliases];

  if (term === q || entry.id.toLowerCase() === q) return 0;
  if (names.includes(q) || aliases.includes(q)) return 1;
  if (labels.some((s) => s.startsWith(q))) return 2;
  if (labels.some((s) => s.includes(q))) return 3;

  const body = [entry.definition.en, entry.definition.fr, entry.action ?? '', entry.family ?? '']
    .join(' ')
    .toLowerCase();
  if (body.includes(q)) return 4;
  return null;
}

/** Glossary page + ⌘K share this matcher. Results are best-match first. */
export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim();
  if (!q) return [];
  return GLOSSARY.map((e) => ({ e, rank: glossaryMatchRank(e, q) }))
    .filter((x): x is { e: GlossaryEntry; rank: number } => x.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.e.term.localeCompare(b.e.term))
    .map((x) => x.e);
}
