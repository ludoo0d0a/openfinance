import { Link } from 'react-router-dom';
import { useT } from '@/i18n';

export function NotFoundView() {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 lg:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('notFound.body')}</p>
      <Link to="/" className="mt-6 inline-block border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest">
        {t('notFound.back')}
      </Link>
    </div>
  );
}
