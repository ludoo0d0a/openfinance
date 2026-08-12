import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { cn } from '@/lib/cn';
import { UI_ICONS } from '@/lib/icons';
import { LocaleSwitcher, localizeFlows, useI18n, useT } from '@/i18n';

export function AppShell() {
  const t = useT();
  const { locale } = useI18n();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const messagesByArea = groupBy(ISO_MESSAGES, (m) => m.area);
  const localizedFlows = localizeFlows(FLOWS, locale);
  const flowsByCategory = groupBy(localizedFlows, (f) => f.category);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2.5 lg:gap-4 lg:px-6">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            className="inline-flex items-center gap-1 border border-rule px-2 py-1 font-mono text-[11px] lg:hidden"
          >
            {navOpen ? <X size={14} aria-hidden /> : <Menu size={14} aria-hidden />}
            {navOpen ? t('nav.close') : t('nav.menu')}
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
        <nav
          aria-label="Primary"
          className={cn(
            'border-b border-rule bg-paper-raised px-4 py-5 lg:sticky lg:top-[53px] lg:h-[calc(100dvh-53px)] lg:overflow-y-auto lg:border-r lg:border-b-0',
            'scroll-paper',
            navOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <NavSection title={t('nav.start')}>
            <NavItem to="/" label={t('nav.overview')} icon={<UI_ICONS.overview size={14} />} exact />
            <NavItem to="/try" label={t('nav.try')} icon={<UI_ICONS.try size={14} />} />
            <NavItem to="/map" label={t('nav.map')} icon={<UI_ICONS.map size={14} />} />
            <NavItem to="/codes" label={t('nav.codes')} icon={<UI_ICONS.codes size={14} />} />
          </NavSection>

          <NavSection title={t('nav.standards')}>
            {STANDARDS.map((s) => (
              <NavItem
                key={s.id}
                to={`/standards/${s.id}`}
                label={s.name}
                hint={s.region}
                icon={<UI_ICONS.standard size={14} />}
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
                  <NavItem key={f.id} to={`/flows/${f.id}`} label={f.name} icon={<UI_ICONS.flow size={14} />} />
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
                  />
                ))}
              </div>
            ))}
          </NavSection>
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

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
}: {
  to: string;
  label: string;
  hint?: string;
  exact?: boolean;
  mono?: boolean;
  icon?: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
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
