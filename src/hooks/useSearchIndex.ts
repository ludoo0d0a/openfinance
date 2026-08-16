import { useMemo } from 'react';
import { createIndex, searchCatalog, type SearchHit } from '@/lib/search';
import { useSearchQuery } from './SearchQueryContext';

export type { SearchHit };

/**
 * The index is built once per session. It is small enough (a few hundred docs)
 * that there is no reason to move it into a worker.
 */
export function useSearchIndex() {
  const index = useMemo(() => createIndex(), []);
  const { query, setQuery, clearQuery } = useSearchQuery();

  const results = useMemo(() => searchCatalog(index, query), [index, query]);

  return { query, setQuery, clearQuery, results };
}
