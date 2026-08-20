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

const SRC_PIX = {
  name: 'Banco Central do Brasil — Pix',
  url: 'https://www.bcb.gov.br/en/financialstability/pix',
  lastUpdated: '2026-08-20',
};

const SRC_UPI = {
  name: 'NPCI — UPI',
  url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
  lastUpdated: '2026-08-20',
};

const SRC_TRUELAYER = {
  name: 'TrueLayer',
  url: 'https://truelayer.com/',
  lastUpdated: '2026-08-20',
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
      en: 'Euro instant credit transfer checkout: the rail itself (TIPS or RT1), no proxy/wallet overlay. Funds in ≤10 seconds, 24/7, Local Instrument INST. IPR adds mandatory Verification of Payee.',
      fr: 'Checkout virement euro instantané : le rail lui-même (TIPS ou RT1), pas d’overlay proxy/wallet. Fonds en ≤10 secondes, 24/7, Local Instrument INST. L’IPR ajoute la Verification of Payee obligatoire.',
    },
    explorePaymentId: 'sepa-instant',
    sources: [SRC_EPC],
  },
  {
    id: 'wero',
    name: {
      en: 'A2A Overlay (Wero, Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay, TWINT)',
      fr: 'Overlay A2A (Wero, Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay, TWINT)',
    },
    operator: 'Bank-led scheme operators (EPI, Bancontact, Getswish, …)',
    summary: {
      en: 'Retail A2A overlay: wallet UX (intent, phone/email proxy, status) on top of an instant rail. Samples: Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Not Pix/UPI (the scheme is the rail), not SCT Inst checkout, not PISP A2A, not a digital wallet.',
      fr: 'Overlay A2A retail : UX wallet (intent, proxy téléphone/e-mail, statut) au-dessus d’un rail instantané. Exemples : Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Pas Pix/UPI (le schéma est le rail), pas le checkout SCT Inst, pas le PISP A2A, pas un wallet numérique.',
    },
    explorePaymentId: 'wero',
    sources: [SRC_EPI],
  },
  {
    id: 'instant-a2a',
    name: { en: 'Instant A2A scheme (Pix, UPI)', fr: 'Schéma A2A instantané (Pix, UPI)' },
    operator: 'Central banks / NPCI (Pix, UPI)',
    summary: {
      en: 'The instant scheme is the retail product: alias + 24/7 settlement, not an overlay on SCT Inst. Samples: Pix (BR), UPI (IN).',
      fr: 'Le schéma instantané est le produit retail : alias + règlement 24/7, pas un overlay sur SCT Inst. Exemples : Pix (BR), UPI (IN).',
    },
    explorePaymentId: 'instant-a2a',
    sources: [SRC_PIX, SRC_UPI],
  },
  {
    id: 'pisp-a2a',
    name: { en: 'PISP A2A (TrueLayer)', fr: 'PISP A2A (TrueLayer)' },
    operator: 'Open-banking TPPs (e.g. TrueLayer)',
    summary: {
      en: 'TPP initiates an A2A credit transfer via XS2A (PSD2 PIS) — not a bank-consortium overlay. Sample: TrueLayer-style pay-by-bank. Settlement is still SCT or SCT Inst at the ASPSP.',
      fr: 'Un TPP initie un virement A2A via XS2A (PIS PSD2) — pas un overlay de consortium bancaire. Exemple : pay-by-bank style TrueLayer. Le règlement reste du SCT ou SCT Inst chez l’ASPSP.',
    },
    explorePaymentId: 'pisp-a2a',
    sources: [SRC_TRUELAYER],
  },
  {
    id: 'paypal',
    name: {
      en: 'Digital Wallet (PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay)',
      fr: 'Wallet numérique (PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay)',
    },
    operator: 'Wallet providers (PayPal, Apple, Google, Alipay, Tencent)',
    summary: {
      en: 'Third-party digital wallet / PSP. The merchant sees a PSP or a card token — not an A2A overlay. Samples: PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay. Funding may hit a card scheme, bank account, or wallet balance; merchant payout is often a later credit transfer.',
      fr: 'Wallet / PSP tiers. Le commerçant voit un PSP ou un jeton carte — pas un overlay A2A. Exemples : PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay. Le funding peut taper un schéma carte, un compte ou le solde wallet ; le paiement commerçant est souvent un virement plus tard.',
    },
    explorePaymentId: 'paypal',
    sources: [SRC_PAYPAL],
  },
  {
    id: 'curve',
    name: { en: 'Card Overlay (Curve, Privacy.com)', fr: 'Overlay carte (Curve, Privacy.com)' },
    operator: 'Card overlay issuers (Curve, Privacy.com)',
    summary: {
      en: 'Third-party card overlay scheme (e.g. Curve, Privacy.com): issues a card PAN in front of the payer’s existing cards. The merchant authorizes the overlay PAN; the overlay then authorizes the underlying card (card-on-card).',
      fr: 'Schéma d’overlay carte tiers (ex. Curve, Privacy.com) : émet un PAN carte devant les cartes existantes du payeur. Le commerçant autorise le PAN d’overlay ; l’overlay autorise ensuite la carte sous-jacente (carte-sur-carte).',
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
];

export const schemeById = (id: string) => SCHEMES.find((s) => s.id === id);
