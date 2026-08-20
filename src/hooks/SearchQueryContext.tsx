import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SearchQueryContext } from './searchQuery';

export function SearchQueryProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const setQuery = useCallback((next: string) => setQueryState(next), []);
  const clearQuery = useCallback(() => setQueryState(''), []);
  const value = useMemo(() => ({ query, setQuery, clearQuery }), [query, setQuery, clearQuery]);
  return <SearchQueryContext.Provider value={value}>{children}</SearchQueryContext.Provider>;
}
