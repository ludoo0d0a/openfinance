import { XMLBuilder, XMLParser } from 'fast-xml-parser';

/**
 * Convert ISO 20022 XML ↔ JSON for the explorer.
 * JSON is a natural mapping of the Document tree (attributes as @_keys),
 * not a Berlin Group API body — useful to inspect structure without XML noise.
 */

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
  const body = builder.build(obj);
  const xml = String(body).trim();
  if (xml.startsWith('<?xml')) return xml;
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

export function tryXmlToJsonString(xml: string): { ok: true; json: string } | { ok: false; error: string } {
  try {
    return { ok: true, json: xmlToJsonString(xml) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'XML → JSON failed' };
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
