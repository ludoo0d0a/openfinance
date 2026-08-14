import MiniSearch from 'minisearch';
import { STANDARDS } from '@/data/standards';
import { ISO_MESSAGES } from '@/data/iso20022';
import { FLOWS } from '@/data/flows';
import { ALL_SAMPLES } from '@/data/samples';
import { GLOSSARY, glossaryHref, searchGlossary, type GlossaryEntry } from '@/data/glossary';
import { extractPayloadTags } from '@/lib/payloadTags';

export type ResultKind = 'standard' | 'message' | 'flow' | 'code' | 'sample' | 'endpoint' | 'term';

export interface IndexedDoc {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  body: string;
  /** Router path to open this result */
  href: string;
  /** Extra keywords that should match but should not be displayed */
  keywords: string;
  /** ISO / JSON element names (DbtrAgt, TxSts, …) */
  tags: string;
}

function buildDocuments(): IndexedDoc[] {
  const docs: IndexedDoc[] = [];

  for (const s of STANDARDS) {
    docs.push({
      id: `standard:${s.id}`,
      kind: 'standard',
      title: s.name,
      subtitle: `${s.publisher} · ${s.region} · v${s.version}`,
      body: s.summary,
      href: `/standards/${s.id}`,
      keywords: [s.region, s.publisher, ...s.scaApproaches, ...s.apis.map((a) => a.role)].join(' '),
      tags: '',
    });

    for (const api of s.apis) {
      for (const ep of api.endpoints) {
        docs.push({
          id: `endpoint:${s.id}:${api.id}:${ep.method}:${ep.path}`,
          kind: 'endpoint',
          title: `${ep.method} ${ep.path}`,
          subtitle: `${s.name} · ${api.name}`,
          body: ep.summary,
          href: `/standards/${s.id}#${api.id}`,
          keywords: [api.role, s.region, ep.scope ?? ''].join(' '),
          tags: '',
        });
      }
    }
  }

  for (const m of ISO_MESSAGES) {
    const pathTags = m.requiredPaths.flatMap((p) => p.split('/').filter(Boolean));
    const sampleTags = ALL_SAMPLES.filter(
      (s) => s.messageShort === m.short && s.format === 'xml' && !s.id.endsWith('-json'),
    ).flatMap((s) => extractPayloadTags(s.content, 'xml'));
    docs.push({
      id: `message:${m.short}`,
      kind: 'message',
      title: m.short,
      subtitle: m.name,
      body: m.purpose,
      href: `/messages/${m.short}`,
      keywords: [
        m.id,
        m.rootElement,
        m.area,
        m.direction,
        ...m.tags,
        ...(m.versions ?? []).flatMap((v) => [v.id, ...v.markets]),
        ...pathTags,
      ].join(' '),
      tags: [...new Set([m.rootElement, ...pathTags, ...sampleTags])].join(' '),
    });
  }

  for (const f of FLOWS) {
    docs.push({
      id: `flow:${f.id}`,
      kind: 'flow',
      title: f.name,
      subtitle: f.summary,
      body: f.useCase,
      href: `/flows/${f.id}`,
      keywords: [f.category, ...f.tags, ...f.steps.map((s) => `${s.label} ${s.path ?? ''} ${s.messageShort ?? ''}`)].join(' '),
      tags: [...new Set(f.steps.map((s) => s.messageShort).filter(Boolean))].join(' '),
    });
  }

  for (const s of ALL_SAMPLES) {
    // Companions duplicate the XML tag set; skip extraction to keep the index lean.
    const payloadTags =
      s.id.endsWith('-json') && s.format === 'json' ? [] : extractPayloadTags(s.content, s.format);

    docs.push({
      id: `sample:${s.id}`,
      kind: 'sample',
      title: s.label,
      subtitle: s.format.toUpperCase(),
      body: s.description,
      href: `/samples/${s.id}`,
      keywords: [s.messageShort ?? '', s.standardId ?? '', s.format].join(' '),
      tags: payloadTags.join(' '),
    });
  }

  for (const e of GLOSSARY) {
    const isCode = e.category === 'code';
    docs.push({
      id: isCode ? `code:${e.term}` : `term:${e.id}`,
      kind: isCode ? 'code' : 'term',
      title: e.term,
      subtitle: e.name.en,
      body: `${e.definition.en} ${e.definition.fr} ${e.name.fr} ${e.action ?? ''}`,
      href: glossaryHref(e),
      keywords: [
        e.category,
        e.family ?? '',
        e.severity ?? '',
        e.http ? String(e.http) : '',
        ...e.aliases.en,
        ...e.aliases.fr,
        e.name.en,
        e.name.fr,
        ...(e.seeAlso ?? []),
      ].join(' '),
      tags: '',
    });
  }

  return docs;
}

export const DOCUMENTS = buildDocuments();

export function createIndex(): MiniSearch<IndexedDoc> {
  const index = new MiniSearch<IndexedDoc>({
    fields: ['title', 'subtitle', 'body', 'keywords', 'tags'],
    storeFields: ['kind', 'title', 'subtitle', 'body', 'href'],
    searchOptions: {
      boost: { title: 4, tags: 6, subtitle: 2, keywords: 1.5 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
    // Codes like UK.OBIE.Field.Missing and pacs.008.001.08 must survive tokenising.
    // Keep camelCase tags (DbtrAgt) as single tokens.
    tokenize: (text) => text.split(/[\s,;()[\]{}"'/]+/).filter(Boolean),
    processTerm: (term) => term.toLowerCase(),
  });

  index.addAll(DOCUMENTS);
  return index;
}

export interface SearchHit {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  score: number;
}

/** Glossary matches first (same matcher as the glossary page), then the MiniSearch catalog. */
export function searchCatalog(index: MiniSearch<IndexedDoc>, query: string): SearchHit[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const glossaryHits = searchGlossary(q).map((e, i) => glossaryHit(e, 10_000 - i));
  const seen = new Set(glossaryHits.map((h) => h.id));
  const catalogHits: SearchHit[] = [];
  for (const r of index.search(q)) {
    const id = String(r.id);
    if (seen.has(id)) continue;
    const doc = r as unknown as IndexedDoc;
    catalogHits.push({
      id,
      kind: doc.kind,
      title: doc.title,
      subtitle: doc.subtitle,
      body: doc.body,
      href: doc.href,
      score: r.score,
    });
  }
  return [...glossaryHits, ...catalogHits].slice(0, 40);
}

function glossaryHit(e: GlossaryEntry, score: number): SearchHit {
  const isCode = e.category === 'code';
  return {
    id: isCode ? `code:${e.term}` : `term:${e.id}`,
    kind: isCode ? 'code' : 'term',
    title: e.term,
    subtitle: e.name.en,
    body: e.definition.en,
    href: glossaryHref(e),
    score,
  };
}

export const KIND_LABELS: Record<ResultKind, string> = {
  standard: 'Standard',
  message: 'Message',
  flow: 'Flow',
  code: 'Code',
  sample: 'Sample',
  endpoint: 'Endpoint',
  term: 'Term',
};
