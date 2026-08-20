import type { Scheme } from '@/types';

const SRC_EPC = {
  name: 'European Payments Council',
  url: 'https://www.europeanpaymentscouncil.eu/',
  lastUpdated: '2026-08-16',
};

const SRC_EPI = {
  name: 'EPI / Wero',
  url: 'https://wero-wallet.eu/',
  lastUpdated: '2026-08-16',
};

const SRC_SWIFT = {
  name: 'SWIFT',
  url: 'https://www.swift.com/standards/iso-20022',
  lastUpdated: '2026-08-16',
};

const SRC_PAYPAL = {
  name: 'PayPal',
  url: 'https://www.paypal.com/us/digital-wallet/how-paypal-works',
  lastUpdated: '2026-08-18',
};

const SRC_CURVE = {
  name: 'Curve',
  url: 'https://www.curve.com/en-gb/how-it-works',
  lastUpdated: '2026-08-18',
};

const SRC_SIX = {
  name: 'SIX Interbank Clearing',
  url: 'https://www.six-group.com/en/products-services/banking-services/interbank-clearing/sic.html',
  lastUpdated: '2026-08-16',
};

export const SCHEMES: Scheme[] = [
  {
    id: 'sct',
    name: { en: 'SEPA Credit Transfer', fr: 'Virement SEPA' },
    operator: 'European Payments Council',
    summary: {
      en: 'EPC scheme for non-urgent euro credit transfers. Typical clearing on STEP2; Local Instrument is not INST.',
      fr: 'Schéma EPC de virement euro non urgent. Compensation typique sur STEP2 ; Local Instrument n’est pas INST.',
    },
    explorePaymentId: 'sepa-credit-transfer',
    sources: [SRC_EPC],
  },
  {
    id: 'sct-inst',
    name: { en: 'SEPA Instant Credit Transfer', fr: 'Virement SEPA instantané' },
    operator: 'European Payments Council',
    summary: {
      en: 'Euro instant credit transfer: funds available in ≤10 seconds, 24/7, Local Instrument INST, clearing via TIPS or RT1. IPR adds mandatory Verification of Payee.',
      fr: 'Virement euro instantané : fonds disponibles en ≤10 secondes, 24/7, Local Instrument INST, compensation via TIPS ou RT1. L’IPR ajoute la Verification of Payee obligatoire.',
    },
    explorePaymentId: 'sepa-instant',
    sources: [SRC_EPC],
  },
  {
    id: 'wero',
    name: { en: 'Wero', fr: 'Wero' },
    operator: 'EPI Company',
    summary: {
      en: 'European account-to-account scheme. The customer sees a wallet; settlement is typically SCT Instant on TIPS or RT1.',
      fr: 'Schéma européen compte-à-compte. Le client voit un wallet ; le règlement est en général du SCT Instant sur TIPS ou RT1.',
    },
    explorePaymentId: 'wero',
    sources: [SRC_EPI],
  },
  {
    id: 'paypal',
    name: { en: 'PayPal', fr: 'PayPal' },
    operator: 'PayPal',
    summary: {
      en: 'Third-party wallet / PSP. The merchant sees PayPal as acquirer of record; funding may still hit a card scheme, a bank account or the PayPal balance. Merchant payout is often a later credit transfer.',
      fr: 'Wallet / PSP tiers. Le commerçant voit PayPal comme acquéreur de record ; le funding peut quand même taper un schéma carte, un compte ou le solde PayPal. Le paiement commerçant est souvent un virement plus tard.',
    },
    explorePaymentId: 'paypal',
    sources: [SRC_PAYPAL],
  },
  {
    id: 'curve',
    name: { en: 'Curve', fr: 'Curve' },
    operator: 'Curve',
    summary: {
      en: 'Third-party card overlay: Curve issues a Mastercard PAN in front of the payer’s existing cards. The merchant authorizes Curve; Curve then authorizes the underlying card (card-on-card).',
      fr: 'Overlay carte tiers : Curve émet un PAN Mastercard devant les cartes existantes du payeur. Le commerçant autorise Curve ; Curve autorise ensuite la carte sous-jacente (carte-sur-carte).',
    },
    explorePaymentId: 'curve',
    sources: [SRC_CURVE],
  },
  {
    id: 'sdd',
    name: { en: 'SEPA Direct Debit', fr: 'Prélèvement SEPA' },
    operator: 'European Payments Council',
    summary: {
      en: 'EPC schemes for euro direct debits (Core / B2B). Creditor initiates with pain.008; R-transactions follow mandate rules.',
      fr: 'Schémas EPC de prélèvement euro (Core / B2B). Le créancier initie avec pain.008 ; les R-transactions suivent les règles de mandat.',
    },
    explorePaymentId: 'sepa-direct-debit',
    sources: [SRC_EPC],
  },
  {
    id: 'card',
    name: { en: 'Card payment', fr: 'Paiement par carte' },
    operator: 'Card schemes',
    summary: {
      en: 'Four-party card model: authorization, clearing, settlement. Distinct vocabulary from ISO 20022 pacs.',
      fr: 'Modèle carte à quatre parties : autorisation, compensation, règlement. Vocabulaire distinct des pacs ISO 20022.',
    },
    explorePaymentId: 'card-payment',
    sources: [SRC_EPC],
  },
  {
    id: 'cbpr-plus',
    name: { en: 'CBPR+', fr: 'CBPR+' },
    operator: 'SWIFT',
    summary: {
      en: 'Cross-border payments and reporting on SWIFT ISO 20022. Version baselines differ from SEPA usage guidelines.',
      fr: 'Paiements et reporting transfrontaliers sur SWIFT ISO 20022. Les baselines de version diffèrent des usage guidelines SEPA.',
    },
    explorePaymentId: 'swift-credit-transfer',
    sources: [SRC_SWIFT],
  },
  {
    id: 'sic-ch',
    name: { en: 'SIC Payment Scheme', fr: 'Schéma de paiement SIC' },
    operator: 'SIX / SNB',
    summary: {
      en: 'Swiss Interbank Clearing scheme for domestic CHF payments, governing both regular RTGS credit transfers and sub-10s instant payments (SIC IP).',
      fr: 'Schéma Swiss Interbank Clearing pour les paiements CHF domestiques, régissant à la fois les virements RTGS réguliers et les paiements instantanés <10s (SIC IP).',
    },
    explorePaymentId: 'swiss-credit-transfer',
    sources: [SRC_SIX],
  },
];

export const schemeById = (id: string) => SCHEMES.find((s) => s.id === id);
