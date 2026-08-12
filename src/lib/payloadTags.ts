/**
 * Collect element / property names from ISO payloads so search can find
 * tags like DbtrAgt, CdtTrfTxInf, TxSts in either XML or JSON.
 */

const XML_TAG_RE = /<\/?([A-Za-z][\w:.-]*)/g;

function localName(name: string): string {
  const i = name.indexOf(':');
  return i >= 0 ? name.slice(i + 1) : name;
}

/** Unique local element names from an XML document (opening + closing tags). */
export function extractXmlTags(xml: string): string[] {
  const tags = new Set<string>();
  XML_TAG_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = XML_TAG_RE.exec(xml)) !== null) {
    const name = localName(match[1]);
    if (name === 'xml' || name.startsWith('!')) continue;
    tags.add(name);
  }
  return [...tags];
}

/** Unique object keys from a JSON document (skips @_attributes and #text). */
export function extractJsonTags(json: string | unknown): string[] {
  let value: unknown = json;
  if (typeof json === 'string') {
    try {
      value = JSON.parse(json);
    } catch {
      return [];
    }
  }
  const tags = new Set<string>();
  walkJson(value, tags);
  return [...tags];
}

function walkJson(value: unknown, tags: Set<string>): void {
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, tags);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === '#text' || key.startsWith('@_')) continue;
    tags.add(localName(key));
    walkJson(child, tags);
  }
}

export function extractPayloadTags(content: string, format: 'xml' | 'json'): string[] {
  return format === 'xml' ? extractXmlTags(content) : extractJsonTags(content);
}

/** Heuristic: looks like an ISO 20022 element id (DbtrAgt, TxSts, …). */
export function looksLikeIsoTag(query: string): boolean {
  const q = query.trim();
  return /^[A-Za-z][A-Za-z0-9]{1,31}$/.test(q) && /[A-Z]/.test(q.slice(1));
}
