import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { schemeById } from '@/data/schemes';
import { relatedTo, parseEntityRef } from '@/data/relations';
import { paymentById } from '@/data/payments';
import { useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { PageAd } from '@/components/PageAd';

export function SchemeView() {
  const t = useT();
  const { locale } = useI18n();
  const { schemeId } = useParams();
  const scheme = schemeId ? schemeById(schemeId) : undefined;
  const payment = scheme ? paymentById(scheme.explorePaymentId) : undefined;

  useEffect(() => {
    if (scheme) document.title = `${scheme.name[locale]} — OpenFinance`;
  }, [scheme, locale]);

  if (!scheme) return <NotFoundView />;

  const payments = relatedTo(`scheme:${scheme.id}`, 'defined_by')
    .map((r) => parseEntityRef(r.from).id)
    .filter((kindId, _, arr) => arr.indexOf(kindId) === _);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <p className="eyebrow">{t('explorer.scheme')}</p>
      <h1 className="mt-2 text-3xl font-bold">{scheme.name[locale]}</h1>
      <p className="mt-2 text-[13px] text-muted">{scheme.operator}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{scheme.summary[locale]}</p>
      <PageAd placement="mid" />
      {payment && (
        <Link
          to={`/payment/${payment.id}`}
          className="mt-6 inline-flex border border-ink bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t('explorer.exploreThis')}
        </Link>
      )}
      {payments.length > 0 && (
        <ul className="mt-8 space-y-2 text-[14px]">
          {payments.map((id) => {
            const p = paymentById(id);
            if (!p) return null;
            return (
              <li key={id}>
                <Link to={`/payment/${id}`} className="hover:underline">
                  {p.name[locale]}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <ul className="mt-8 space-y-1 text-[13px]">
        {scheme.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer" className="text-signal hover:underline">
              {s.name}
            </a>
            <span className="ml-2 font-mono text-[10px] text-muted">{s.lastUpdated}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
