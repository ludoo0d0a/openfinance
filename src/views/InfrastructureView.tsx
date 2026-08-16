import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { infrastructureById } from '@/data/infrastructures';
import { relatedTo, parseEntityRef } from '@/data/relations';
import { paymentById } from '@/data/payments';
import { useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { PageAd } from '@/components/PageAd';

export function InfrastructureView() {
  const t = useT();
  const { locale } = useI18n();
  const { infrastructureId } = useParams();
  const infra = infrastructureId ? infrastructureById(infrastructureId) : undefined;

  useEffect(() => {
    if (infra) document.title = `${infra.name[locale]} — OpenFinance`;
  }, [infra, locale]);

  if (!infra) return <NotFoundView />;

  const payments = relatedTo(`infrastructure:${infra.id}`, 'settles_on').map((r) => parseEntityRef(r.from).id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <p className="eyebrow">{t('explorer.infrastructure')}</p>
      <h1 className="mt-2 text-3xl font-bold">{infra.name[locale]}</h1>
      <p className="mt-2 font-mono text-[12px] text-muted">
        {infra.operator} · {infra.region} · {infra.currency}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{infra.summary[locale]}</p>
      <p className="mt-3 text-[14px] leading-relaxed">{infra.usedFor[locale]}</p>
      <PageAd placement="mid" />
      {infra.relatedMessageShorts.length > 0 && (
        <p className="mt-4 font-mono text-[13px]">
          {infra.relatedMessageShorts.map((s, i) => (
            <span key={s}>
              {i > 0 ? ' · ' : ''}
              <Link to={`/messages/${s}`} className="text-violet hover:underline">
                {s}
              </Link>
            </span>
          ))}
        </p>
      )}
      {payments.length > 0 && (
        <ul className="mt-8 space-y-2">
          {payments.map((id) => {
            const p = paymentById(id);
            if (!p) return null;
            return (
              <li key={id}>
                <Link to={`/payment/${p.id}`} className="text-[14px] hover:underline">
                  {t('explorer.exploreThis')} — {p.name[locale]}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <ul className="mt-8 space-y-1 text-[13px]">
        {infra.sources.map((s) => (
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
