import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import {
  CODE_FAMILIES,
  THESAURUS,
  THESAURUS_CATEGORY_LABELS,
  THESAURUS_CODES,
  localizeThesaurusEntry,
  type ThesaurusCategory,
  type ThesaurusEntry,
} from '@/data/thesaurus';
import { cn } from '@/lib/cn';
import { useI18n, useT } from '@/i18n';
import type { CodeFamily } from '@/types';

const CATEGORIES = Object.keys(THESAURUS_CATEGORY_LABELS) as ThesaurusCategory[];

const severityDot: Record<NonNullable<ThesaurusEntry['severity']>, string> = {
  success: 'bg-jade',
  pending: 'bg-ochre',
  error: 'bg-vermillion',
  info: 'bg-muted',
};

export function ThesaurusView() {
  const t = useT();
  const { locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = (params.get('category') as ThesaurusCategory | null) || null;
  const family = (params.get('family') as CodeFamily | null) || null;
  const activeId = params.get('id') ?? 'vop';

  const localized = useMemo(
    () => THESAURUS.map((e) => localizeThesaurusEntry(e, locale)),
    [locale],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localized.filter((e) => {
      if (family && e.family !== family) return false;
      if (category && e.category !== category) return false;
      if (!q) return true;
      const hay = [
        e.term,
        e.displayName,
        e.displayDefinition,
        e.action ?? '',
        e.family ?? '',
        ...e.displayAliases,
        ...(e.aliases.en ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [localized, query, category, family]);

  const active =
    filtered.find((e) => e.id === activeId) ??
    filtered[0] ??
    localized.find((e) => e.id === 'vop') ??
    localized[0];

  function update(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') merged.delete(k);
      else merged.set(k, v);
    }
    setParams(merged, { replace: true });
  }

  function select(entry: ThesaurusEntry) {
    update({ id: entry.id });
  }

  const showFamilies = category === 'code' || Boolean(family);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <BookOpen size={12} aria-hidden />
          {t('thesaurus.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('thesaurus.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('thesaurus.lead')}</p>
      </header>

      <div className="mt-7 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder={t('thesaurus.placeholder')}
          aria-label={t('thesaurus.filterAria')}
          className="w-full border border-rule bg-surface px-3 py-2.5 font-mono text-sm focus:border-ink focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={!category && !family} onClick={() => update({ category: null, family: null })}>
            {t('thesaurus.all', { count: THESAURUS.length })}
          </FilterBtn>
          {CATEGORIES.map((c) => (
            <FilterBtn
              key={c}
              active={category === c && !family}
              onClick={() => update({ category: c, family: null })}
            >
              {c === 'code'
                ? `${THESAURUS_CATEGORY_LABELS[c][locale]} (${THESAURUS_CODES.length})`
                : THESAURUS_CATEGORY_LABELS[c][locale]}
            </FilterBtn>
          ))}
        </div>
        {showFamilies && (
          <div className="flex flex-wrap gap-1.5">
            {CODE_FAMILIES.map((f) => (
              <FilterBtn
                key={f}
                active={family === f}
                onClick={() => update({ category: 'code', family: family === f ? null : f })}
              >
                {t(`family.${f}`)}
              </FilterBtn>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul className="panel divide-y divide-rule-soft lg:max-h-[70vh] lg:overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">{t('thesaurus.empty')}</li>
          )}
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => select(e)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-paper-raised',
                  active?.id === e.id && 'bg-signal-soft',
                )}
              >
                <span className="flex items-center gap-2">
                  {e.severity && (
                    <span className={cn('h-2 w-2 shrink-0', severityDot[e.severity])} aria-hidden />
                  )}
                  <span className="font-mono text-sm font-semibold text-signal">{e.term}</span>
                </span>
                <span className="text-[13px] text-ink">{e.displayName}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {e.family ? t(`family.${e.family}`) : e.categoryLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {active && (
          <article className="panel p-5 sm:p-6">
            <p className="eyebrow">
              {active.family ? t(`family.${active.family}`) : active.categoryLabel}
              {active.http ? ` · HTTP ${active.http}` : ''}
            </p>
            <h2 className="mt-2 font-mono text-2xl font-bold text-signal">{active.term}</h2>
            <p className="mt-1 text-lg font-semibold">{active.displayName}</p>
            <p className="mt-4 text-[15px] leading-relaxed">{active.displayDefinition}</p>

            {active.action && (
              <p className="mt-4 border-l-2 border-signal pl-3 text-[13px] leading-relaxed text-muted">
                <span className="eyebrow mb-1 block">{t('thesaurus.action')}</span>
                {active.action}
              </p>
            )}

            {active.displayAliases.length > 0 && (
              <div className="mt-5">
                <h3 className="eyebrow mb-2">{t('thesaurus.alsoCalled')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {active.displayAliases.map((a) => (
                    <span key={a} className="border border-rule bg-surface px-2 py-1 font-mono text-[11px]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {active.seeAlso && active.seeAlso.length > 0 && (
              <div className="mt-5">
                <h3 className="eyebrow mb-2">{t('thesaurus.seeAlso')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {active.seeAlso.map((id) => {
                    const related = localized.find((e) => e.id === id);
                    if (!related) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => select(related)}
                        className="border border-rule px-2 py-1 font-mono text-[11px] text-signal hover:border-ink"
                      >
                        {related.term}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {active.links && active.links.length > 0 && (
              <div className="mt-5">
                <h3 className="eyebrow mb-2">{t('thesaurus.explore')}</h3>
                <ul className="space-y-1">
                  {active.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="font-mono text-[12px] text-signal hover:underline">
                        {link.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

function FilterBtn({
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
