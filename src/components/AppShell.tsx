import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { useSearchQuery } from '@/hooks/SearchQueryContext';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { PAYMENTS } from '@/data/payments';
import { SCHEMES } from '@/data/schemes';
import { INFRASTRUCTURES } from '@/data/infrastructures';
import { cn } from '@/lib/cn';
import { UI_ICONS } from '@/lib/iconMeta';
import { LocaleSwitcher, localizeFlows, useI18n, useT } from '@/i18n';

const THEME_KEY = 'openfinance.theme';

function readTheme(): 'light' | 'dark' {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : '';
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function AppShell() {
  const t = useT();
  const { locale } = useI18n();
  const { query, clearQuery } = useSearchQuery();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' ? readTheme() : 'light',
  );
  const navTitleId = useId();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isSearchToggleHotkey(e)) {
        e.preventDefault();
        e.stopPropagation();
        setPaletteOpen((v) => !v);
      }
      if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape' && navOpen) {
        setNavOpen(false);
      }
    }
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  const messagesByArea = groupBy(ISO_MESSAGES, (m) => m.area);
  const localizedFlows = localizeFlows(FLOWS, locale);
  const flowsByCategory = groupBy(localizedFlows, (f) => f.category);

  const primaryPayments = PAYMENTS.filter((p) =>
    ['sepa-credit-transfer', 'sepa-instant', 'wero'].includes(p.id),
  );
  const morePayments = PAYMENTS.filter((p) => !primaryPayments.includes(p));

  const navBody = (
    <>
      <NavSection title={t('nav.start')}>
        <NavItem to="/" label={t('nav.overview')} icon={<UI_ICONS.overview size={14} />} exact onNavigate={() => setNavOpen(false)} />
        {primaryPayments.map((p) => (
          <NavItem
            key={p.id}
            to={`/payment/${p.id}`}
            label={p.name[locale]}
            icon={<UI_ICONS.instant size={14} />}
            onNavigate={() => setNavOpen(false)}
          />
        ))}
        {morePayments.map((p) => (
          <NavItem
            key={p.id}
            to={`/payment/${p.id}`}
            label={p.name[locale]}
            icon={<UI_ICONS.flow size={14} />}
            onNavigate={() => setNavOpen(false)}
          />
        ))}
      </NavSection>

      <NavSection title={t('nav.schemes')}>
        {SCHEMES.map((s) => (
          <NavItem
            key={s.id}
            to={`/scheme/${s.id}`}
            label={s.name[locale]}
            icon={<UI_ICONS.standard size={14} />}
            onNavigate={() => setNavOpen(false)}
          />
        ))}
      </NavSection>

      <NavSection title={t('nav.infrastructure')}>
        {INFRASTRUCTURES.filter((i) => ['step2', 'tips', 'rt1', 'sic', 'eurosic', 'wero-platform'].includes(i.id)).map(
          (i) => (
            <NavItem
              key={i.id}
              to={`/infrastructure/${i.id}`}
              label={i.name[locale]}
              hint={i.operator}
              icon={<UI_ICONS.map size={14} />}
              onNavigate={() => setNavOpen(false)}
            />
          ),
        )}
      </NavSection>

      <NavSection title={t('nav.tools')}>
        <NavItem to="/try" label={t('nav.try')} icon={<UI_ICONS.try size={14} />} onNavigate={() => setNavOpen(false)} />
        <NavItem to="/quiz/debug-reject" label={t('nav.quiz')} icon={<UI_ICONS.try size={14} />} onNavigate={() => setNavOpen(false)} />
        <NavItem
          to="/compare/pacs.008"
          label={t('nav.compareVersions')}
          icon={<UI_ICONS.xml size={14} />}
          onNavigate={() => setNavOpen(false)}
        />
        <NavItem
          to="/glossary"
          label={t('nav.glossary')}
          icon={<UI_ICONS.glossary size={14} />}
          onNavigate={() => setNavOpen(false)}
        />
        <NavItem to="/map" label={t('nav.map')} icon={<UI_ICONS.map size={14} />} onNavigate={() => setNavOpen(false)} />
        <NavItem
          to="/about"
          label={t('nav.about')}
          icon={<UI_ICONS.about size={14} />}
          onNavigate={() => setNavOpen(false)}
        />
      </NavSection>

      <section className="mb-6">
        <button
          type="button"
          onClick={() => setCatalogOpen((v) => !v)}
          className="mb-2 flex w-full items-center justify-between gap-2 pl-2 text-left"
          aria-expanded={catalogOpen}
        >
          <span className="text-[13px] font-bold tracking-tight text-ink">{t('nav.catalog')}</span>
          <ChevronDown
            size={14}
            className={cn('shrink-0 text-muted transition-transform', catalogOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
        {catalogOpen && (
          <div className="space-y-4">
            <NavGroup label={t('nav.standards')}>
              {STANDARDS.map((s) => (
                <NavItem
                  key={s.id}
                  to={`/standards/${s.id}`}
                  label={s.name}
                  hint={s.region}
                  icon={<UI_ICONS.standard size={14} />}
                  onNavigate={() => setNavOpen(false)}
                />
              ))}
            </NavGroup>
            <NavGroup label={t('nav.flows')}>
              {Object.entries(flowsByCategory).map(([category, flows]) => (
                <div key={category} className="mb-2">
                  <p className="mb-1 pl-2 text-[11px] font-semibold text-muted">{t(`category.${category}`)}</p>
                  {flows.map((f) => (
                    <NavItem
                      key={f.id}
                      to={`/flows/${f.id}`}
                      label={f.name}
                      icon={<UI_ICONS.flow size={14} />}
                      onNavigate={() => setNavOpen(false)}
                    />
                  ))}
                </div>
              ))}
            </NavGroup>
            <NavGroup label={t('nav.messages')}>
              {Object.entries(messagesByArea).map(([area, messages]) => (
                <div key={area} className="mb-2">
                  <p className="mb-1 pl-2 text-[11px] font-semibold text-muted">{area}</p>
                  {messages.map((m) => (
                    <NavItem
                      key={m.short}
                      to={`/messages/${m.short}`}
                      label={m.short}
                      hint={m.name}
                      mono
                      icon={<UI_ICONS.xml size={14} />}
                      onNavigate={() => setNavOpen(false)}
                    />
                  ))}
                </div>
              ))}
            </NavGroup>
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            aria-label={t('nav.menu')}
            className="inline-flex shrink-0 items-center gap-1 border border-rule px-2 py-2 font-mono text-[11px] lg:hidden"
          >
            <Menu size={16} aria-hidden />
            <span className="hidden min-[400px]:inline">{t('nav.menu')}</span>
          </button>

          <NavLink to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 sm:h-7 sm:w-7"
            />
            <span className="hidden font-display text-[17px] font-bold tracking-tight sm:inline">OpenFinance</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted lg:inline">
              {t('brand.tagline')}
            </span>
          </NavLink>

          <div className="ml-auto flex min-h-10 min-w-[9.5rem] flex-1 items-center gap-2 border border-rule bg-surface px-3 py-1 hover:border-ink sm:min-h-0 sm:min-w-[240px] sm:max-w-xl lg:max-w-2xl">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-muted"
            >
              <Search size={16} className="shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-sm">
                {query.trim() || t('nav.search')}
              </span>
            </button>
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label={t('search.clear')}
                className="shrink-0 p-0.5 text-muted hover:text-ink"
              >
                <X size={16} aria-hidden />
              </button>
            )}
            <kbd className="hidden shrink-0 border border-rule px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              ⌘K
            </kbd>
          </div>

          <button
            type="button"
            onClick={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
            className="inline-flex shrink-0 items-center justify-center border border-rule p-2 text-muted hover:border-ink hover:text-ink"
            aria-label={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          >
            {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
          </button>

          <LocaleSwitcher className="shrink-0" />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <nav
          aria-label="Primary"
          className="scroll-paper hidden border-r border-rule bg-paper-raised px-4 py-5 lg:sticky lg:top-[53px] lg:block lg:h-[calc(100dvh-53px)] lg:overflow-y-auto"
        >
          {navBody}
        </nav>

        <main className="min-w-0">
          <Outlet />
          <SiteFooter />
        </main>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-label={t('nav.close')}
            onClick={() => setNavOpen(false)}
          />
          <aside
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby={navTitleId}
            className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col border-r border-ink bg-paper shadow-[8px_0_32px_rgba(13,20,32,0.18)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
              <p id={navTitleId} className="font-display text-[15px] font-bold tracking-tight">
                {t('nav.menu')}
              </p>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="inline-flex items-center gap-1 border border-rule px-2 py-1 font-mono text-[11px]"
              >
                <X size={14} aria-hidden />
                {t('nav.close')}
              </button>
            </div>
            <nav aria-label="Primary" className="scroll-paper flex-1 overflow-y-auto px-4 py-5">
              {navBody}
            </nav>
          </aside>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-8 border-t border-rule px-4 py-4 lg:px-6">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
        <span>{t('footer.version', { version: __APP_VERSION__ })}</span>
        <span aria-hidden>·</span>
        <span>{t('footer.copyright', { year: 2026 })}</span>
        <span aria-hidden>·</span>
        <span>{t('footer.license')}</span>
        <span aria-hidden>·</span>
        <NavLink to="/about" className="hover:text-ink hover:underline">
          {t('nav.about')}
        </NavLink>
        <span aria-hidden>·</span>
        <NavLink to="/privacy" className="hover:text-ink hover:underline">
          {t('nav.privacy')}
        </NavLink>
        <span aria-hidden>·</span>
        <NavLink to="/contact" className="hover:text-ink hover:underline">
          {t('nav.contact')}
        </NavLink>
      </p>
    </footer>
  );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 pl-2 text-[13px] font-bold tracking-tight text-ink">{title}</h2>
      <div className="space-y-px">{children}</div>
    </section>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 pl-2 text-[12px] font-bold text-ink">{label}</p>
      <div className="space-y-px">{children}</div>
    </div>
  );
}

function NavItem({
  to,
  label,
  hint,
  exact,
  mono,
  icon,
  onNavigate,
}: {
  to: string;
  label: string;
  hint?: string;
  exact?: boolean;
  mono?: boolean;
  icon?: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-start gap-2 border-l-2 py-1 pl-2 pr-1 text-[13px] leading-snug transition-colors',
          isActive
            ? 'border-signal bg-signal-soft font-medium text-ink'
            : 'border-transparent text-muted hover:border-rule hover:text-ink',
        )
      }
    >
      {icon && <span className="mt-0.5 shrink-0 opacity-80">{icon}</span>}
      <span className="min-w-0">
        <span className={mono ? 'font-mono text-xs' : ''}>{label}</span>
        {hint && <span className="block truncate text-[11px] text-muted">{hint}</span>}
      </span>
    </NavLink>
  );
}

function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ||= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function isSearchToggleHotkey(e: KeyboardEvent): boolean {
  const isK = e.code === 'KeyK' || e.key.toLowerCase() === 'k';
  if (!isK || e.altKey || e.shiftKey) return false;
  return isApplePlatform() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}
