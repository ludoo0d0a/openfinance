import { Link } from 'react-router-dom';
import { PAYMENTS } from '@/data/payments';
import { SCHEMES } from '@/data/schemes';
import { ISO_MESSAGES } from '@/data/iso20022';
import { GLOSSARY_CODES } from '@/data/glossary';
import { UI_ICONS } from '@/lib/iconMeta';
import { useI18n, useT } from '@/i18n';
import { CommandPalette } from '@/components/CommandPalette';
import { useEffect, useState } from 'react';

const POPULAR = [
  { href: '/messages/pacs.008', label: 'pacs.008' },
  { href: '/messages/pacs.002', label: 'pacs.002' },
  { href: '/messages/pain.001', label: 'pain.001' },
  { href: '/payment/sepa-instant', label: 'SEPA Instant' },
  { href: '/payment/wero', label: 'Wero' },
  { href: '/glossary?id=ipr', label: 'IPR / PSD2' },
  { href: '/glossary?id=aml', label: 'AML' },
];

export function HomeView() {
  const t = useT();
  const { locale } = useI18n();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.title = 'OpenFinance — Payment Explorer';
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-bold sm:text-5xl">{t('home.title1')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('home.lead')}</p>
      </header>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="mt-8 flex w-full max-w-2xl items-center gap-3 border border-ink bg-surface px-4 py-3.5 text-left hover:bg-paper-raised"
      >
        <UI_ICONS.search size={18} className="shrink-0 text-muted" aria-hidden />
        <span className="flex-1 font-mono text-sm text-muted">{t('home.searchPrompt')}</span>
        <kbd className="hidden border border-rule px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <section className="mt-12">
        <h2 className="eyebrow mb-3">{t('home.explorePayment')}</h2>
        <Link
          to="/payment/sepa-instant"
          className="mb-4 block border border-jade bg-jade-soft px-4 py-3 hover:border-ink"
        >
          <p className="font-mono text-[11px] uppercase tracking-widest text-jade">{t('home.storyEyebrow')}</p>
          <p className="mt-1 text-[16px] font-semibold">{t('home.storyHeadline')}</p>
        </Link>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAYMENTS.map((p) => (
            <li key={p.id}>
              <Link
                to={`/payment/${p.id}`}
                className="block h-full border border-rule bg-surface px-4 py-4 hover:border-ink"
              >
                <h3 className="text-[16px] font-semibold">{p.name[locale]}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.summary[locale]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="eyebrow mb-3">{t('home.popular')}</h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="inline-block border border-rule bg-surface px-3 py-1.5 font-mono text-[13px] hover:border-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="eyebrow mb-3">{t('home.seeAlso')}</h2>
        <ul className="flex flex-wrap gap-3 text-[13px]">
          {SCHEMES.map((s) => (
            <li key={s.id}>
              <Link to={`/scheme/${s.id}`} className="text-signal hover:underline">
                {s.name[locale]}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/glossary" className="text-signal hover:underline">
              {t('nav.glossary')}
            </Link>
          </li>
          <li>
            <Link to="/map" className="text-signal hover:underline">
              {t('nav.map')}
            </Link>
          </li>
          <li>
            <Link to="/try" className="text-signal hover:underline">
              {t('nav.try')}
            </Link>
          </li>
        </ul>
      </section>

      <footer className="mt-16 border-t border-rule pt-5">
        <p className="font-mono text-[11px] text-muted">
          {t('home.footer', {
            payments: PAYMENTS.length,
            messages: ISO_MESSAGES.length,
            codes: GLOSSARY_CODES.length,
          })}{' '}
          <Link to="/about" className="text-signal hover:underline">
            {t('nav.about')}
          </Link>
        </p>
      </footer>
    </div>
  );
}
