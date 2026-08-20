import { Link } from 'react-router-dom';
import { LIFE_SCENES } from '@/data/lifeScenes';
import { useI18n, useT } from '@/i18n';

export function LiveHub() {
  const t = useT();
  const { locale } = useI18n();

  return (
    <div className="page-fluid lg:py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('live.eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t('live.title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('live.lead')}</p>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LIFE_SCENES.map((scene) => (
          <li key={scene.id}>
            <Link
              to={`/live/${scene.id}`}
              className="block h-full border border-rule bg-surface px-4 py-4 hover:border-ink"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {scene.brand[locale]}
              </p>
              <h2 className="mt-1 text-[16px] font-semibold">{scene.title[locale]}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{scene.blurb[locale]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
