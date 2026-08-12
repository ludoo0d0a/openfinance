import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { STANDARDS } from '@/data/standards';
import { FLOWS, CATEGORY_LABELS } from '@/data/flows';
import { ISO_MESSAGES, AREA_LABELS } from '@/data/iso20022';
import { cn } from '@/lib/cn';

export function AppShell() {
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
  const flowsByCategory = groupBy(FLOWS, (f) => f.category);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="flex items-center gap-4 px-4 py-2.5 lg:px-6">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            className="border border-rule px-2 py-1 font-mono text-[11px] lg:hidden"
          >
            {navOpen ? 'Close' : 'Menu'}
          </button>

          <NavLink to="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-[17px] font-bold tracking-tight">OpenFinance</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
              PSD2 / SIC / Wero / ISO 20022
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex items-center gap-3 border border-rule bg-surface px-3 py-1.5 text-left text-xs text-muted hover:border-ink sm:min-w-[280px]"
          >
            <span className="font-mono">Search everything</span>
            <kbd className="ml-auto hidden border border-rule px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
          </button>
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
          <NavSection title="Start">
            <NavItem to="/" label="Overview" exact />
            <NavItem to="/map" label="Interop map" />
            <NavItem to="/codes" label="Code registry" />
          </NavSection>

          <NavSection title="Standards">
            {STANDARDS.map((s) => (
              <NavItem key={s.id} to={`/standards/${s.id}`} label={s.name} hint={s.region} />
            ))}
          </NavSection>

          <NavSection title="Flows">
            {Object.entries(flowsByCategory).map(([category, flows]) => (
              <div key={category} className="mb-2">
                <p className="mb-1 pl-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </p>
                {flows.map((f) => (
                  <NavItem key={f.id} to={`/flows/${f.id}`} label={f.name} />
                ))}
              </div>
            ))}
          </NavSection>

          <NavSection title="Messages">
            {Object.entries(messagesByArea).map(([area, messages]) => (
              <div key={area} className="mb-2">
                <p className="mb-1 pl-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {area} · {AREA_LABELS[area]}
                </p>
                {messages.map((m) => (
                  <NavItem key={m.short} to={`/messages/${m.short}`} label={m.short} hint={m.name} mono />
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
}: {
  to: string;
  label: string;
  hint?: string;
  exact?: boolean;
  mono?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn(
          'block border-l-2 py-1 pl-2 pr-1 text-[13px] leading-snug transition-colors',
          isActive ? 'border-signal bg-signal-soft font-medium text-ink' : 'border-transparent text-muted hover:border-rule hover:text-ink',
        )
      }
    >
      <span className={mono ? 'font-mono text-xs' : ''}>{label}</span>
      {hint && <span className="block truncate text-[11px] text-muted">{hint}</span>}
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
