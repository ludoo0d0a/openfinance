import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { paymentById, PAYMENTS } from '@/data/payments';
import { infrastructureById } from '@/data/infrastructures';
import { schemeById, schemeHref } from '@/data/schemes';
import { countryById, COUNTRIES } from '@/data/countries';
import { flowById, isoMessagesInFlow } from '@/data/flows';
import { liveScenarioHref, scenariosForPayment } from '@/data/lifeScenes';
import { compareJourneys, getPaymentJourney, resolveJourneyOptions } from '@/lib/paymentJourney';
import type { CountryId, InitiationChannel, PaymentOutcome } from '@/types';
import { PaymentTimeline } from '@/components/PaymentTimeline';
import { EntityPanel } from '@/components/EntityPanel';
import { JargonText } from '@/components/JargonText';
import { localizeFlow, useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { cn } from '@/lib/cn';

export function PaymentExplorerView() {
  const t = useT();
  const { locale } = useI18n();
  const { paymentId } = useParams();
  const [params, setParams] = useSearchParams();
  const payment = paymentId ? paymentById(paymentId) : undefined;

  const opts = payment
    ? resolveJourneyOptions(payment, {
        locale,
        initiation: params.get('via') as InitiationChannel,
        rail: params.get('rail') ?? undefined,
        outcome: params.get('outcome') as PaymentOutcome,
        country: (params.get('from') as CountryId) || undefined,
      })
    : undefined;

  const journey = payment && opts ? getPaymentJourney(payment.id, opts) : undefined;
  const focus = params.get('focus');
  const compareOn = params.get('compare') === '1' && Boolean(payment?.comparePaymentId);
  const compared =
    journey && payment?.comparePaymentId && compareOn
      ? compareJourneys(payment.id, payment.comparePaymentId, opts!)
      : undefined;

  const selectedHopId = useMemo(() => {
    if (!journey) return undefined;
    if (focus) {
      const byId = journey.hops.find((h) => h.id === focus);
      if (byId) return byId.id;
      const byMsg = journey.hops.find((h) => h.messageShort === focus);
      if (byMsg) return byMsg.id;
    }
    return journey.hops[0]?.id;
  }, [journey, focus]);

  const selectedHop = journey?.hops.find((h) => h.id === selectedHopId);
  const country = opts?.country ? countryById(opts.country) : undefined;

  useEffect(() => {
    if (!payment) return;
    document.title = `${payment.name[locale]} — Payment Explorer`;
  }, [payment, locale]);

  if (!payment || !journey || !opts) return <NotFoundView />;

  const scheme = schemeById(payment.schemeId);
  const compareName = payment.comparePaymentId
    ? PAYMENTS.find((p) => p.id === payment.comparePaymentId)?.name[locale]
    : undefined;
  const liveHits = scenariosForPayment(payment.id);

  const outcomes: { id: string; label: string }[] = [
    { id: 'happy', label: t('explorer.happy') },
    { id: 'reject', label: t('explorer.reject') },
  ];
  if (payment.hops.some((h) => h.outcomes.includes('timeout'))) {
    outcomes.push({ id: 'timeout', label: t('explorer.timeout') });
  }
  if (payment.hops.some((h) => h.outcomes.includes('recall'))) {
    outcomes.push({ id: 'recall', label: t('explorer.recall') });
  }

  function setParam(key: string, value: string | null) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === '') next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  function selectHop(id: string) {
    setParam('focus', id);
  }

  const viaKey = (c: InitiationChannel) =>
    c === 'bank'
      ? 'explorer.viaBank'
      : c === 'pisp'
        ? 'explorer.viaPisp'
        : c === 'wero'
          ? 'explorer.viaWero'
          : c === 'merchant'
            ? 'explorer.viaMerchant'
            : 'explorer.viaCreditor';

  return (
    <div className="page-fluid">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('explorer.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{payment.name[locale]}</h1>
        {payment.story && (
          <p className="mt-3 border-l-2 border-jade pl-3 text-[15px] leading-relaxed font-medium">
            {payment.story.headline[locale]}
          </p>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{payment.summary[locale]}</p>
        {payment.story?.body?.map((paragraph, i) => (
          <p key={i} className="mt-3 text-[15px] leading-relaxed text-muted">
            {paragraph[locale]}
          </p>
        ))}
        {scheme && (
          <p className="mt-2 text-[13px] text-muted">
            {t('explorer.scheme')}{' '}
            <Link to={schemeHref(scheme.id)} className="text-signal hover:underline">
              {scheme.name[locale]}
            </Link>
          </p>
        )}
        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          <JargonText text={t('explorer.howTo')} />
        </p>
      </header>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {payment.countryIds && payment.countryIds.length > 0 && (
          <ToggleField label={t('explorer.country')} hint={t('explorer.countryHint')}>
            <ToggleGroup
              ariaLabel={t('explorer.country')}
              value={opts.country ?? payment.defaultCountryId ?? payment.countryIds[0]}
              options={payment.countryIds.map((id) => ({
                id,
                label: COUNTRIES.find((c) => c.id === id)?.name[locale] ?? id,
              }))}
              onChange={(id) => setParam('from', id === payment.defaultCountryId ? null : id)}
            />
          </ToggleField>
        )}
        {payment.initiationChannels.length > 1 && (
          <ToggleField label={t('explorer.viaLabel')} hint={t('explorer.viaHint')}>
            <ToggleGroup
              ariaLabel={t('explorer.viaLabel')}
              value={opts.initiation}
              options={payment.initiationChannels.map((c) => ({
                id: c,
                label: t(viaKey(c)),
              }))}
              onChange={(id) => setParam('via', id === payment.initiationChannels[0] ? null : id)}
            />
          </ToggleField>
        )}
        {payment.infrastructureIds.length > 1 && (
          <ToggleField label={t('explorer.rail')} hint={t('explorer.railHint')}>
            <ToggleGroup
              ariaLabel={t('explorer.rail')}
              value={opts.rail}
              options={payment.infrastructureIds.map((id) => ({
                id,
                label: infrastructureById(id)?.name[locale] ?? id,
              }))}
              onChange={(id) => setParam('rail', id === payment.defaultRailId ? null : id)}
            />
          </ToggleField>
        )}
        {outcomes.length >= 2 && (
          <ToggleField label={t('explorer.outcome')} hint={t('explorer.outcomeHint')}>
            <ToggleGroup
              ariaLabel={t('explorer.outcome')}
              value={opts.outcome}
              options={outcomes}
              onChange={(id) => setParam('outcome', id === 'happy' ? null : id)}
            />
          </ToggleField>
        )}
        {payment.comparePaymentId && compareName && (
          <ToggleField label={t('explorer.compare')} hint={t('explorer.compareHint')}>
            <button
              type="button"
              onClick={() => setParam('compare', compareOn ? null : '1')}
              className={cn(
                'border px-3 py-1.5 text-[13px]',
                compareOn ? 'border-ink bg-ink text-white' : 'border-rule bg-surface hover:border-ink',
              )}
            >
              {compareName}
            </button>
          </ToggleField>
        )}
      </div>

      {country && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] leading-snug text-muted">{t('explorer.countryNotesLead')}</p>
          <div className="panel grid gap-3 p-4 text-[13px] leading-relaxed sm:grid-cols-3">
            <div>
              <p className="eyebrow mb-1">{t('explorer.cutoff')}</p>
              <p className="text-muted">{country.cutoffNote[locale]}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">{t('explorer.reachability')}</p>
              <p className="text-muted">{country.reachabilityNote[locale]}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">{t('explorer.localException')}</p>
              <p className="text-muted">{country.exceptionNote[locale]}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <PaymentTimeline
          journey={journey}
          selectedHopId={selectedHopId}
          onSelectHop={selectHop}
          compareHops={compared?.right.hops}
        />
        <EntityPanel journey={journey} hop={selectedHop} />
      </div>

      {payment.relatedFlowIds.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <p className="eyebrow">{t('explorer.layerTraces')}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            <JargonText text={t('explorer.tracesHint')} />
          </p>
          <ul className="mt-3 space-y-2">
            {payment.relatedFlowIds.map((flowId) => {
              const catalog = flowById(flowId);
              if (!catalog) return null;
              const flow = localizeFlow(catalog, locale);
              const messages = isoMessagesInFlow(catalog);
              const active = selectedHop?.flowId === flowId;
              const href =
                active && selectedHop?.step
                  ? `/flows/${flowId}?step=${selectedHop.step}`
                  : `/flows/${flowId}`;
              return (
                <li key={flowId}>
                  <Link
                    to={href}
                    className={cn(
                      'block border px-3 py-2 hover:border-ink',
                      active ? 'border-ink bg-paper-raised' : 'border-rule bg-surface',
                    )}
                  >
                    <span className="text-[14px] font-medium">{flow.name}</span>
                    {messages.length > 0 && (
                      <p className="mt-1 font-mono text-[11px] text-violet">{messages.join(' → ')}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {liveHits.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <p className="eyebrow">{t('explorer.tryInLive')}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {liveHits.map(({ scenario, beatIndex }) => (
              <li key={scenario.id}>
                <Link
                  to={liveScenarioHref(scenario, beatIndex)}
                  className="border border-rule bg-surface px-2 py-1 text-[13px] hover:border-ink"
                >
                  {scenario.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ToggleField({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 mb-2 text-[12px] leading-snug text-muted">
        <JargonText text={hint} />
      </p>
      {children}
    </div>
  );
}

function ToggleGroup({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex flex-wrap border border-rule">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'px-3 py-1.5 text-[13px]',
            value === o.id ? 'bg-ink text-white' : 'bg-surface hover:bg-paper-raised',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
