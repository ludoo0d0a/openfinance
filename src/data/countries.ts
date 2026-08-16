import type { CountryContext } from '@/types';

/** Pedagogical country contexts — cut-off, reachability, preferred CSM, local quirks. */
export const COUNTRIES: CountryContext[] = [
  {
    id: 'FR',
    name: { en: 'France', fr: 'France' },
    preferredRailId: 'tips',
    cutoffNote: {
      en: 'SCT batch cut-offs follow your bank’s STEP2 submission window (often late afternoon on TARGET days). Instant is 24/7.',
      fr: 'Les cut-offs SCT batch suivent la fenêtre STEP2 de votre banque (souvent fin d’après-midi les jours TARGET). L’instantané est 24/7.',
    },
    reachabilityNote: {
      en: 'Euro SCT / SCT Inst reachability is near-universal in SEPA. French ASPSPs are widely on TIPS and/or RT1.',
      fr: 'La joignabilité SCT / SCT Inst euro est quasi universelle en SEPA. Les ASPSP français sont largement sur TIPS et/ou RT1.',
    },
    exceptionNote: {
      en: 'STET PSD2 API is common for PISP initiation in France; clearing remains EPC ISO 20022.',
      fr: 'L’API PSD2 STET est courante pour l’initiation PISP en France ; la compensation reste ISO 20022 EPC.',
    },
  },
  {
    id: 'DE',
    name: { en: 'Germany', fr: 'Allemagne' },
    preferredRailId: 'tips',
    cutoffNote: {
      en: 'Same SEPA cut-off logic as France for batch SCT. Instant is always-on once both PSPs are reachable.',
      fr: 'Même logique de cut-off SEPA que la France pour le SCT batch. L’instantané est toujours disponible si les deux PSP sont joignables.',
    },
    reachabilityNote: {
      en: 'German banks mix TIPS and RT1. Creditor PSP reachability decides whether Instant succeeds end-to-end.',
      fr: 'Les banques allemandes mélangent TIPS et RT1. La joignabilité du PSP créancier décide si l’Instantané aboutit de bout en bout.',
    },
    exceptionNote: {
      en: 'Berlin Group XS2A is the usual open-banking face; VoP is mandatory for euro CT under IPR.',
      fr: 'Berlin Group XS2A est la face open banking habituelle ; la VoP est obligatoire pour les virements euro au titre de l’IPR.',
    },
  },
  {
    id: 'CH',
    name: { en: 'Switzerland', fr: 'Suisse' },
    preferredRailId: 'sic',
    cutoffNote: {
      en: 'SIC CHF runs on Swiss business-day windows; SIC IP is the instant CHF rail. euroSIC carries EUR for Swiss participants.',
      fr: 'SIC CHF suit les fenêtres ouvrées suisses ; SIC IP est le rail instantané CHF. euroSIC transporte l’EUR pour les participants suisses.',
    },
    reachabilityNote: {
      en: 'CHF domestic is SIC / SIC IP — not SEPA. EUR from a Swiss bank may go euroSIC rather than STEP2/TIPS.',
      fr: 'Le CHF domestique est SIC / SIC IP — pas le SEPA. L’EUR depuis une banque suisse peut passer par euroSIC plutôt que STEP2/TIPS.',
    },
    exceptionNote: {
      en: 'Swiss Payment Standards IG versions and ClrSys codes bind SIC traffic. Do not reuse SEPA INST service levels on CHF SIC.',
      fr: 'Les versions IG Swiss Payment Standards et les codes ClrSys lient le trafic SIC. Ne réutilisez pas les service levels SEPA INST sur le SIC CHF.',
    },
  },
];

export const countryById = (id: string) => COUNTRIES.find((c) => c.id === id);
