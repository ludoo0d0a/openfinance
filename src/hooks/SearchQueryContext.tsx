import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SearchQueryValue {
  query: string;
  setQuery: (next: string) => void;
  clearQuery: () => void;
}

const SearchQueryContext = createContext<SearchQueryValue | null>(null);

export function SearchQueryProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const setQuery = useCallback((next: string) => setQueryState(next), []);
  const clearQuery = useCallback(() => setQueryState(''), []);
  const value = useMemo(() => ({ query, setQuery, clearQuery }), [query, setQuery, clearQuery]);
  return <SearchQueryContext.Provider value={value}>{children}</SearchQueryContext.Provider>;
}

export function useSearchQuery(): SearchQueryValue {
  const ctx = useContext(SearchQueryContext);
  if (!ctx) throw new Error('useSearchQuery requires SearchQueryProvider');
  return ctx;
}
