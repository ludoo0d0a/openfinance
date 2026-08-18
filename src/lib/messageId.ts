import type { MessageIdParts } from '@/types';

const FULL = /^([a-z]{4})\.(\d{3})\.(\d{3})\.(\d{2})(?:\.([a-z]{2})\.(\d{2}))?$/;
const COMPACT = /^([a-z]{4})(\d{3})\.(\d{2})\.(\d{2})(?:\.([a-z]{2})\.(\d{2}))?$/;
const SHORT = /^([a-z]{4})\.(\d{3})$/;

const VERSIONED_ID = '([a-z]{4}\\.\\d{3}\\.\\d{3}\\.\\d{2}(?:\\.[a-z]{2}\\.\\d{2})?)';
const ISO_NS = new RegExp(`urn:iso:std:iso:20022:tech:xsd:${VERSIONED_ID}`);
const SIX_NS = new RegExp(`six-interbank-clearing\\.com/de/${VERSIONED_ID}(?:\\.xsd)?`);

function partsOf(
  raw: string,
  area: string,
  identifier: string,
  variant: string,
  version: string,
  country = '',
  guideline = '',
): MessageIdParts {
  return {
    area,
    identifier,
    variant,
    version,
    country,
    guideline,
    valid: true,
    short: `${area}.${identifier}`,
    raw,
  };
}

/**
 * Splits pacs.008.001.08 (or pacs.008.001.08.ch.02 / pacs008.01.08.ch.02) into
 * its segments. 001 is the variant (message flavour), 08 is the version;
 * ch.02 is a national usage-guideline suffix, not a fifth ISO catalogue step.
 */
export function parseMessageId(raw: string): MessageIdParts {
  const value = raw.trim().toLowerCase();

  const full = FULL.exec(value);
  if (full) {
    const [, area, identifier, variant, version, country, guideline] = full;
    return partsOf(raw, area, identifier, variant, version, country ?? '', guideline ?? '');
  }

  const compact = COMPACT.exec(value);
  if (compact) {
    const [, area, identifier, flavour, version, country, guideline] = compact;
    return partsOf(
      raw,
      area,
      identifier,
      flavour.padStart(3, '0'),
      version,
      country ?? '',
      guideline ?? '',
    );
  }

  const short = SHORT.exec(value);
  if (short) {
    const [, area, identifier] = short;
    return partsOf(raw, area, identifier, '', '');
  }

  return {
    area: '',
    identifier: '',
    variant: '',
    version: '',
    country: '',
    guideline: '',
    valid: false,
    short: '',
    raw,
  };
}

/** Dotted ISO id, with country/guideline when present: pacs.008.001.08.ch.02 */
export function canonicalMessageId(parts: MessageIdParts): string {
  if (!parts.valid) return parts.raw;
  if (!parts.variant || !parts.version) return parts.short;
  let id = `${parts.area}.${parts.identifier}.${parts.variant}.${parts.version}`;
  if (parts.country && parts.guideline) id += `.${parts.country}.${parts.guideline}`;
  return id;
}

/** Compact alias: pacs008.01.08.ch.02. Empty when the id is not fully versioned. */
export function compactMessageId(parts: MessageIdParts): string {
  if (!parts.valid || !parts.variant || !parts.version) return '';
  let id = `${parts.area}${parts.identifier}.${parts.variant.slice(-2)}.${parts.version}`;
  if (parts.country && parts.guideline) id += `.${parts.country}.${parts.guideline}`;
  return id;
}

export function canonicalId(raw: string): string {
  const parts = parseMessageId(raw);
  return parts.valid ? canonicalMessageId(parts) : raw.trim().toLowerCase();
}

/** SIX CH schemas use a distinct Document xmlns; everyone else uses the ISO urn. */
export function namespaceFor(id: string): string {
  const parts = parseMessageId(id);
  const canonical = parts.valid ? canonicalMessageId(parts) : id.trim().toLowerCase();
  if (parts.valid && parts.country === 'ch') {
    return `http://www.six-interbank-clearing.com/de/${canonical}.xsd`;
  }
  return `urn:iso:std:iso:20022:tech:xsd:${canonical}`;
}

/** Pulls the (possibly country-extended) message id out of a Document xmlns. */
export function messageIdFromNamespace(ns: string): string | null {
  return extractVersionedId(ns);
}

/** Versioned id embedded in a sample payload (XML xmlns or JSON Document key). */
export function messageIdFromPayload(content: string): string | null {
  return extractVersionedId(content);
}

function extractVersionedId(text: string): string | null {
  const six = SIX_NS.exec(text);
  if (six) return six[1];
  const iso = ISO_NS.exec(text);
  return iso ? iso[1] : null;
}
