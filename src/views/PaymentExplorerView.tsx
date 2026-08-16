import { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { paymentById, PAYMENTS } from '@/data/payments';
import { infrastructureById } from '@/data/infrastructures';
import { schemeById } from '@/data/schemes';
import { countryById, COUNTRIES } from '@/data/countries';
import { compareJourneys, getPaymentJourney, resolveJourneyOptions } from '@/lib/paymentJourney';
import type { CountryId, ExplorerLevel, InitiationChannel, PaymentOutcome } from '@/types';
import { PaymentTimeline } from '@/components/PaymentTimeline';
import { EntityPanel } from '@/components/EntityPanel';
import { useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { cn } from '@/lib/cn';

const LEVEL_KEY = 'openfinance.explorerLevel';

export function PaymentExplorerView() {
  const t = useT();
  const { locale } = useI18n();
  const { paymentId } = useParams();
  const [params, setParams] = useSearchParams();
  const payment = paymentId ? paymentById(paymentId) : undefined;

  const opts = payment
    ? resolveJourneyOptions(payment, {
        locale,
        level: (params.get('level') as ExplorerLevel) || readStoredLevel(),
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
      const byMsg = journey.hops.find((h) => h.messageShort === focus);
      if (byMsg) return byMsg.id;
      const byId = journey.hops.find((h) => h.id === focus);
      if (byId) return byId.id;
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
    const hop = journey!.hops.find((h) => h.id === id);
    setParam('focus', hop?.messageShort ?? id);
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
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('explorer.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{payment.name[locale]}</h1>
        {payment.story && (
          <p className="mt-3 border-l-2 border-jade pl-3 text-[15px] leading-relaxed font-medium">
            {payment.story.headline[locale]}
          </p>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{payment.summary[locale]}</p>
        {scheme && (
          <p className="mt-2 text-[13px] text-muted">
            {t('explorer.scheme')}{' '}
            <Link to={`/scheme/${scheme.id}`} className="text-signal hover:underline">
              {scheme.name[locale]}
            </Link>
          </p>
        )}
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <ToggleGroup
          ariaLabel={t('explorer.level')}
          value={opts.level}
          options={[
            { id: 'simple', label: t('explorer.simple') },
            { id: 'expert', label: t('explorer.expert') },
          ]}
          onChange={(id) => {
            try {
              localStorage.setItem(LEVEL_KEY, id);
            } catch {
              /* ignore */
            }
            setParam('level', id === 'simple' ? null : id);
          }}
        />
        {payment.countryIds && payment.countryIds.length > 0 && (
          <ToggleGroup
            ariaLabel={t('explorer.country')}
            value={opts.country ?? payment.defaultCountryId ?? payment.countryIds[0]}
            options={payment.countryIds.map((id) => ({
              id,
              label: COUNTRIES.find((c) => c.id === id)?.name[locale] ?? id,
            }))}
            onChange={(id) =>
              setParam('from', id === payment.defaultCountryId ? null : id)
            }
          />
        )}
        {payment.initiationChannels.length > 1 && (
          <ToggleGroup
            ariaLabel={t('explorer.viaLabel')}
            value={opts.initiation}
            options={payment.initiationChannels.map((c) => ({
              id: c,
              label: t(viaKey(c)),
            }))}
            onChange={(id) => setParam('via', id === payment.initiationChannels[0] ? null : id)}
          />
        )}
        {payment.infrastructureIds.length > 1 && (
          <ToggleGroup
            ariaLabel={t('explorer.rail')}
            value={opts.rail}
            options={payment.infrastructureIds.map((id) => ({
              id,
              label: infrastructureById(id)?.name[locale] ?? id,
            }))}
            onChange={(id) => setParam('rail', id === payment.defaultRailId ? null : id)}
          />
        )}
        {(() => {
          const outcomes: { id: string; label: string }[] = [
            { id: 'happy', label: t('explorer.happy') },
            { id: 'reject', label: t('explorer.reject') },
          ];
          if (payment.hops.some((h) => h.outcomes.includes('timeout'))) {
            outcomes.push({ id: 'timeout', label: t('explorer.timeout') });
          }
          if (outcomes.length < 2) return null;
          return (
            <ToggleGroup
              ariaLabel={t('explorer.outcome')}
              value={opts.outcome}
              options={outcomes}
              onChange={(id) => setParam('outcome', id === 'happy' ? null : id)}
            />
          );
        })()}
        {payment.comparePaymentId && (
          <button
            type="button"
            onClick={() => setParam('compare', compareOn ? null : '1')}
            className={cn(
              'border px-3 py-1.5 text-[13px]',
              compareOn ? 'border-ink bg-ink text-white' : 'border-rule bg-surface hover:border-ink',
            )}
          >
            {t('explorer.compare')}{' '}
            {PAYMENTS.find((p) => p.id === payment.comparePaymentId)?.name[locale]}
          </button>
        )}
      </div>

      {country && (
        <div className="mt-4 panel grid gap-3 p-4 text-[13px] leading-relaxed sm:grid-cols-3">
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
    </div>
  );
}

function readStoredLevel(): ExplorerLevel | undefined {
  try {
    const v = localStorage.getItem(LEVEL_KEY);
    if (v === 'simple' || v === 'expert') return v;
  } catch {
    /* ignore */
  }
  return undefined;
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
    <div role="group" aria-label={ariaLabel} className="inline-flex border border-rule">
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
