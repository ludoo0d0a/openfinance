import type { CatalogRelation, EntityRef, RelationType } from '@/types';

export const RELATIONS: CatalogRelation[] = [
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:pain.001' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:pacs.008' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:pacs.002' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:camt.054' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:camt.056' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:camt.029' },
  { type: 'uses_message', from: 'payment:sepa-credit-transfer', to: 'message:pacs.004' },
  { type: 'settles_on', from: 'payment:sepa-credit-transfer', to: 'infrastructure:step2' },
  { type: 'defined_by', from: 'payment:sepa-credit-transfer', to: 'scheme:sct' },
  { type: 'defined_by', from: 'scheme:sct', to: 'organization:epc' },
  { type: 'initiated_via', from: 'payment:sepa-credit-transfer', to: 'organization:bank' },

  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:pain.001' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:acmt.023' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:acmt.024' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:pacs.008' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:pacs.002' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:pacs.028' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:camt.054' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:camt.056' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:camt.029' },
  { type: 'uses_message', from: 'payment:sepa-instant', to: 'message:pacs.004' },
  { type: 'settles_on', from: 'payment:sepa-instant', to: 'infrastructure:tips' },
  { type: 'settles_on', from: 'payment:sepa-instant', to: 'infrastructure:rt1' },
  { type: 'defined_by', from: 'payment:sepa-instant', to: 'scheme:sct-inst' },
  { type: 'defined_by', from: 'scheme:sct-inst', to: 'organization:epc' },
  { type: 'variant_of', from: 'payment:sepa-instant', to: 'payment:sepa-credit-transfer' },

  { type: 'uses_message', from: 'payment:wero', to: 'message:pacs.008' },
  { type: 'uses_message', from: 'payment:wero', to: 'message:pacs.002' },
  { type: 'settles_on', from: 'payment:wero', to: 'infrastructure:tips' },
  { type: 'settles_on', from: 'payment:wero', to: 'infrastructure:rt1' },
  { type: 'settles_on', from: 'payment:wero', to: 'infrastructure:wero-platform' },
  { type: 'defined_by', from: 'payment:wero', to: 'scheme:wero' },
  { type: 'defined_by', from: 'scheme:wero', to: 'organization:epi' },
  { type: 'initiated_via', from: 'payment:wero', to: 'scheme:wero' },
  { type: 'variant_of', from: 'payment:wero', to: 'payment:sepa-instant' },

  { type: 'related_message', from: 'message:pacs.008', to: 'message:pain.001' },
  { type: 'related_message', from: 'message:pacs.008', to: 'message:pacs.002' },
  { type: 'related_message', from: 'message:pacs.002', to: 'message:pacs.008' },
  { type: 'related_message', from: 'message:pain.001', to: 'message:pacs.008' },
  { type: 'related_message', from: 'message:acmt.023', to: 'message:acmt.024' },
  { type: 'related_message', from: 'message:pacs.028', to: 'message:pacs.008' },

  { type: 'uses_message', from: 'payment:sepa-direct-debit', to: 'message:pain.008' },
  { type: 'uses_message', from: 'payment:sepa-direct-debit', to: 'message:pacs.004' },
  { type: 'settles_on', from: 'payment:sepa-direct-debit', to: 'infrastructure:step2' },
  { type: 'defined_by', from: 'payment:sepa-direct-debit', to: 'scheme:sdd' },

  { type: 'settles_on', from: 'payment:card-payment', to: 'infrastructure:card-schemes' },
  { type: 'defined_by', from: 'payment:card-payment', to: 'scheme:card' },

  { type: 'uses_message', from: 'payment:swift-credit-transfer', to: 'message:pain.001' },
  { type: 'uses_message', from: 'payment:swift-credit-transfer', to: 'message:pacs.008' },
  { type: 'uses_message', from: 'payment:swift-credit-transfer', to: 'message:pacs.002' },
  { type: 'uses_message', from: 'payment:swift-credit-transfer', to: 'message:pacs.009' },
  { type: 'settles_on', from: 'payment:swift-credit-transfer', to: 'infrastructure:swift-cbpr' },
  { type: 'defined_by', from: 'payment:swift-credit-transfer', to: 'scheme:cbpr-plus' },
  { type: 'variant_of', from: 'payment:swift-credit-transfer', to: 'payment:sepa-credit-transfer' },
];

export function parseEntityRef(ref: EntityRef): { kind: string; id: string } {
  const i = ref.indexOf(':');
  return { kind: ref.slice(0, i), id: ref.slice(i + 1) };
}

export function relatedFrom(from: EntityRef, type?: RelationType): CatalogRelation[] {
  return RELATIONS.filter((r) => r.from === from && (type == null || r.type === type));
}

export function relatedTo(to: EntityRef, type?: RelationType): CatalogRelation[] {
  return RELATIONS.filter((r) => r.to === to && (type == null || r.type === type));
}

export function paymentsUsingMessage(short: string): string[] {
  return relatedTo(`message:${short}`, 'uses_message').map((r) => parseEntityRef(r.from).id);
}
