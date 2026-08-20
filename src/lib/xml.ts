import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { messageIdFromNamespace } from './messageId';

export interface XmlNode {
  /** Element name without namespace prefix */
  name: string;
  /** Slash-joined path from the document root, excluding <Document> */
  path: string;
  attributes: Record<string, string>;
  text: string | null;
  children: XmlNode[];
  depth: number;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  preserveOrder: true,
  ignoreDeclaration: true,
  ignorePiTags: true,
});

interface OrderedEntry {
  [key: string]: unknown;
  ':@'?: Record<string, string>;
}

const stripPrefix = (name: string) => (name.includes(':') ? name.slice(name.indexOf(':') + 1) : name);

function buildNodes(entries: OrderedEntry[], parentPath: string, depth: number): XmlNode[] {
  const nodes: XmlNode[] = [];

  for (const entry of entries) {
    const attrs = entry[':@'] ?? {};
    const tagName = Object.keys(entry).find((k) => k !== ':@');
    if (!tagName) continue;

    const value = entry[tagName];
    const name = stripPrefix(tagName);

    if (name === '#text') continue;

    const path = parentPath ? `${parentPath}/${name}` : name;
    const attributes: Record<string, string> = {};
    for (const [k, v] of Object.entries(attrs)) {
      attributes[k.replace(/^@_/, '')] = String(v);
    }

    const childEntries = Array.isArray(value) ? (value as OrderedEntry[]) : [];
    const textEntry = childEntries.find((c) => '#text' in c);
    const text = textEntry ? String(textEntry['#text']) : null;
    const elementChildren = childEntries.filter((c) => !('#text' in c));

    nodes.push({
      name,
      path,
      attributes,
      text: elementChildren.length === 0 ? text : null,
      children: buildNodes(elementChildren, path, depth + 1),
      depth,
    });
  }

  return nodes;
}

export interface ParsedXml {
  wellFormed: boolean;
  error: string | null;
  /** Namespace declared on the root element */
  namespace: string | null;
  /** Message id derived from the namespace, e.g. pacs.008.001.08 */
  messageId: string | null;
  root: XmlNode | null;
  stats: { elements: number; depth: number; bytes: number };
}

export function parseXml(xml: string): ParsedXml {
  const bytes = new TextEncoder().encode(xml).length;
  const check = XMLValidator.validate(xml, { allowBooleanAttributes: true });

  if (check !== true) {
    return {
      wellFormed: false,
      error: `${check.err.msg} (line ${check.err.line})`,
      namespace: null,
      messageId: null,
      root: null,
      stats: { elements: 0, depth: 0, bytes },
    };
  }

  const parsed = parser.parse(xml) as OrderedEntry[];
  const nodes = buildNodes(parsed, '', 0);
  const root = nodes[0] ?? null;

  const namespace = root ? (root.attributes.xmlns ?? findNsAttribute(root) ?? null) : null;

  let elements = 0;
  let maxDepth = 0;
  const walk = (node: XmlNode) => {
    elements += 1;
    maxDepth = Math.max(maxDepth, node.depth);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);

  return {
    wellFormed: true,
    error: null,
    namespace,
    messageId: namespace ? messageIdFromNamespace(namespace) : null,
    root,
    stats: { elements, depth: maxDepth, bytes },
  };
}

function findNsAttribute(node: XmlNode): string | undefined {
  const key = Object.keys(node.attributes).find((k) => k === 'xmlns' || k.startsWith('xmlns:'));
  return key ? node.attributes[key] : undefined;
}

/** Path used to join form fields and tree rows: Document-relative, optional `@attr`. */
export function xmlSelector(node: XmlNode, attr?: string): string {
  const rel = node.path.replace(/^Document\/?/, '');
  const base = rel || node.name;
  return attr ? `${base}@${attr}` : base;
}

export function xmlElementPath(selector: string): string {
  return selector.split('@')[0] ?? selector;
}

/** Leaf text nodes and attributes, in document order. */
export function collectLeaves(root: XmlNode | null): { selector: string; value: string }[] {
  const out: { selector: string; value: string }[] = [];
  const walk = (node: XmlNode) => {
    for (const [k, v] of Object.entries(node.attributes)) {
      out.push({ selector: xmlSelector(node, k), value: v });
    }
    if (node.children.length === 0 && node.text != null) {
      out.push({ selector: xmlSelector(node), value: node.text });
    }
    node.children.forEach(walk);
  };
  if (root) walk(root);
  return out;
}

/** Every path present in the document, relative to the Document element. */
export function collectPaths(root: XmlNode | null): Set<string> {
  const paths = new Set<string>();
  if (!root) return paths;

  const rootIsDocument = root.name === 'Document';
  const walk = (node: XmlNode, prefix: string) => {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    paths.add(path);
    node.children.forEach((c) => walk(c, path));
  };

  if (rootIsDocument) {
    root.children.forEach((c) => walk(c, ''));
  } else {
    walk(root, '');
  }

  return paths;
}

/** Depth-first search over node names, paths, attribute values and text. */
export function searchNodes(root: XmlNode | null, query: string): XmlNode[] {
  if (!root || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const hits: XmlNode[] = [];

  const walk = (node: XmlNode) => {
    const haystack = [node.name, node.path, node.text ?? '', ...Object.values(node.attributes)].join(' ').toLowerCase();
    if (haystack.includes(q)) hits.push(node);
    node.children.forEach(walk);
  };

  walk(root);
  return hits;
}

/** Reformat with two-space indentation. Cheap, and good enough for display. */
export function formatXml(xml: string): string {
  const compact = xml.replace(/>\s+</g, '><').trim();
  let indent = 0;
  const out: string[] = [];

  compact.replace(/<[^>]+>[^<]*/g, (chunk) => {
    const tagEnd = chunk.indexOf('>');
    const tag = chunk.slice(0, tagEnd + 1);
    const text = chunk.slice(tagEnd + 1);

    const isClosing = /^<\//.test(tag);
    const isSelfClosing = /\/>$/.test(tag) || /^<\?/.test(tag) || /^<!/.test(tag);

    if (isClosing) indent = Math.max(0, indent - 1);
    out.push('  '.repeat(indent) + tag + text.trim());
    if (!isClosing && !isSelfClosing) indent += 1;

    return chunk;
  });

  return out.join('\n');
}
