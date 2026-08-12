import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CODES } from '@/data/codes';
import { cn } from '@/lib/cn';
import type { CodeEntry, CodeFamily } from '@/types';
import { useT } from '@/i18n';

const severityDot: Record<CodeEntry['severity'], string> = {
  success: 'bg-jade',
  pending: 'bg-ochre',
  error: 'bg-vermillion',
  info: 'bg-muted',
};

const FAMILIES = [
  'iso-tx-status',
  'iso-status-reason',
  'bg-error',
  'stet-error',
  'ukob-error',
  'sca-status',
  'consent-status',
  'scheme-status',
] as const satisfies readonly CodeFamily[];

export function CodesView() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const family = params.get('family') as CodeFamily | null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODES.filter((c) => {
      if (family && c.family !== family) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.action ?? '').toLowerCase().includes(q)
      );
    });
  }, [query, family]);

  function update(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') merged.delete(k);
      else merged.set(k, v);
    }
    setParams(merged, { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow">{t('codes.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('codes.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('codes.lead')}</p>
      </header>

      <div className="mt-7 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder={t('codes.placeholder')}
          aria-label={t('codes.filterAria')}
          className="w-full border border-rule bg-surface px-3 py-2.5 font-mono text-sm focus:border-ink focus:outline-none"
        />

        <div className="flex flex-wrap gap-1.5">
          <FilterButton active={!family} onClick={() => update({ family: null })}>
            {t('codes.all', { count: CODES.length })}
          </FilterButton>
          {FAMILIES.map((f) => (
            <FilterButton key={f} active={family === f} onClick={() => update({ family: f })}>
              {t(`family.${f}`)}
            </FilterButton>
          ))}
        </div>
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted">
        {t('codes.count', { filtered: filtered.length, total: CODES.length })}
      </p>

      <ul className="mt-3 panel divide-y divide-rule-soft">
        {filtered.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">{t('codes.empty')}</li>
        )}
        {filtered.map((c) => (
          <li key={`${c.family}-${c.code}`} className="px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={cn('mt-1.5 h-2 w-2 shrink-0', severityDot[c.severity])} aria-hidden />
              <code className="text-[15px] font-medium">{c.code}</code>
              <span className="text-sm font-semibold">{c.name}</span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted">
                {t(`family.${c.family}`)}
                {c.http && ` · HTTP ${c.http}`}
              </span>
            </div>
            <p className="mt-2 pl-5 text-[13px] leading-relaxed">{c.description}</p>
            {c.action && (
              <p className="mt-2 ml-5 border-l-2 border-signal pl-3 text-[13px] leading-relaxed text-muted">{c.action}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border px-2.5 py-1 font-mono text-[11px] transition-colors',
        active ? 'border-ink bg-ink text-white' : 'border-rule bg-surface text-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
