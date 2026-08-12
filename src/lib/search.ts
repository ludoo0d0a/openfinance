import MiniSearch from 'minisearch';
import { STANDARDS } from '@/data/standards';
import { ISO_MESSAGES } from '@/data/iso20022';
import { FLOWS } from '@/data/flows';
import { CODES } from '@/data/codes';
import { SAMPLES } from '@/data/samples';

export type ResultKind = 'standard' | 'message' | 'flow' | 'code' | 'sample' | 'endpoint';

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
        });
      }
    }
  }

  for (const m of ISO_MESSAGES) {
    docs.push({
      id: `message:${m.short}`,
      kind: 'message',
      title: m.short,
      subtitle: m.name,
      body: m.purpose,
      href: `/messages/${m.short}`,
      keywords: [m.id, m.rootElement, m.area, m.direction, ...m.tags].join(' '),
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
      keywords: [f.category, ...f.tags, ...f.steps.map((s) => `${s.label} ${s.path ?? ''}`)].join(' '),
    });
  }

  for (const c of CODES) {
    docs.push({
      id: `code:${c.family}:${c.code}`,
      kind: 'code',
      title: c.code,
      subtitle: c.name,
      body: `${c.description} ${c.action ?? ''}`,
      href: `/codes?q=${encodeURIComponent(c.code)}`,
      keywords: [c.family, c.severity, c.http ? String(c.http) : ''].join(' '),
    });
  }

  for (const s of SAMPLES) {
    docs.push({
      id: `sample:${s.id}`,
      kind: 'sample',
      title: s.label,
      subtitle: s.format.toUpperCase(),
      body: s.description,
      href: `/samples/${s.id}`,
      keywords: [s.messageShort ?? '', s.standardId ?? '', s.format].join(' '),
    });
  }

  return docs;
}

export const DOCUMENTS = buildDocuments();

export function createIndex(): MiniSearch<IndexedDoc> {
  const index = new MiniSearch<IndexedDoc>({
    fields: ['title', 'subtitle', 'body', 'keywords'],
    storeFields: ['kind', 'title', 'subtitle', 'body', 'href'],
    searchOptions: {
      boost: { title: 4, subtitle: 2, keywords: 1.5 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
    // Codes like UK.OBIE.Field.Missing and pacs.008.001.08 must survive tokenising.
    tokenize: (text) => text.split(/[\s,;()[\]{}"'/]+/).filter(Boolean),
    processTerm: (term) => term.toLowerCase(),
  });

  index.addAll(DOCUMENTS);
  return index;
}

export const KIND_LABELS: Record<ResultKind, string> = {
  standard: 'Standard',
  message: 'Message',
  flow: 'Flow',
  code: 'Code',
  sample: 'Sample',
  endpoint: 'Endpoint',
};
