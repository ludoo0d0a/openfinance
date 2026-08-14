import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { cn } from '@/lib/cn';
import { UI_ICONS } from '@/lib/iconMeta';
import { LocaleSwitcher, localizeFlows, useI18n, useT } from '@/i18n';

export function AppShell() {
  const t = useT();
  const { locale } = useI18n();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navTitleId = useId();

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

  const navBody = (
    <>
      <NavSection title={t('nav.start')}>
        <NavItem to="/" label={t('nav.overview')} icon={<UI_ICONS.overview size={14} />} exact onNavigate={() => setNavOpen(false)} />
        <NavItem to="/try" label={t('nav.try')} icon={<UI_ICONS.try size={14} />} onNavigate={() => setNavOpen(false)} />
        <NavItem to="/map" label={t('nav.map')} icon={<UI_ICONS.map size={14} />} onNavigate={() => setNavOpen(false)} />
        <NavItem
          to="/glossary"
          label={t('nav.glossary')}
          icon={<UI_ICONS.glossary size={14} />}
          onNavigate={() => setNavOpen(false)}
        />
        <NavItem
          to="/about"
          label={t('nav.about')}
          icon={<UI_ICONS.about size={14} />}
          onNavigate={() => setNavOpen(false)}
        />
      </NavSection>

      <NavSection title={t('nav.standards')}>
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
      </NavSection>

      <NavSection title={t('nav.flows')}>
        {Object.entries(flowsByCategory).map(([category, flows]) => (
          <div key={category} className="mb-2">
            <p className="mb-1 pl-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              {t(`category.${category}`)}
            </p>
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
      </NavSection>

      <NavSection title={t('nav.messages')}>
        {Object.entries(messagesByArea).map(([area, messages]) => (
          <div key={area} className="mb-2">
            <p className="mb-1 pl-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              {area} · {t(`area.${area}`)}
            </p>
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
      </NavSection>
    </>
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2.5 lg:gap-4 lg:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            className="inline-flex items-center gap-1 border border-rule px-2 py-1 font-mono text-[11px] lg:hidden"
          >
            <Menu size={14} aria-hidden />
            {t('nav.menu')}
          </button>

          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center border border-ink bg-ink text-white">
              <UI_ICONS.overview size={15} aria-hidden />
            </span>
            <span className="font-display text-[17px] font-bold tracking-tight">OpenFinance</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
              {t('brand.tagline')}
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex min-w-0 items-center gap-3 border border-rule bg-surface px-3 py-1.5 text-left text-xs text-muted hover:border-ink sm:min-w-[240px]"
          >
            <Search size={14} aria-hidden />
            <span className="truncate font-mono">{t('nav.search')}</span>
            <kbd className="ml-auto hidden shrink-0 border border-rule px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>

          <LocaleSwitcher className="shrink-0" />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        {/* Desktop sidebar */}
        <nav
          aria-label="Primary"
          className="scroll-paper hidden border-r border-rule bg-paper-raised px-4 py-5 lg:sticky lg:top-[53px] lg:block lg:h-[calc(100dvh-53px)] lg:overflow-y-auto"
        >
          {navBody}
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay menu */}
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

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="eyebrow mb-2 pl-2">{title}</h2>
      <div className="space-y-px">{children}</div>
    </section>
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

/** ⌘K on Apple, Ctrl+K elsewhere. Capture-phase so the browser does not steal ⌘K. */
function isSearchToggleHotkey(e: KeyboardEvent): boolean {
  const isK = e.code === 'KeyK' || e.key.toLowerCase() === 'k';
  if (!isK || e.altKey || e.shiftKey) return false;
  return isApplePlatform() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}
