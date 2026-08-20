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
      en: 'TARGET Instant Payment Settlement: 24/7/365 instant settlement in central-bank money. Separate from RT1.',
      fr: 'TARGET Instant Payment Settlement : règlement instantané 24/7/365 en monnaie de banque centrale. Distinct de RT1.',
    },
    usedFor: {
      en: 'SEPA Instant when banks clear on TIPS (not RT1).',
      fr: 'SEPA Instant lorsque les banques compensent sur TIPS (pas RT1).',
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
      en: 'EBA Clearing instant CSM. Alternative to TIPS for SCT Inst — keep the two names separate.',
      fr: 'CSM instantané EBA Clearing. Alternative à TIPS pour le SCT Inst — gardez les deux noms distincts.',
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
    name: { en: 'A2A overlay platform', fr: 'Plateforme overlay A2A' },
    operator: 'Scheme operators (e.g. EPI / Wero)',
    region: 'Europe',
    currency: 'EUR',
    summary: {
      en: 'Retail A2A overlay: payment intent, proxy (phone/email → IBAN), then settlement on instant rails. Wero is the sample; Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay and TWINT follow the same split.',
      fr: 'Overlay A2A retail : intention de paiement, proxy (téléphone/e-mail → IBAN), puis règlement sur rails instantanés. Wero est l’exemple ; Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay et TWINT suivent la même séparation.',
    },
    usedFor: {
      en: 'Retail A2A checkout and P2P where the UX is the overlay scheme and money still moves as an instant credit transfer (SCT Inst in the euro area).',
      fr: 'Paiement A2A retail et P2P dont l’UX est le schéma overlay, l’argent circulant toujours en virement instantané (SCT Inst en zone euro).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002'],
    mapFlowHref: '/flows/wero-a2a-payment',
    sources: [SRC_EPI],
  },
  {
    id: 'domestic-instant',
    name: { en: 'Domestic instant rail (Pix, UPI)', fr: 'Rail instantané domestique (Pix, UPI)' },
    operator: 'Central banks / NPCI',
    region: 'BR / IN',
    currency: 'BRL / INR',
    summary: {
      en: 'National 24/7 instant rails where the scheme is the product (Pix SPI, UPI), not an overlay on SCT Inst.',
      fr: 'Rails instantanés nationaux 24/7 où le schéma est le produit (Pix SPI, UPI), pas un overlay sur SCT Inst.',
    },
    usedFor: {
      en: 'Alias-addressed retail A2A in Brazil (Pix) and India (UPI).',
      fr: 'A2A retail adressé par alias au Brésil (Pix) et en Inde (UPI).',
    },
    relatedMessageShorts: [],
    sources: [
      {
        name: 'Banco Central do Brasil — Pix',
        url: 'https://www.bcb.gov.br/en/financialstability/pix',
        lastUpdated: '2026-08-20',
      },
      {
        name: 'NPCI — UPI',
        url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
        lastUpdated: '2026-08-20',
      },
    ],
  },
  {
    id: 'sic',
    name: { en: 'SIC', fr: 'SIC' },
    operator: 'SIX',
    region: 'Switzerland',
    currency: 'CHF',
    summary: {
      en: 'Swiss Interbank Clearing for CHF. Domestic Swiss Payment Standards, not SEPA.',
      fr: 'Compensation interbancaire suisse pour le CHF. Swiss Payment Standards domestiques, pas le SEPA.',
    },
    usedFor: {
      en: 'Domestic CHF credit transfers (batch SIC and SIC Instant).',
      fr: 'Virements CHF domestiques (SIC de lot et SIC Instant).',
    },
    relatedMessageShorts: ['pacs.008', 'pacs.002', 'pain.001'],
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
