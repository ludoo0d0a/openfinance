import type {
  CountryId,
  InitiationChannel,
  Locale,
  Payment,
  PaymentOutcome,
} from '@/types';
import { paymentById, PAYMENTS } from '@/data/payments';
import { countryById } from '@/data/countries';

export interface JourneyOptions {
  initiation: InitiationChannel;
  rail: string;
  outcome: PaymentOutcome;
  locale: Locale;
  country?: CountryId;
}

export interface JourneyHopView {
  id: string;
  n: number;
  from: Payment['hops'][number]['from'];
  to: Payment['hops'][number]['to'];
  messageShort?: string;
  label: string;
  expert: string;
  tOffset?: string;
  sla?: string;
  flowId?: string;
  step?: number;
  sampleId?: string;
}

export interface JourneyView {
  payment: Payment;
  hops: JourneyHopView[];
  rail: string;
  initiation: InitiationChannel;
  outcome: PaymentOutcome;
  country?: CountryId;
}

function hopVisible(
  hop: Payment['hops'][number],
  opts: Pick<JourneyOptions, 'initiation' | 'rail' | 'outcome' | 'country'>,
): boolean {
  if (!hop.outcomes.includes(opts.outcome)) return false;
  if (hop.rails && !hop.rails.includes(opts.rail)) return false;
  if (hop.initiation && !hop.initiation.includes(opts.initiation)) return false;
  if (hop.countries && opts.country && !hop.countries.includes(opts.country)) return false;
  return true;
}

export function resolveJourneyOptions(
  payment: Payment,
  partial: Partial<JourneyOptions> & { locale: Locale },
): JourneyOptions {
  const initiation = payment.initiationChannels.includes(partial.initiation as InitiationChannel)
    ? (partial.initiation as InitiationChannel)
    : payment.initiationChannels[0];

  const country =
    partial.country && payment.countryIds?.includes(partial.country)
      ? partial.country
      : payment.defaultCountryId;

  const preferred = country ? countryById(country)?.preferredRailId : undefined;
  const railFromCountry =
    preferred && payment.infrastructureIds.includes(preferred) ? preferred : undefined;

  const rail = payment.infrastructureIds.includes(partial.rail ?? '')
    ? (partial.rail as string)
    : (railFromCountry ?? payment.defaultRailId);

  return {
    initiation,
    rail,
    outcome: parseOutcome(payment, partial.outcome),
    locale: partial.locale,
    country,
  };
}

function parseOutcome(payment: Payment, raw: unknown): PaymentOutcome {
  if (raw === 'reject' || raw === 'timeout' || raw === 'recall') {
    if (payment.hops.some((h) => h.outcomes.includes(raw))) return raw;
  }
  return 'happy';
}

/** Payments whose explorer hops or relatedFlowIds point at this technical flow. */
export function paymentsForFlow(flowId: string): Payment[] {
  const hopLinked = PAYMENTS.filter((p) => p.hops.some((h) => h.flowId === flowId));
  const relatedOnly = PAYMENTS.filter(
    (p) => p.relatedFlowIds.includes(flowId) && !hopLinked.some((linked) => linked.id === p.id),
  );
  return [...hopLinked, ...relatedOnly];
}

export function outcomeForFlow(flowId: string): PaymentOutcome {
  if (flowId.includes('recall')) return 'recall';
  if (flowId.includes('reject')) return 'reject';
  if (flowId.includes('timeout')) return 'timeout';
  return 'happy';
}

export function paymentExplorerHref(
  paymentId: string,
  opts?: { outcome?: PaymentOutcome; focus?: string },
): string {
  const params = new URLSearchParams();
  if (opts?.outcome && opts.outcome !== 'happy') params.set('outcome', opts.outcome);
  if (opts?.focus) params.set('focus', opts.focus);
  const q = params.toString();
  return q ? `/payment/${paymentId}?${q}` : `/payment/${paymentId}`;
}

export function getPaymentJourney(paymentId: string, opts: JourneyOptions): JourneyView | undefined {
  const payment = paymentById(paymentId);
  if (!payment) return undefined;
  const resolved = resolveJourneyOptions(payment, opts);
  const hops = payment.hops.filter((h) => hopVisible(h, resolved)).map((h, i) => ({
    id: h.id,
    n: i + 1,
    from: h.from,
    to: h.to,
    messageShort: h.messageShort,
    label: h.simpleText[resolved.locale],
    expert: h.expertLabel[resolved.locale],
    tOffset: h.tOffset?.[resolved.locale],
    sla: h.sla?.[resolved.locale],
    flowId: h.flowId,
    step: h.step,
    sampleId: h.sampleId,
  }));
  return {
    payment,
    hops,
    rail: resolved.rail,
    initiation: resolved.initiation,
    outcome: resolved.outcome,
    country: resolved.country,
  };
}

export function compareJourneys(
  paymentId: string,
  compareId: string,
  opts: JourneyOptions,
): { left: JourneyView; right: JourneyView } | undefined {
  const left = getPaymentJourney(paymentId, opts);
  const other = PAYMENTS.find((p) => p.id === compareId);
  if (!left || !other) return undefined;
  const rightOpts = resolveJourneyOptions(other, {
    ...opts,
    rail: other.infrastructureIds.includes(opts.rail) ? opts.rail : other.defaultRailId,
    initiation: other.initiationChannels.includes(opts.initiation)
      ? opts.initiation
      : other.initiationChannels[0],
  });
  const right = getPaymentJourney(compareId, rightOpts);
  if (!right) return undefined;
  return { left, right };
}
