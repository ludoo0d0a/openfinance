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

const SRC_SIX = {
  name: 'SIX — SIC',
  url: 'https://www.six-group.com/en/products-services/banking-services/payment-standardization.html',
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
      en: 'SEPA Credit Transfer and SDD settlement in batches (typically next TARGET business day).',
      fr: 'Règlement SCT et SDD par lots (souvent le jour TARGET suivant).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pain.001', 'pain.008'],
    regularFlowHref: '/flows/clearing-sct-happy-path',
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
      en: 'TARGET Instant Payment Settlement: 24/7/365 instant settlement in central-bank money (TIPS DCA) under SCT Inst rules with ≤10s SLA. Operating alongside TARGET2 (T2) RTGS for regular payments.',
      fr: 'TARGET Instant Payment Settlement : règlement instantané 24/7/365 en monnaie de banque centrale (TIPS DCA) sous les règles SCT Inst avec SLA ≤10s. Fonctionne aux côtés de TARGET2 (T2) RTGS pour les paiements réguliers.',
    },
    usedFor: {
      en: 'Euro instant credit transfers (TIPS Instant Payment) and regular central bank money transfers (TARGET2 T2 RTGS).',
      fr: 'Virements euro instantanés (TIPS Instant Payment) et virements réguliers en monnaie de banque centrale (TARGET2 T2 RTGS).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.028', 'pacs.009', 'camt.056', 'pacs.004'],
    instantFlowHref: '/flows/sct-inst-happy-path',
    regularFlowHref: '/flows/target2-regular-payment',
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
      en: 'EBA Clearing instant CSM. Alternative to TIPS for SCT Inst — keep the two names separate.',
      fr: 'CSM instantané EBA Clearing. Alternative à TIPS pour le SCT Inst — gardez les deux noms distincts.',
    },
    usedFor: {
      en: 'SEPA Instant when the banks’ chosen CSM is RT1 rather than TIPS.',
      fr: 'SEPA Instant lorsque le CSM choisi par les banques est RT1 plutôt que TIPS.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.028'],
    instantFlowHref: '/flows/sct-inst-happy-path',
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
    instantFlowHref: '/flows/wero-a2a-payment',
    mapFlowHref: '/flows/wero-a2a-payment',
    sources: [SRC_EPI],
  },
  {
    id: 'sic',
    name: { en: 'SIC', fr: 'SIC' },
    operator: 'SIX',
    region: 'Switzerland',
    currency: 'CHF',
    summary: {
      en: 'Swiss Interbank Clearing operated by SIX on behalf of the Swiss National Bank (SNB). Supports both real-time gross settlement (SIC regular RTGS) and sub-10s instant settlement (SIC IP on the SIC5 platform) in central bank money with 100% pre-funding and wait-file queuing.',
      fr: 'Swiss Interbank Clearing opéré par SIX pour le compte de la Banque Nationale Suisse (BNS). Gère le règlement brut en temps réel (SIC RTGS régulier) et le règlement instantané <10s (SIC IP sur la plateforme SIC5) en monnaie de banque centrale avec couverture à 100 % et file d’attente (wait file).',
    },
    usedFor: {
      en: 'Domestic Swiss franc (CHF) transfers: instant payments (SIC IP, 24/7/365, <10s) and regular credit transfers (SIC RTGS with daily SNB settlement cut-offs).',
      fr: 'Virements en francs suisses (CHF) domestiques : paiements instantanés (SIC IP, 24/7/365, <10s) et virements réguliers (SIC RTGS avec cut-offs quotidiens BNS).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.028', 'pain.001', 'pain.002', 'camt.053', 'camt.054'],
    instantFlowHref: '/flows/sic-ip-instant',
    regularFlowHref: '/flows/sic-chf-credit',
    mapFlowHref: '/flows/sic-chf-credit',
    sources: [SRC_SIX],
  },
  {
    id: 'eurosic',
    name: { en: 'euroSIC', fr: 'euroSIC' },
    operator: 'SIX',
    region: 'Switzerland / EUR',
    currency: 'EUR',
    summary: {
      en: 'EUR clearing for Swiss participants via SIX — parallel to STEP2/TIPS for banks that route EUR through Switzerland.',
      fr: 'Compensation EUR pour participants suisses via SIX — parallèle à STEP2/TIPS pour les banques qui routent l’EUR via la Suisse.',
    },
    usedFor: {
      en: 'EUR credit transfers involving Swiss PSPs on euroSIC.',
      fr: 'Virements EUR impliquant des PSP suisses sur euroSIC.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002'],
    regularFlowHref: '/flows/eurosic-eur-credit',
    mapFlowHref: '/flows/eurosic-eur-credit',
    sources: [SRC_SIX],
  },
  {
    id: 'card-schemes',
    name: { en: 'Card schemes', fr: 'Schémas cartes' },
    operator: 'Scheme networks',
    region: 'Global',
    currency: 'Multi',
    summary: {
      en: 'Card authorization, clearing and settlement networks (Visa, Mastercard, …) — not ISO 20022 pacs rails.',
      fr: 'Réseaux d’autorisation, compensation et règlement carte (Visa, Mastercard, …) — pas des rails pacs ISO 20022.',
    },
    usedFor: {
      en: 'Card payments: auth → clearing files → settlement.',
      fr: 'Paiements carte : auth → fichiers de compensation → règlement.',
    },
    relatedMessageShorts: [],
    sources: [
      {
        name: 'European Central Bank — Card payments',
        url: 'https://www.ecb.europa.eu/paym/integration/retail/html/index.en.html',
        lastUpdated: '2026-08-16',
      },
    ],
  },
  {
    id: 'swift-cbpr',
    name: { en: 'SWIFT CBPR+', fr: 'SWIFT CBPR+' },
    operator: 'SWIFT',
    region: 'Global',
    currency: 'Multi',
    summary: {
      en: 'Cross-border payments and reporting on SWIFT ISO 20022 (MX). Different version baseline than SEPA .08.',
      fr: 'Paiements et reporting transfrontaliers sur SWIFT ISO 20022 (MX). Baseline de version différente du SEPA .08.',
    },
    usedFor: {
      en: 'Cross-border FI-to-FI customer credit transfers (pacs.008) under CBPR+.',
      fr: 'Virements client FI-to-FI transfrontaliers (pacs.008) sous CBPR+.',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pacs.009'],
    sources: [
      {
        name: 'SWIFT — ISO 20022',
        url: 'https://www.swift.com/standards/iso-20022',
        lastUpdated: '2026-08-16',
      },
    ],
  },
];

export const infrastructureById = (id: string) => INFRASTRUCTURES.find((i) => i.id === id);
