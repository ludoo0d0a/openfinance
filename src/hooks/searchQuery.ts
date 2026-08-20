import { createContext, useContext } from 'react';

export interface SearchQueryValue {
  query: string;
  setQuery: (next: string) => void;
  clearQuery: () => void;
}

export const SearchQueryContext = createContext<SearchQueryValue | null>(null);

export function useSearchQuery(): SearchQueryValue {
  const ctx = useContext(SearchQueryContext);
  if (!ctx) throw new Error('useSearchQuery requires SearchQueryProvider');
  return ctx;
}
