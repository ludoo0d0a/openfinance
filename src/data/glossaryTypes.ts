import type { CodeEntry, CodeFamily, Locale } from '@/types';

export type GlossaryCategory =
  | 'concept'
  | 'regulation'
  | 'message'
  | 'code'
  | 'scheme';

export type GlossarySourceId = 'ukob' | 'mastercard' | 'konsentus' | 'bundesbank' | 'ravelin';

export interface GlossaryLink {
  label: string;
  href: string;
}

export interface GlossarySource {
  id: GlossarySourceId;
  label: string;
  href: string;
}

export interface GlossaryEntry {
  id: string;
  /** Canonical short form (often an acronym), shown as the heading. */
  term: string;
  name: Record<Locale, string>;
  aliases: Record<Locale, string[]>;
  category: GlossaryCategory;
  definition: Record<Locale, string>;
  seeAlso?: string[];
  links?: GlossaryLink[];
  /** External glossaries this entry is aligned with. */
  sources?: GlossarySourceId[];
  family?: CodeFamily;
  severity?: CodeEntry['severity'];
  http?: number;
  action?: string;
}

export const GLOSSARY_SOURCES: GlossarySource[] = [
  {
    id: 'ukob',
    label: 'Open Banking UK glossary',
    href: 'https://www.openbanking.org.uk/glossary/',
  },
  {
    id: 'mastercard',
    label: 'Mastercard Open Finance US glossary',
    href: 'https://developer.mastercard.com/open-finance-us/documentation/glossary/',
  },
  {
    id: 'konsentus',
    label: 'Konsentus Open Banking & Open Finance glossary (Europe)',
    href: 'https://www.konsentus.com/open-banking-open-finance-glossary-europe/',
  },
  {
    id: 'bundesbank',
    label: 'Deutsche Bundesbank PSD2 glossary',
    href: 'https://www.bundesbank.de/en/tasks/payment-systems/psd2/psd2-glossary-775962',
  },
  {
    id: 'ravelin',
    label: 'Ravelin PSD glossary (acronyms)',
    href: 'https://www.ravelin.com/blog/psd2-glossary-acronyms',
  },
];

export function g(
  id: string,
  term: string,
  category: GlossaryCategory,
  name: Record<Locale, string>,
  definition: Record<Locale, string>,
  opts?: {
    aliases?: Record<Locale, string[]>;
    seeAlso?: string[];
    links?: GlossaryLink[];
    sources?: GlossarySourceId[];
  },
): GlossaryEntry {
  return {
    id,
    term,
    category,
    name,
    definition,
    aliases: opts?.aliases ?? { en: [name.en], fr: [name.fr] },
    seeAlso: opts?.seeAlso,
    links: opts?.links,
    sources: opts?.sources,
  };
}
