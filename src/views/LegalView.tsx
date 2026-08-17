import { Link } from 'react-router-dom';
import { useT } from '@/i18n';

export const PUBLISHER_EMAIL = 'contact@geoking.fr';

export function PrivacyView() {
  const t = useT();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <header>
        <p className="eyebrow">{t('privacy.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('privacy.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('privacy.updated')}</p>
      </header>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <p>{t('privacy.who')}</p>
        <h2 className="text-xl font-semibold text-ink">{t('privacy.dataTitle')}</h2>
        <p>{t('privacy.data')}</p>
        <h2 className="text-xl font-semibold text-ink">{t('privacy.adsTitle')}</h2>
        <p>{t('privacy.ads')}</p>
        <p>
          <a
            href="https://policies.google.com/privacy"
            className="text-signal hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {t('privacy.googlePolicy')}
          </a>
        </p>
        <h2 className="text-xl font-semibold text-ink">{t('privacy.cookiesTitle')}</h2>
        <p>{t('privacy.cookies')}</p>
        <h2 className="text-xl font-semibold text-ink">{t('privacy.contactTitle')}</h2>
        <p>
          {t('privacy.contact')}{' '}
          <a className="text-signal hover:underline" href={`mailto:${PUBLISHER_EMAIL}`}>
            {PUBLISHER_EMAIL}
          </a>
          .
        </p>
      </div>
    </article>
  );
}

export function ContactView() {
  const t = useT();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <header>
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('contact.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('contact.lead')}</p>
      </header>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          {t('contact.emailLabel')}{' '}
          <a className="text-signal hover:underline" href={`mailto:${PUBLISHER_EMAIL}`}>
            {PUBLISHER_EMAIL}
          </a>
        </p>
        <p>{t('contact.publisher')}</p>
        <p>
          <Link to="/about" className="text-signal hover:underline">
            {t('nav.about')}
          </Link>
          {' · '}
          <Link to="/privacy" className="text-signal hover:underline">
            {t('nav.privacy')}
          </Link>
        </p>
      </div>
    </article>
  );
}
