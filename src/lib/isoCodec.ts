import { XMLBuilder, XMLParser } from 'fast-xml-parser';

/**
 * Convert XML ↔ JSON for the explorer.
 * ISO 20022 JSON is a Document tree (attributes as @_keys).
 * API JSON with several top-level keys (or a top-level array) is wrapped in
 * <payload> so the XML is well-formed and can be shown in the same inspector.
 */

const JSON_XML_ROOT = 'payload';

const parseOpts = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  ignoreDeclaration: true,
  ignorePiTags: true,
} as const;

const buildOpts = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: true,
} as const;

const objectParser = new XMLParser(parseOpts);
const builder = new XMLBuilder(buildOpts);

export function xmlToJson(xml: string): unknown {
  const parsed = objectParser.parse(xml);
  return parsed;
}

export function xmlToJsonString(xml: string, pretty = true): string {
  const obj = xmlToJson(xml);
  return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

export function jsonToXml(json: unknown): string {
  const obj = typeof json === 'string' ? (JSON.parse(json) as unknown) : json;
  const body = builder.build(wrapJsonForXml(obj));
  const xml = String(body).trim();
  if (xml.startsWith('<?xml')) return xml;
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

/** True when JSON would produce several XML roots (or none) without a wrapper. */
export function needsXmlRoot(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') return true;
  if (Array.isArray(obj)) return true;
  const keys = Object.keys(obj);
  if (keys.length !== 1) return true;
  return Array.isArray((obj as Record<string, unknown>)[keys[0]]);
}

function wrapJsonForXml(obj: unknown): unknown {
  return needsXmlRoot(obj) ? { [JSON_XML_ROOT]: obj } : obj;
}

/** Drop the synthetic <payload> wrapper when converting an API body back to JSON. */
export function unwrapJsonXmlRoot(converted: unknown, original: unknown): unknown {
  if (!needsXmlRoot(original)) return converted;
  if (converted && typeof converted === 'object' && !Array.isArray(converted) && JSON_XML_ROOT in converted) {
    return (converted as Record<string, unknown>)[JSON_XML_ROOT];
  }
  return converted;
}

export function prettyJsonString(raw: string): string {
  return JSON.stringify(JSON.parse(raw), null, 2);
}

export function tryXmlToJsonString(xml: string): { ok: true; json: string } | { ok: false; error: string } {
  try {
    return { ok: true, json: xmlToJsonString(xml) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'XML → JSON failed' };
  }
}

/** XML → JSON, removing <payload> when the original JSON needed that wrapper. */
export function tryXmlToSourceJson(
  xml: string,
  originalJson: string,
): { ok: true; json: string } | { ok: false; error: string } {
  try {
    const converted = xmlToJson(xml);
    const original = JSON.parse(originalJson) as unknown;
    return { ok: true, json: JSON.stringify(unwrapJsonXmlRoot(converted, original), null, 2) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'XML → JSON failed' };
  }
}

export function tryPrettyJson(raw: string): { ok: true; json: string } | { ok: false; error: string } {
  try {
    return { ok: true, json: prettyJsonString(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function tryJsonToXml(json: string): { ok: true; xml: string } | { ok: false; error: string } {
  try {
    return { ok: true, xml: jsonToXml(json) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'JSON → XML failed' };
  }
}

export function isProbablyXml(content: string): boolean {
  return /^\s*</.test(content);
}

export function isProbablyJson(content: string): boolean {
  const t = content.trim();
  return t.startsWith('{') || t.startsWith('[');
}
