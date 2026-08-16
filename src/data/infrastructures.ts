import type { Infrastructure } from '@/types';

const SRC_ECB_TIPS = {
  name: 'ECB — TIPS',
  url: 'https://www.ecb.europa.eu/paym/target/tips/html/index.en.html',
  lastUpdated: '2026-08-16',
};

const SRC_EBA_RT1 = {
  name: 'EBA Clearing — RT1',
  url: 'https://www.ebaclearing.eu/services/rt1/',
  lastUpdated: '2026-08-16',
};

const SRC_EBA_STEP2 = {
  name: 'EBA Clearing — STEP2',
  url: 'https://www.ebaclearing.eu/services/step2/',
  lastUpdated: '2026-08-16',
};

const SRC_EPI = {
  name: 'EPI / Wero',
  url: 'https://wero-wallet.eu/',
  lastUpdated: '2026-08-16',
};

export const INFRASTRUCTURES: Infrastructure[] = [
  {
    id: 'step2',
    name: { en: 'STEP2', fr: 'STEP2' },
    operator: 'EBA Clearing',
    region: 'SEPA',
    currency: 'EUR',
    summary: {
      en: 'Pan-European automated clearing house for SEPA credit transfers and direct debits. Batch cycles, not instant.',
      fr: 'Chambre de compensation paneuropéenne pour virements et prélèvements SEPA. Cycles de lots, pas de l’instantané.',
    },
    usedFor: {
      en: 'SEPA Credit Transfer settlement in batches (typically next TARGET business day).',
      fr: 'Règlement des virements SEPA par lots (souvent le jour TARGET suivant).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pain.001'],
    mapFlowHref: '/flows/clearing-sct-happy-path',
    sources: [SRC_EBA_STEP2],
  },
  {
    id: 'tips',
    name: { en: 'TIPS', fr: 'TIPS' },
    operator: 'Eurosystem',
    region: 'SEPA / EEA',
    currency: 'EUR',
    summary: {
      en: 'TARGET Instant Payment Settlement: 24/7/365 instant settlement in central-bank money.',
      fr: 'TARGET Instant Payment Settlement : règlement instantané 24/7/365 en monnaie de banque centrale.',
    },
    usedFor: {
      en: 'SEPA Instant and other euro instant credit transfers that clear on TIPS.',
      fr: 'Virements SEPA Instant et autres virements euro instantanés compensés sur TIPS.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.028'],
    mapFlowHref: '/flows/sct-inst-happy-path',
    sources: [SRC_ECB_TIPS],
  },
  {
    id: 'rt1',
    name: { en: 'RT1', fr: 'RT1' },
    operator: 'EBA Clearing',
    region: 'SEPA',
    currency: 'EUR',
    summary: {
      en: 'Pan-European instant payment system operated by EBA Clearing. Alternative CSM to TIPS for SCT Inst.',
      fr: 'Système paneuropéen de paiements instantanés opéré par EBA Clearing. CSM alternatif à TIPS pour le SCT Inst.',
    },
    usedFor: {
      en: 'SEPA Instant when the banks’ chosen CSM is RT1 rather than TIPS.',
      fr: 'SEPA Instant lorsque le CSM choisi par les banques est RT1 plutôt que TIPS.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.028'],
    mapFlowHref: '/flows/sct-inst-happy-path',
    sources: [SRC_EBA_RT1],
  },
  {
    id: 'wero-platform',
    name: { en: 'Wero platform', fr: 'Plateforme Wero' },
    operator: 'EPI Company',
    region: 'Europe',
    currency: 'EUR',
    summary: {
      en: 'Wero account-to-account overlay: payment intent, proxy (phone/email → IBAN), then settlement on instant rails.',
      fr: 'Couche compte-à-compte Wero : intention de paiement, proxy (téléphone/e-mail → IBAN), puis règlement sur rails instantanés.',
    },
    usedFor: {
      en: 'Retail A2A checkout and P2P where the UX is Wero and money still moves as SCT Inst.',
      fr: 'Paiement A2A retail et P2P dont l’UX est Wero, l’argent circulant toujours en SCT Inst.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002'],
    mapFlowHref: '/flows/wero-a2a-payment',
    sources: [SRC_EPI],
  },
];

export const infrastructureById = (id: string) => INFRASTRUCTURES.find((i) => i.id === id);
