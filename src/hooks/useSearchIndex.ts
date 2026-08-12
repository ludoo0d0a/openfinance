import { useMemo, useState } from 'react';
import { createIndex, type IndexedDoc, type ResultKind } from '@/lib/search';

export interface SearchHit {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  score: number;
}

/**
 * The index is built once per session. It is small enough (a few hundred docs)
 * that there is no reason to move it into a worker.
 */
export function useSearchIndex() {
  const index = useMemo(() => createIndex(), []);
  const [query, setQuery] = useState('');

  const results = useMemo<SearchHit[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return index.search(q).slice(0, 40).map((r) => ({
      id: r.id as string,
      kind: (r as unknown as IndexedDoc).kind,
      title: (r as unknown as IndexedDoc).title,
      subtitle: (r as unknown as IndexedDoc).subtitle,
      body: (r as unknown as IndexedDoc).body,
      href: (r as unknown as IndexedDoc).href,
      score: r.score,
    }));
  }, [index, query]);

  return { query, setQuery, results };
}
