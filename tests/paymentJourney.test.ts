import { describe, expect, it } from 'vitest';
import { getPaymentJourney, resolveJourneyOptions } from '../src/lib/paymentJourney';
import { paymentById } from '../src/data/payments';

describe('getPaymentJourney', () => {
  it('includes VoP and pacs.008 on SCT Inst happy path', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', level: 'expert' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.messageShort === 'acmt.023')).toBe(true);
    expect(journey.hops.some((h) => h.messageShort === 'pacs.008')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(false);
  });

  it('swaps to reject hops inside the Instant window', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'reject' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(false);
  });

  it('hides PISP initiation on the bank channel', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', initiation: 'bank' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.id === 'inst-init-pisp')).toBe(false);
    expect(journey.hops.some((h) => h.id === 'inst-init-bank')).toBe(true);
  });

  it('investigates with pacs.028 on Instant timeout', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'timeout', level: 'expert' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.messageShort === 'pacs.028')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(false);
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(false);
  });
});
