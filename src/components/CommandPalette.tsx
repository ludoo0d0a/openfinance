import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { type ResultKind } from '@/lib/search';
import { looksLikeIsoTag } from '@/lib/payloadTags';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

const kindColor: Record<ResultKind, string> = {
  standard: 'text-signal',
  message: 'text-violet',
  flow: 'text-jade',
  code: 'text-vermillion',
  sample: 'text-ochre',
  endpoint: 'text-muted',
  term: 'text-ochre',
};

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

  function resolveHref(href: string, kind: ResultKind): string {
    const q = query.trim();
    if (!q || !looksLikeIsoTag(q)) return href;
    if (kind === 'sample' || kind === 'message') {
      const url = new URL(href, 'https://local');
      url.searchParams.set('q', q);
      return `${url.pathname}?${url.searchParams.toString()}`;
    }
    return href;
  }

  function go(href: string, kind: ResultKind) {
    onClose();
    setQuery('');
    navigate(resolveHref(href, kind));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      go(results[cursor].href, results[cursor].kind);
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
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent font-mono text-sm focus:outline-none"
          />
          <kbd className="shrink-0 border border-rule px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>

        <ul className="scroll-paper max-h-[52vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">
              {query.trim().length < 2 ? t('search.emptyShort') : t('search.emptyNone')}
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r.href, r.kind)}
                className={cn(
                  'flex w-full items-baseline gap-3 border-b border-rule-soft px-4 py-2.5 text-left',
                  i === cursor && 'bg-signal-soft',
                )}
              >
                <span className={cn('w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest', kindColor[r.kind])}>
                  {t(`kind.${r.kind}`)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[13px] font-medium">{r.title}</span>
                  <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-4 border-t border-rule px-4 py-2 font-mono text-[10px] text-muted">
          <span>{t('search.move')}</span>
          <span>{t('search.open')}</span>
          <span className="ml-auto">{t('search.results', { count: results.length })}</span>
        </div>
      </div>
    </div>
  );
}
