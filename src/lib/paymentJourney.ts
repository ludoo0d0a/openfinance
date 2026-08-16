import type { ExplorerLevel, InitiationChannel, Locale, Payment, PaymentOutcome } from '@/types';
import { paymentById, PAYMENTS } from '@/data/payments';

export interface JourneyOptions {
  level: ExplorerLevel;
  initiation: InitiationChannel;
  rail: string;
  outcome: PaymentOutcome;
  locale: Locale;
}

export interface JourneyHopView {
  id: string;
  n: number;
  from: Payment['hops'][number]['from'];
  to: Payment['hops'][number]['to'];
  messageShort?: string;
  label: string;
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
  level: ExplorerLevel;
}

function hopVisible(
  hop: Payment['hops'][number],
  opts: Pick<JourneyOptions, 'initiation' | 'rail' | 'outcome'>,
): boolean {
  if (!hop.outcomes.includes(opts.outcome)) return false;
  if (hop.rails && !hop.rails.includes(opts.rail)) return false;
  if (hop.initiation && !hop.initiation.includes(opts.initiation)) return false;
  return true;
}

export function resolveJourneyOptions(
  payment: Payment,
  partial: Partial<JourneyOptions> & { locale: Locale },
): JourneyOptions {
  const initiation = payment.initiationChannels.includes(partial.initiation as InitiationChannel)
    ? (partial.initiation as InitiationChannel)
    : payment.initiationChannels[0];
  const rail = payment.infrastructureIds.includes(partial.rail ?? '')
    ? (partial.rail as string)
    : payment.defaultRailId;
  return {
    level: partial.level === 'expert' ? 'expert' : 'simple',
    initiation,
    rail,
    outcome:
      partial.outcome === 'reject' || partial.outcome === 'timeout' ? partial.outcome : 'happy',
    locale: partial.locale,
  };
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
    label: resolved.level === 'expert' ? h.expertLabel[resolved.locale] : h.simpleText[resolved.locale],
    tOffset: h.tOffset?.[resolved.locale],
    sla: h.sla?.[resolved.locale],
    flowId: h.flowId,
    step: h.step,
    sampleId: h.sampleId,
  }));
  return { payment, hops, rail: resolved.rail, initiation: resolved.initiation, outcome: resolved.outcome, level: resolved.level };
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
