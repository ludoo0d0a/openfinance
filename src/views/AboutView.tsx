import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { GLOSSARY, GLOSSARY_SOURCES } from '@/data/glossary';
import { useT } from '@/i18n';

export function AboutView() {
  const t = useT();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <header>
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Info size={12} aria-hidden />
          {t('about.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('about.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('about.lead')}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('about.publisher')}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          <Link to="/contact" className="text-signal hover:underline">
            {t('nav.contact')}
          </Link>
          {' · '}
          <Link to="/privacy" className="text-signal hover:underline">
            {t('nav.privacy')}
          </Link>
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{t('about.glossaryTitle')}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('about.glossaryLead')}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {t('about.glossaryCount', { count: GLOSSARY.length })}{' '}
          <Link to="/glossary" className="text-signal hover:underline">
            {t('nav.glossary')} →
          </Link>
        </p>
        <ul className="mt-5 space-y-4">
          {GLOSSARY_SOURCES.map((s) => (
            <li key={s.id} className="panel p-4">
              <p className="font-semibold">{s.label}</p>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block break-all font-mono text-[12px] text-signal hover:underline"
              >
                {s.href}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">{t('about.glossaryNote')}</p>
      </section>
    </div>
  );
}
