import MiniSearch from 'minisearch';
import { STANDARDS } from '@/data/standards';
import { ISO_MESSAGES } from '@/data/iso20022';
import { FLOWS } from '@/data/flows';
import { ALL_SAMPLES } from '@/data/samples';
import { GLOSSARY, glossaryHref, searchGlossary, type GlossaryEntry } from '@/data/glossary';
import { PAYMENTS } from '@/data/payments';
import { SCHEMES } from '@/data/schemes';
import { INFRASTRUCTURES } from '@/data/infrastructures';
import { LIFE_SCENARIOS, LIFE_SCENES, liveScenarioHref } from '@/data/lifeScenes';
import { compactMessageId, parseMessageId } from '@/lib/messageId';
import { extractPayloadTags, looksLikeIsoTag } from '@/lib/payloadTags';

export type ResultKind =
  | 'standard'
  | 'message'
  | 'flow'
  | 'code'
  | 'sample'
  | 'endpoint'
  | 'term'
  | 'payment'
  | 'scheme'
  | 'infrastructure'
  | 'live';

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

  for (const p of PAYMENTS) {
    docs.push({
      id: `payment:${p.id}`,
      kind: 'payment',
      title: p.name.en,
      subtitle: p.name.fr,
      body: `${p.summary.en} ${p.summary.fr}`,
      href: `/payment/${p.id}`,
      keywords: [
        p.kind,
        p.schemeId,
        p.name.en,
        p.name.fr,
        p.shortName,
        ...p.infrastructureIds,
        ...p.messageShorts,
      ]
        .filter(Boolean)
        .join(' '),
      tags: p.messageShorts.join(' '),
    });
  }

  for (const s of SCHEMES) {
    docs.push({
      id: `scheme:${s.id}`,
      kind: 'scheme',
      title: s.name.en,
      subtitle: s.operator,
      body: `${s.summary.en} ${s.summary.fr}`,
      href: `/scheme/${s.id}`,
      keywords: [s.id, s.operator, s.explorePaymentId].join(' '),
      tags: '',
    });
  }

  for (const i of INFRASTRUCTURES) {
    docs.push({
      id: `infrastructure:${i.id}`,
      kind: 'infrastructure',
      title: i.name.en,
      subtitle: `${i.operator} · ${i.region}`,
      body: `${i.summary.en} ${i.summary.fr} ${i.usedFor.en}`,
      href: `/infrastructure/${i.id}`,
      keywords: [i.id, i.operator, i.currency, ...i.relatedMessageShorts].join(' '),
      tags: i.relatedMessageShorts.join(' '),
    });
  }

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
        ...(m.versions ?? []).flatMap((v) => {
          const compact = compactMessageId(parseMessageId(v.id));
          return compact ? [v.id, compact, ...v.markets] : [v.id, ...v.markets];
        }),
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

  for (const scene of LIFE_SCENES) {
    docs.push({
      id: `live-scene:${scene.id}`,
      kind: 'live',
      title: scene.title.en,
      subtitle: scene.brand.en,
      body: `${scene.blurb.en} ${scene.title.fr} ${scene.blurb.fr}`,
      href: `/live/${scene.id}`,
      keywords: [scene.id, scene.brand.en, scene.brand.fr, 'live', 'showcase', 'demo'].join(' '),
      tags: '',
    });
  }

  for (const scenario of LIFE_SCENARIOS) {
    const flowIds = [
      ...new Set(scenario.beats.flatMap((b) => (b.flowId ? [b.flowId] : []))),
    ];
    docs.push({
      id: `live:${scenario.id}`,
      kind: 'live',
      title: scenario.title.en,
      subtitle: scenario.title.fr,
      body: `${scenario.blurb.en} ${scenario.blurb.fr}`,
      href: liveScenarioHref(scenario),
      keywords: [
        scenario.id,
        scenario.sceneId,
        scenario.paymentId ?? '',
        scenario.outcome,
        'live',
        'showcase',
        ...flowIds,
      ].join(' '),
      tags: '',
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

/** Keep the typed query on glossary links; also pin ISO tags onto message/sample pages. */
export function applySearchQueryToHref(href: string, kind: ResultKind, query: string): string {
  const q = query.trim();
  if (!q) return href;
  const url = new URL(href, 'https://local');
  if (looksLikeIsoTag(q) && (kind === 'sample' || kind === 'message')) {
    url.searchParams.set('q', q);
  }
  if (url.pathname === '/glossary') {
    url.searchParams.set('q', q);
  }
  const qs = url.searchParams.toString();
  return qs ? `${url.pathname}?${qs}` : url.pathname;
}

/** Glossary terms first, then codes, then the MiniSearch catalog. */
export function searchCatalog(index: MiniSearch<IndexedDoc>, query: string): SearchHit[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const glossaryHits = searchGlossary(q).map((e, i) => glossaryHit(e, 10_000 - i));
  const terms = glossaryHits.filter((h) => h.kind === 'term');
  const codes = glossaryHits.filter((h) => h.kind === 'code');
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
  catalogHits.sort((a, b) => {
    const da = CATALOG_KIND_ORDER.indexOf(a.kind);
    const db = CATALOG_KIND_ORDER.indexOf(b.kind);
    const ia = da === -1 ? 99 : da;
    const ib = db === -1 ? 99 : db;
    if (ia !== ib) return ia - ib;
    return b.score - a.score;
  });
  return [...terms, ...codes, ...catalogHits].slice(0, 40);
}

const CATALOG_KIND_ORDER: ResultKind[] = [
  'payment',
  'message',
  'scheme',
  'infrastructure',
  'flow',
  'live',
  'standard',
  'sample',
  'endpoint',
];

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
  payment: 'Payment',
  scheme: 'Scheme',
  infrastructure: 'Infrastructure',
  live: 'Live',
};
