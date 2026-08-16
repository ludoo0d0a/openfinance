import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { applySearchQueryToHref, type SearchHit } from '@/lib/search';
import { SearchHitList } from './SearchHitList';
import { SearchInput } from './SearchInput';
import { useT } from '@/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const t = useT();
  const { query, setQuery, results } = useSearchIndex();
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  function go(hit: SearchHit) {
    onClose();
    navigate(applySearchQueryToHref(hit.href, hit.kind, query));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      go(results[cursor]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('search.title')}
        className="w-full max-w-2xl border border-ink bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <span className="eyebrow shrink-0">{t('search.title')}</span>
          <SearchInput
            inputRef={inputRef}
            value={query}
            onChange={setQuery}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            ariaLabel={t('search.title')}
            trailing={
              <kbd className="shrink-0 border border-rule px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
            }
          />
        </div>

        <div className="scroll-paper max-h-[52vh] overflow-y-auto">
          <SearchHitList
            results={results}
            query={query}
            cursor={cursor}
            onHover={setCursor}
            onPick={go}
          />
        </div>

        <div className="flex gap-4 border-t border-rule px-4 py-2 font-mono text-[10px] text-muted">
          <span>{t('search.move')}</span>
          <span>{t('search.open')}</span>
          <span className="ml-auto">{t('search.results', { count: results.length })}</span>
        </div>
      </div>
    </div>
  );
}
