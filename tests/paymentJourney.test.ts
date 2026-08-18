import { describe, expect, it } from 'vitest';
import { getPaymentJourney, outcomeForFlow, paymentExplorerHref, paymentsForFlow, resolveJourneyOptions } from '../src/lib/paymentJourney';
import { paymentById } from '../src/data/payments';

describe('getPaymentJourney', () => {
  it('includes VoP and pacs.008 on SCT Inst happy path', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.messageShort === 'acmt.023')).toBe(true);
    expect(journey.hops.some((h) => h.messageShort === 'pacs.008')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(false);
    const vop = journey.hops.find((h) => h.messageShort === 'acmt.023')!;
    expect(vop.label).toMatch(/Verification of Payee/);
    expect(vop.expert).toMatch(/acmt\.023/);
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
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'timeout' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.hops.some((h) => h.messageShort === 'pacs.028')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(false);
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(false);
  });

  it('keeps settled Instant hops then adds recall messages', () => {
    const payment = paymentById('sepa-instant')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'recall' });
    const journey = getPaymentJourney('sepa-instant', opts)!;
    expect(journey.outcome).toBe('recall');
    expect(journey.hops.some((h) => h.id === 'inst-002-ok')).toBe(true);
    expect(journey.hops.some((h) => h.messageShort === 'camt.056')).toBe(true);
    expect(journey.hops.some((h) => h.messageShort === 'pacs.004')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'inst-002-rjct')).toBe(false);
  });

  it('prefers TIPS for France but keeps RT1 selectable', () => {
    const payment = paymentById('sepa-instant')!;
    const fr = resolveJourneyOptions(payment, { locale: 'en', country: 'FR' });
    expect(fr.rail).toBe('tips');
    expect(payment.infrastructureIds).toContain('rt1');
    const rt1 = resolveJourneyOptions(payment, { locale: 'en', country: 'FR', rail: 'rt1' });
    expect(rt1.rail).toBe('rt1');
  });

  it('shows SCT reject hops with pacs.002 RJCT', () => {
    const payment = paymentById('sepa-credit-transfer')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'reject' });
    const journey = getPaymentJourney('sepa-credit-transfer', opts)!;
    expect(journey.hops.some((h) => h.id === 'sct-002-rjct')).toBe(true);
    expect(journey.hops.some((h) => h.id === 'sct-002')).toBe(false);
    expect(journey.hops.some((h) => h.messageShort === 'pacs.008')).toBe(true);
  });

  it('shows SCT recall hops including pacs.004 after settlement', () => {
    const payment = paymentById('sepa-credit-transfer')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'recall' });
    const journey = getPaymentJourney('sepa-credit-transfer', opts)!;
    expect(journey.outcome).toBe('recall');
    expect(journey.hops.some((h) => h.id === 'sct-credit')).toBe(true);
    expect(journey.hops.some((h) => h.messageShort === 'pacs.004')).toBe(true);
    expect(journey.hops.find((h) => h.messageShort === 'pacs.004')?.flowId).toBe('clearing-recall');
  });

  it('ignores recall on payments that have no recall hops', () => {
    const payment = paymentById('card-payment')!;
    const opts = resolveJourneyOptions(payment, { locale: 'en', outcome: 'recall' });
    expect(opts.outcome).toBe('happy');
  });
});

describe('payment–flow pairing', () => {
  it('pairs clearing-recall with SCT and focuses pacs.004', () => {
    expect(paymentsForFlow('clearing-recall').map((p) => p.id)).toContain('sepa-credit-transfer');
    expect(outcomeForFlow('clearing-recall')).toBe('recall');
    expect(paymentExplorerHref('sepa-credit-transfer', { outcome: 'recall', focus: 'pacs.004' })).toBe(
      '/payment/sepa-credit-transfer?outcome=recall&focus=pacs.004',
    );
  });

  it('lists hop-linked payments before related-only ones', () => {
    const ids = paymentsForFlow('clearing-sct-happy-path').map((p) => p.id);
    expect(ids[0]).toBe('sepa-credit-transfer');
    expect(ids).toContain('swift-credit-transfer');
  });
});
