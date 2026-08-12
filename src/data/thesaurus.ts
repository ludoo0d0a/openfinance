import type { Locale } from '@/types';

export type ThesaurusCategory =
  | 'concept'
  | 'regulation'
  | 'message'
  | 'code'
  | 'scheme';

export interface ThesaurusLink {
  label: string;
  href: string;
}

export interface ThesaurusEntry {
  id: string;
  /** Canonical short form (often an acronym), shown as the heading. */
  term: string;
  /** Expanded name in each locale */
  name: Record<Locale, string>;
  aliases: Record<Locale, string[]>;
  category: ThesaurusCategory;
  definition: Record<Locale, string>;
  seeAlso?: string[];
  links?: ThesaurusLink[];
}

/**
 * Payments / Open Finance glossary. English is the working language of the
 * catalog; French names and definitions sit on the same entries.
 */
export const THESAURUS: ThesaurusEntry[] = [
  {
    id: 'vop',
    term: 'VoP',
    name: {
      en: 'Verification of Payee',
      fr: 'Vérification du bénéficiaire',
    },
    aliases: {
      en: ['Verification of Payee', 'Confirmation of Payee', 'CoP', 'payee check', 'name/IBAN check'],
      fr: [
        'Vérification du bénéficiaire',
        'Confirmation du bénéficiaire',
        'contrôle du bénéficiaire',
        'contrôle nom/IBAN',
        'CoP',
      ],
    },
    category: 'concept',
    definition: {
      en:
        'Pre-flight check that the payee name typed by the PSU matches the account holder of the destination IBAN, before a credit transfer is authorised. Under the Instant Payments Regulation it is mandatory for euro credit transfers. Outcomes are match (MTCH), close match (CMTC) or no match (NMTC), carried on acmt.023 / acmt.024.',
      fr:
        'Contrôle préalable vérifiant que le nom du bénéficiaire saisi par le PSU correspond au titulaire du compte de l’IBAN destinataire, avant l’autorisation d’un virement. Obligatoire pour les virements en euro au titre du règlement sur les paiements instantanés. Résultats : correspondance (MTCH), correspondance proche (CMTC) ou aucune correspondance (NMTC), portés par acmt.023 / acmt.024.',
    },
    seeAlso: ['cop', 'mtch', 'cmtc', 'nmtc', 'acmt-023', 'acmt-024', 'ipr'],
    links: [
      { label: 'Flow: VoP', href: '/flows/vop-check' },
      { label: 'Flow: SCT Inst + VoP', href: '/flows/sct-inst-vop' },
      { label: 'acmt.023', href: '/messages/acmt.023' },
      { label: 'acmt.024', href: '/messages/acmt.024' },
    ],
  },
  {
    id: 'cop',
    term: 'CoP',
    name: {
      en: 'Confirmation of Payee',
      fr: 'Confirmation du bénéficiaire',
    },
    aliases: {
      en: ['Confirmation of Payee', 'UK CoP'],
      fr: ['Confirmation du bénéficiaire', 'CoP UK'],
    },
    category: 'concept',
    definition: {
      en:
        'UK Open Banking / Pay.UK name-check service that inspired euro-area Verification of Payee. Same idea (match name to account) on different rails and messaging. In EU material prefer the term VoP.',
      fr:
        'Service britannique Open Banking / Pay.UK de contrôle du nom, dont s’inspire la Verification of Payee en zone euro. Même idée (apparier nom et compte) sur d’autres rails et messages. Dans les textes UE, préférer le terme VoP.',
    },
    seeAlso: ['vop'],
  },
  {
    id: 'ipr',
    term: 'IPR',
    name: {
      en: 'Instant Payments Regulation',
      fr: 'Règlement sur les paiements instantanés',
    },
    aliases: {
      en: ['Instant Payments Regulation', 'IP Regulation', 'Regulation (EU) 2024/886'],
      fr: ['Règlement paiements instantanés', 'règlement IP', 'règlement (UE) 2024/886'],
    },
    category: 'regulation',
    definition: {
      en:
        'EU regulation that makes euro instant credit transfers the default path: reachability, fee parity with standard SCT, and mandatory Verification of Payee before the transfer leaves. SCT Inst settlement remains ≤10 seconds end-to-end.',
      fr:
        'Règlement de l’UE qui fait du virement euro instantané le parcours par défaut : joignabilité, parité tarifaire avec le SCT standard, et Verification of Payee obligatoire avant le départ du virement. Le règlement SCT Inst reste ≤10 secondes de bout en bout.',
    },
    seeAlso: ['vop', 'sct-inst', 'ip'],
    links: [
      { label: 'SCT Inst standard', href: '/standards/sct-inst' },
      { label: 'SCT Inst happy path', href: '/flows/sct-inst-happy-path' },
    ],
  },
  {
    id: 'acmt-023',
    term: 'acmt.023',
    name: {
      en: 'Identification Verification Request',
      fr: 'Demande de vérification d’identité',
    },
    aliases: {
      en: ['acmt.023', 'VoP request'],
      fr: ['acmt.023', 'demande VoP'],
    },
    category: 'message',
    definition: {
      en:
        'ISO 20022 message that carries the Verification of Payee request: the payee name as typed by the PSU and the IBAN to check. Do not normalise the name before sending — that defeats the check.',
      fr:
        'Message ISO 20022 portant la demande de Verification of Payee : le nom du bénéficiaire tel que saisi par le PSU et l’IBAN à contrôler. Ne normalisez pas le nom avant envoi — cela annule l’intérêt du contrôle.',
    },
    seeAlso: ['vop', 'acmt-024'],
    links: [
      { label: 'Message acmt.023', href: '/messages/acmt.023' },
      { label: 'Sample', href: '/samples/acmt-023-vop' },
    ],
  },
  {
    id: 'acmt-024',
    term: 'acmt.024',
    name: {
      en: 'Identification Verification Report',
      fr: 'Rapport de vérification d’identité',
    },
    aliases: {
      en: ['acmt.024', 'VoP report', 'VoP response'],
      fr: ['acmt.024', 'rapport VoP', 'réponse VoP'],
    },
    category: 'message',
    definition: {
      en:
        'ISO 20022 answer to a VoP request. Carries MTCH, CMTC (with the suggested legal name) or NMTC. Close-match UX must show the suggested name; no-match requires explicit PSU risk acceptance.',
      fr:
        'Réponse ISO 20022 à une demande VoP. Porte MTCH, CMTC (avec le nom légal suggéré) ou NMTC. Sur close-match, l’UX doit afficher le nom suggéré ; sur no-match, le PSU doit accepter explicitement le risque.',
    },
    seeAlso: ['vop', 'acmt-023', 'mtch', 'cmtc', 'nmtc'],
    links: [
      { label: 'Message acmt.024', href: '/messages/acmt.024' },
      { label: 'Sample', href: '/samples/acmt-024-vop-report' },
    ],
  },
  {
    id: 'mtch',
    term: 'MTCH',
    name: {
      en: 'Match',
      fr: 'Correspondance',
    },
    aliases: {
      en: ['match', 'VoP match'],
      fr: ['match', 'correspondance VoP'],
    },
    category: 'code',
    definition: {
      en: 'VoP outcome: the typed payee name matches the account holder. Safe to proceed with the credit transfer.',
      fr: 'Résultat VoP : le nom saisi correspond au titulaire du compte. On peut poursuivre le virement en sécurité.',
    },
    seeAlso: ['vop', 'cmtc', 'nmtc'],
    links: [{ label: 'Code MTCH', href: '/codes?q=MTCH' }],
  },
  {
    id: 'cmtc',
    term: 'CMTC',
    name: {
      en: 'Close match',
      fr: 'Correspondance proche',
    },
    aliases: {
      en: ['close match', 'CMTC'],
      fr: ['correspondance proche', 'quasi-correspondance', 'CMTC'],
    },
    category: 'code',
    definition: {
      en:
        'VoP outcome: not an exact match, but a close one. The report returns the suggested legal name. The PSU must see it and confirm before the payment continues.',
      fr:
        'Résultat VoP : pas une correspondance exacte, mais proche. Le rapport renvoie le nom légal suggéré. Le PSU doit le voir et confirmer avant de poursuivre le paiement.',
    },
    seeAlso: ['vop', 'mtch', 'nmtc'],
    links: [{ label: 'Code CMTC', href: '/codes?q=CMTC' }],
  },
  {
    id: 'nmtc',
    term: 'NMTC',
    name: {
      en: 'No match',
      fr: 'Aucune correspondance',
    },
    aliases: {
      en: ['no match', 'mismatch', 'NMTC'],
      fr: ['aucune correspondance', 'non-correspondance', 'mismatch', 'NMTC'],
    },
    category: 'code',
    definition: {
      en:
        'VoP outcome: the name does not match the account. The PSU may still proceed after an explicit risk acceptance; log that consent for liability.',
      fr:
        'Résultat VoP : le nom ne correspond pas au compte. Le PSU peut quand même continuer après acceptation explicite du risque ; journalisez ce consentement pour la responsabilité.',
    },
    seeAlso: ['vop', 'mtch', 'cmtc'],
    links: [{ label: 'Code NMTC', href: '/codes?q=NMTC' }],
  },
  {
    id: 'sct-inst',
    term: 'SCT Inst',
    name: {
      en: 'SEPA Instant Credit Transfer',
      fr: 'Virement SEPA instantané',
    },
    aliases: {
      en: ['SCT Instant', 'instant SEPA', 'INST'],
      fr: ['SCT Instant', 'SEPA Instant', 'virement instantané', 'INST'],
    },
    category: 'scheme',
    definition: {
      en:
        'Euro instant credit transfer scheme: funds available in ≤10 seconds, 24/7. Clearing via TIPS, RT1 or equivalent with Local Instrument INST on pacs.008. IPR pairs it with mandatory VoP.',
      fr:
        'Schéma de virement euro instantané : fonds disponibles en ≤10 secondes, 24/7. Compensation via TIPS, RT1 ou équivalent avec Local Instrument INST sur pacs.008. L’IPR l’associe à une VoP obligatoire.',
    },
    seeAlso: ['vop', 'ipr', 'ip', 'wero'],
    links: [
      { label: 'Standard', href: '/standards/sct-inst' },
      { label: 'Happy path', href: '/flows/sct-inst-happy-path' },
    ],
  },
  {
    id: 'ip',
    term: 'IP',
    name: {
      en: 'Instant Payment',
      fr: 'Paiement instantané',
    },
    aliases: {
      en: [
        'Instant Payment',
        'instant payments',
        'real-time payment',
        'RTP',
        'INST',
        'SCT Inst',
        'SIC IP',
      ],
      fr: [
        'paiement instantané',
        'paiements instantanés',
        'virement instantané',
        'temps réel',
        'INST',
        'SCT Inst',
        'SIC IP',
      ],
    },
    category: 'concept',
    definition: {
      en:
        'Umbrella term for credit transfers that settle in seconds, 24/7, with immediate funds availability — not next-batch ACH. In the euro area that is usually SCT Inst (TIPS / RT1); in Switzerland SIC IP for CHF. IPR pushes euro IP as the default path and pairs it with VoP.',
      fr:
        'Terme générique pour les virements qui se règlent en secondes, 24/7, avec disponibilité immédiate des fonds — pas le prochain lot ACH. En zone euro, c’est en général le SCT Inst (TIPS / RT1) ; en Suisse, le SIC IP pour le CHF. L’IPR fait de l’IP euro le parcours par défaut et l’associe à la VoP.',
    },
    seeAlso: ['sct-inst', 'ipr', 'wero', 'payconiq'],
    links: [
      { label: 'SCT Inst', href: '/standards/sct-inst' },
      { label: 'SIC IP flow', href: '/flows/sic-ip-instant' },
      { label: 'SCT Inst happy path', href: '/flows/sct-inst-happy-path' },
    ],
  },
  {
    id: 'wero',
    term: 'Wero',
    name: {
      en: 'Wero (European Payments Initiative)',
      fr: 'Wero (European Payments Initiative)',
    },
    aliases: {
      en: ['Wero', 'EPI', 'European Payments Initiative', 'EPI wallet'],
      fr: ['Wero', 'EPI', 'European Payments Initiative', 'portefeuille EPI'],
    },
    category: 'scheme',
    definition: {
      en:
        'Pan-European account-to-account retail scheme from the European Payments Initiative (EPI). The wallet UX (proxy alias, merchant intent, status) sits on top; settlement still lands on instant rails such as SCT Inst. Debug both the scheme status and the underlying pacs.002.',
      fr:
        'Schéma de paiement retail pan-européen compte-à-compte de l’European Payments Initiative (EPI). L’UX wallet (alias proxy, intent commerçant, statut) est au-dessus ; le règlement reste sur des rails instantanés tels que SCT Inst. Déboguez à la fois le statut schéma et le pacs.002 sous-jacent.',
    },
    seeAlso: ['ip', 'sct-inst', 'payconiq'],
    links: [
      { label: 'Standard', href: '/standards/wero' },
      { label: 'Wero A2A flow', href: '/flows/wero-a2a-payment' },
      { label: 'Sample intent', href: '/samples/wero-payment-create' },
    ],
  },
  {
    id: 'payconiq',
    term: 'Payconiq',
    name: {
      en: 'Payconiq',
      fr: 'Payconiq',
    },
    aliases: {
      en: ['Payconiq', 'Payconiq by Bancontact', 'Bancontact Payconiq', 'PQ'],
      fr: ['Payconiq', 'Payconiq by Bancontact', 'Bancontact Payconiq', 'PQ'],
    },
    category: 'scheme',
    definition: {
      en:
        'Benelux mobile / QR account-to-account payment brand (Belgium and Luxembourg; historically also the Netherlands). Often seen as Payconiq by Bancontact. PSU scans or opens a deep link; money moves as an A2A debit/credit rather than card rails. Overlaps the same instant / wallet space as Wero in the EPI story.',
      fr:
        'Marque de paiement mobile / QR compte-à-compte du Benelux (Belgique et Luxembourg ; historiquement aussi les Pays-Bas). Souvent présentée comme Payconiq by Bancontact. Le PSU scanne ou ouvre un deep link ; l’argent circule en débit/crédit A2A plutôt que sur des rails carte. Chevauche l’espace instantané / wallet de Wero dans le récit EPI.',
    },
    seeAlso: ['wero', 'ip', 'sct-inst'],
    links: [{ label: 'Interop map', href: '/map' }],
  },
];

export const THESAURUS_CATEGORY_LABELS: Record<ThesaurusCategory, Record<Locale, string>> = {
  concept: { en: 'Concept', fr: 'Concept' },
  regulation: { en: 'Regulation', fr: 'Réglementation' },
  message: { en: 'Message', fr: 'Message' },
  code: { en: 'Code', fr: 'Code' },
  scheme: { en: 'Scheme', fr: 'Schéma' },
};

export function thesaurusById(id: string): ThesaurusEntry | undefined {
  return THESAURUS.find((e) => e.id === id);
}

export function localizeThesaurusEntry(entry: ThesaurusEntry, locale: Locale) {
  return {
    ...entry,
    displayName: entry.name[locale] ?? entry.name.en,
    displayDefinition: entry.definition[locale] ?? entry.definition.en,
    displayAliases: entry.aliases[locale] ?? entry.aliases.en,
    categoryLabel: THESAURUS_CATEGORY_LABELS[entry.category][locale],
  };
}
