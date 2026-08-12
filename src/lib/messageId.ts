import type { MessageIdParts } from '@/types';

const FULL = /^([a-z]{4})\.(\d{3})\.(\d{3})\.(\d{2})$/;
const SHORT = /^([a-z]{4})\.(\d{3})$/;

/**
 * Splits pacs.008.001.08 into its four meaningful segments.
 * Every segment means something different and people conflate the last two
 * constantly: 001 is the variant (message flavour), 08 is the version.
 */
export function parseMessageId(raw: string): MessageIdParts {
  const value = raw.trim().toLowerCase();

  const full = FULL.exec(value);
  if (full) {
    const [, area, identifier, variant, version] = full;
    return {
      area,
      identifier,
      variant,
      version,
      valid: true,
      short: `${area}.${identifier}`,
      raw,
    };
  }

  const short = SHORT.exec(value);
  if (short) {
    const [, area, identifier] = short;
    return {
      area,
      identifier,
      variant: '',
      version: '',
      valid: true,
      short: `${area}.${identifier}`,
      raw,
    };
  }

  return { area: '', identifier: '', variant: '', version: '', valid: false, short: '', raw };
}

/** urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08 */
export function namespaceFor(id: string): string {
  return `urn:iso:std:iso:20022:tech:xsd:${id}`;
}

/** Pulls the message id back out of a Document namespace declaration. */
export function messageIdFromNamespace(ns: string): string | null {
  const match = /urn:iso:std:iso:20022:tech:xsd:([a-z]{4}\.\d{3}\.\d{3}\.\d{2})/.exec(ns);
  return match ? match[1] : null;
}

/** Versioned id embedded in a sample payload (XML xmlns or JSON Document key). */
export function messageIdFromPayload(content: string): string | null {
  const fromNs = /urn:iso:std:iso:20022:tech:xsd:([a-z]{4}\.\d{3}\.\d{3}\.\d{2})/.exec(content);
  if (fromNs) return fromNs[1];
  const fromJson = /"Document[^"]*@xmlns[^"]*"\s*:\s*"urn:iso:std:iso:20022:tech:xsd:([a-z]{4}\.\d{3}\.\d{3}\.\d{2})"/.exec(
    content,
  );
  return fromJson ? fromJson[1] : null;
}
