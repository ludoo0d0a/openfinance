import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import {
  CODE_FAMILIES,
  GLOSSARY,
  GLOSSARY_CATEGORY_LABELS,
  GLOSSARY_SOURCES,
  localizeGlossaryEntry,
  type GlossaryCategory,
  type GlossaryEntry,
} from '@/data/glossary';
import { cn } from '@/lib/cn';
import { useI18n, useT } from '@/i18n';
import type { CodeFamily } from '@/types';
import { useSearchIndex } from '@/hooks/useSearchIndex';
import { applySearchQueryToHref, type SearchHit } from '@/lib/search';
import { SearchHitList } from '@/components/SearchHitList';
import { SearchInput } from '@/components/SearchInput';

const CATEGORIES = Object.keys(GLOSSARY_CATEGORY_LABELS) as GlossaryCategory[];

const severityDot: Record<NonNullable<GlossaryEntry['severity']>, string> = {
  success: 'bg-jade',
  pending: 'bg-ochre',
  error: 'bg-vermillion',
  info: 'bg-muted',
};

export function GlossaryView() {
  const t = useT();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { query, setQuery, results } = useSearchIndex();
  const category = (params.get('category') as GlossaryCategory | null) || null;
  const family = (params.get('family') as CodeFamily | null) || null;
  const activeId = params.get('id') ?? 'vop';
  const [cursor, setCursor] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const prevUrlQ = useRef<string | null>(null);
  const urlQ = params.get('q') ?? '';

  const localized = useMemo(
    () => GLOSSARY.map((e) => localizeGlossaryEntry(e, locale)),
    [locale],
  );

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<GlossaryCategory, number>;
    for (const e of localized) counts[e.category] += 1;
    return counts;
  }, [localized]);

  const familyCounts = useMemo(() => {
    const counts = Object.fromEntries(CODE_FAMILIES.map((f) => [f, 0])) as Record<CodeFamily, number>;
    for (const e of localized) {
      if (e.family) counts[e.family] += 1;
    }
    return counts;
  }, [localized]);

  useEffect(() => {
    if (prevUrlQ.current === null) {
      prevUrlQ.current = urlQ;
      if (urlQ) setQuery(urlQ);
      else if (query) {
        const merged = new URLSearchParams(params);
        merged.set('q', query);
        setParams(merged, { replace: true });
        prevUrlQ.current = query;
      }
      return;
    }
    if (urlQ !== prevUrlQ.current) {
      prevUrlQ.current = urlQ;
      if (urlQ !== query) setQuery(urlQ);
      return;
    }
    if (query !== urlQ) {
      prevUrlQ.current = query;
      const merged = new URLSearchParams(params);
      if (!query) merged.delete('q');
      else merged.set('q', query);
      setParams(merged, { replace: true });
    }
  }, [urlQ, query, params, setParams, setQuery]);

  useEffect(() => setCursor(0), [query]);

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
    localized.find((e) => e.id === activeId) ??
    filtered[0] ??
    localized[0];

  function update(next: Record<string, string | null>) {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') merged.delete(k);
      else merged.set(k, v);
    }
    setParams(merged, { replace: true });
  }

  function select(entry: GlossaryEntry) {
    update({ id: entry.id });
  }

  function pickSuggestion(hit: SearchHit) {
    setSuggestOpen(false);
    const href = applySearchQueryToHref(hit.href, hit.kind, query);
    const url = new URL(href, 'https://local');
    if (url.pathname === '/glossary') {
      update({
        id: url.searchParams.get('id'),
        q: url.searchParams.get('q'),
        category: url.searchParams.get('category') ?? category,
        family: url.searchParams.get('category') === 'code' ? family : null,
      });
      return;
    }
    navigate(href);
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!suggestOpen || query.trim().length < 2) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      pickSuggestion(results[cursor]);
    } else if (e.key === 'Escape') {
      setSuggestOpen(false);
    }
  }

  const showFamilies = category === 'code' || Boolean(family);
  const sourceMeta = (active?.sources ?? [])
    .map((id) => GLOSSARY_SOURCES.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <BookOpen size={12} aria-hidden />
          {t('glossary.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('glossary.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('glossary.lead')}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          {t('glossary.sourcesLead')}{' '}
          <Link to="/about" className="text-signal hover:underline">
            {t('nav.about')}
          </Link>
          .
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
          {GLOSSARY_SOURCES.map((s) => (
            <li key={s.id}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-signal hover:underline">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-7 space-y-3">
        <div
          className="relative"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSuggestOpen(false);
          }}
        >
          <div className="flex border border-rule bg-surface px-3 py-2.5 focus-within:border-ink">
            <SearchInput
              value={query}
              onChange={(next) => {
                setQuery(next);
                setSuggestOpen(next.trim().length >= 2);
              }}
              onFocus={() => {
                if (query.trim().length >= 2) setSuggestOpen(true);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={t('glossary.placeholder')}
              ariaLabel={t('glossary.filterAria')}
            />
          </div>
          {suggestOpen && query.trim().length >= 2 && (
            <div className="absolute z-20 mt-1 w-full border border-ink bg-surface">
              <div className="scroll-paper max-h-[40vh] overflow-y-auto">
                <SearchHitList
                  results={results}
                  query={query}
                  cursor={cursor}
                  onHover={setCursor}
                  onPick={pickSuggestion}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn active={!category && !family} onClick={() => update({ category: null, family: null })}>
            {t('glossary.all', { count: GLOSSARY.length })}
          </FilterBtn>
          {CATEGORIES.map((c) => (
            <FilterBtn
              key={c}
              active={category === c && !family}
              onClick={() => update({ category: c, family: null })}
            >
              {`${GLOSSARY_CATEGORY_LABELS[c][locale]} (${categoryCounts[c]})`}
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
                {`${t(`family.${f}`)} (${familyCounts[f]})`}
              </FilterBtn>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul
          className={cn(
            'panel divide-y divide-rule-soft lg:max-h-[70vh] lg:overflow-y-auto',
            query.trim() && 'max-lg:hidden',
          )}
        >
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">{t('glossary.empty')}</li>
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
                <span className="eyebrow mb-1 block">{t('glossary.action')}</span>
                {active.action}
              </p>
            )}

            {active.displayAliases.length > 0 && (
              <div className="mt-5">
                <h3 className="eyebrow mb-2">{t('glossary.alsoCalled')}</h3>
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
                <h3 className="eyebrow mb-2">{t('glossary.seeAlso')}</h3>
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
                <h3 className="eyebrow mb-2">{t('glossary.explore')}</h3>
                <ul className="space-y-1">
                  {active.links.map((link) => (
                    <li key={link.href}>
                      <CatalogOrExternalLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sourceMeta.length > 0 && (
              <div className="mt-5">
                <h3 className="eyebrow mb-2">{t('glossary.alignedWith')}</h3>
                <ul className="space-y-1">
                  {sourceMeta.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[12px] text-signal hover:underline"
                      >
                        {s.label} ↗
                      </a>
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

function CatalogOrExternalLink({ href, label }: { href: string; label: string }) {
  const external = /^https?:\/\//i.test(href);
  const className = 'font-mono text-[12px] text-signal hover:underline';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label} ↗
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {label} →
    </Link>
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
