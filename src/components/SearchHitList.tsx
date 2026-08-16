import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import type { ResultKind, SearchHit } from '@/lib/search';

const kindColor: Record<ResultKind, string> = {
  standard: 'text-signal',
  message: 'text-violet',
  flow: 'text-jade',
  code: 'text-vermillion',
  sample: 'text-ochre',
  endpoint: 'text-muted',
  term: 'text-ochre',
  payment: 'text-jade',
  scheme: 'text-signal',
  infrastructure: 'text-violet',
};

export function SearchHitList({
  results,
  query,
  cursor,
  onHover,
  onPick,
}: {
  results: SearchHit[];
  query: string;
  cursor: number;
  onHover: (index: number) => void;
  onPick: (hit: SearchHit) => void;
}) {
  const t = useT();

  if (results.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted">
        {query.trim().length < 2 ? t('search.emptyShort') : t('search.emptyNone')}
      </p>
    );
  }

  return (
    <ul>
      {results.map((r, i) => {
        const prevKind = i > 0 ? results[i - 1].kind : null;
        const showGroup = r.kind !== prevKind && ['payment', 'message', 'scheme', 'infrastructure'].includes(r.kind);
        return (
          <li key={r.id}>
            {showGroup && (
              <p className="border-b border-rule-soft bg-paper-raised px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                {t(`kind.${r.kind}`)}
              </p>
            )}
            <button
            type="button"
            onMouseEnter={() => onHover(i)}
            onClick={() => onPick(r)}
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
        );
      })}
    </ul>
  );
}
