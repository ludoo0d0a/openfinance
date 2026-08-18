import { Link } from 'react-router-dom';
import type { JourneyHopView, JourneyView } from '@/lib/paymentJourney';
import { messageByShort } from '@/data/iso20022';
import { infrastructureById } from '@/data/infrastructures';
import { schemeById } from '@/data/schemes';
import { samplesForMessage } from '@/data/samples';
import { relatedFrom, parseEntityRef, paymentsUsingMessage } from '@/data/relations';
import { PAYMENTS } from '@/data/payments';
import { JargonText } from '@/components/JargonText';
import { useI18n, useT } from '@/i18n';

export function EntityPanel({
  journey,
  hop,
}: {
  journey: JourneyView;
  hop: JourneyHopView | undefined;
}) {
  const t = useT();
  const { locale } = useI18n();
  const payment = journey.payment;
  const scheme = schemeById(payment.schemeId);
  const rail = infrastructureById(journey.rail);
  const message = hop?.messageShort ? messageByShort(hop.messageShort) : undefined;
  const sample = hop?.sampleId
    ? hop.sampleId
    : message
      ? samplesForMessage(message.short).find((s) => !s.id.endsWith('-json'))?.id
      : undefined;

  const usedBy = message ? paymentsUsingMessage(message.short) : [];
  const relatedMsgs = message
    ? relatedFrom(`message:${message.short}`, 'related_message').map((r) => parseEntityRef(r.to).id)
    : [];

  return (
    <aside className="panel space-y-5 p-4">
      <p className="text-[12px] leading-relaxed text-muted">{payment.disclaimer[locale]}</p>

      <section>
        <p className="eyebrow">{t('explorer.questionsTitle')}</p>
        <ul className="mt-2 space-y-1 text-[13px] text-muted">
          <li className={hop ? 'text-ink' : undefined}>
            {t('explorer.qWho')} —{' '}
            {hop ? (
              <JargonText text={`${t(`explorer.actor.${hop.from}`)} → ${t(`explorer.actor.${hop.to}`)}`} />
            ) : (
              '—'
            )}
          </li>
          <li>
            {t('explorer.qSystem')} — {rail ? <JargonText text={rail.name[locale]} /> : '—'}
          </li>
          <li>
            {t('explorer.qMessages')} —{' '}
            {hop?.messageShort ? <JargonText text={hop.messageShort} /> : t('explorer.noMessage')}
          </li>
          <li>
            {t('explorer.qStandards')} — {scheme ? <JargonText text={scheme.name[locale]} /> : '—'}
          </li>
        </ul>
      </section>

      {hop && (
        <section>
          <p className="eyebrow">{t('explorer.thisHop')}</p>
          <p className="mt-2 text-[14px] leading-relaxed">{hop.label}</p>
          {hop.expert && hop.expert !== hop.label && (
            <p className="mt-1 font-mono text-[12px] text-violet">{hop.expert}</p>
          )}
          {hop.flowId && (
            <Link
              to={hop.step ? `/flows/${hop.flowId}?step=${hop.step}` : `/flows/${hop.flowId}`}
              className="mt-2 inline-block text-[13px] text-signal hover:underline"
            >
              {t('explorer.openTrace')}
            </Link>
          )}
        </section>
      )}

      {message && (
        <section>
          <p className="eyebrow">{message.short}</p>
          <h2 className="mt-1 text-lg font-semibold">{message.name}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{message.purpose}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/messages/${message.short}`} className="border border-rule px-2 py-1 text-[13px] hover:border-ink">
              {t('explorer.messagePage')}
            </Link>
            {sample && (
              <Link to={`/samples/${sample}`} className="border border-rule px-2 py-1 text-[13px] hover:border-ink">
                {t('explorer.inspectSample')}
              </Link>
            )}
            {message.short === 'pacs.008' && (
              <Link to="/try" className="border border-rule px-2 py-1 text-[13px] hover:border-ink">
                {t('nav.try')}
              </Link>
            )}
          </div>
          {relatedMsgs.length > 0 && (
            <p className="mt-3 font-mono text-[12px] text-muted">
              {t('explorer.related')}{' '}
              {relatedMsgs.map((s, i) => (
                <span key={s}>
                  {i > 0 ? ', ' : ''}
                  <Link to={`/messages/${s}`} className="text-violet hover:underline">
                    {s}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {usedBy.length > 0 && (
            <p className="mt-2 text-[12px] text-muted">
              {t('explorer.usedBy')}{' '}
              {usedBy.map((id, i) => {
                const p = PAYMENTS.find((x) => x.id === id);
                return (
                  <span key={id}>
                    {i > 0 ? ', ' : ''}
                    <Link to={`/payment/${id}`} className="hover:underline">
                      {p?.name[locale] ?? id}
                    </Link>
                  </span>
                );
              })}
            </p>
          )}
        </section>
      )}

      <section>
        <p className="eyebrow">{t('explorer.related')}</p>
        <ul className="mt-2 space-y-1 text-[13px]">
          {scheme && (
            <li>
              <Link to={`/scheme/${scheme.id}`} className="hover:underline">
                {scheme.name[locale]}
              </Link>
            </li>
          )}
          {relatedFrom(`payment:${payment.id}`, 'settles_on').map((r) => {
            const id = parseEntityRef(r.to).id;
            const inf = infrastructureById(id);
            if (!inf) return null;
            return (
              <li key={id}>
                <Link to={`/infrastructure/${id}`} className="hover:underline">
                  {inf.name[locale]}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <p className="eyebrow">{t('explorer.sources')}</p>
        <ul className="mt-2 space-y-1">
          {payment.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-[13px] text-signal hover:underline">
                {s.name}
              </a>
              <span className="ml-2 font-mono text-[10px] text-muted">{s.lastUpdated}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
