import { g, type GlossaryEntry } from './glossaryTypes';

/** Authored payments / Open Banking / Open Finance terms (ISO messages and codes are merged in `glossary.ts`). */
export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  g('vop', 'VoP', 'concept', { en: 'Verification of Payee', fr: 'Vérification du bénéficiaire' }, {
    en: 'Pre-flight check that the payee name typed by the PSU matches the account holder of the destination IBAN, before a credit transfer is authorised. Under the Instant Payments Regulation it is mandatory for euro credit transfers. Outcomes are match (MTCH), close match (CMTC) or no match (NMTC), carried on acmt.023 / acmt.024.',
    fr: 'Contrôle préalable vérifiant que le nom du bénéficiaire saisi par le PSU correspond au titulaire du compte de l’IBAN destinataire, avant l’autorisation d’un virement. Obligatoire pour les virements en euro au titre du règlement sur les paiements instantanés. Résultats : correspondance (MTCH), correspondance proche (CMTC) ou aucune correspondance (NMTC), portés par acmt.023 / acmt.024.',
  }, {
    aliases: {
      en: ['Verification of Payee', 'Confirmation of Payee', 'CoP', 'payee check', 'name/IBAN check', 'IBAN-NB'],
      fr: ['Vérification du bénéficiaire', 'Confirmation du bénéficiaire', 'contrôle nom/IBAN', 'CoP', 'IBAN-NB'],
    },
    seeAlso: ['cop', 'iban-nb', 'mtch', 'cmtc', 'nmtc', 'acmt-023', 'acmt-024', 'ipr', 'iban'],
    links: [
      { label: 'Flow: VoP', href: '/flows/vop-check' },
      { label: 'Flow: SCT Inst + VoP', href: '/flows/sct-inst-vop' },
      { label: 'acmt.023', href: '/messages/acmt.023' },
      { label: 'acmt.024', href: '/messages/acmt.024' },
    ],
    sources: ['konsentus'],
  }),
  g('cop', 'CoP', 'concept', { en: 'Confirmation of Payee', fr: 'Confirmation du bénéficiaire' }, {
    en: 'UK Open Banking / Pay.UK name-check service that inspired euro-area Verification of Payee. Same idea (match name to account) on different rails and messaging. In EU material prefer the term VoP.',
    fr: 'Service britannique Open Banking / Pay.UK de contrôle du nom, dont s’inspire la Verification of Payee en zone euro. Même idée (apparier nom et compte) sur d’autres rails et messages. Dans les textes UE, préférer le terme VoP.',
  }, {
    aliases: { en: ['Confirmation of Payee', 'UK CoP'], fr: ['Confirmation du bénéficiaire', 'CoP UK'] },
    seeAlso: ['vop', 'open-banking'],
    sources: ['ukob'],
  }),
  g('ipr', 'IPR', 'regulation', { en: 'Instant Payments Regulation', fr: 'Règlement sur les paiements instantanés' }, {
    en: 'EU regulation (EU) 2024/886 that makes euro instant credit transfers the default path: reachability, fee parity with standard SCT, and mandatory Verification of Payee before the transfer leaves. SCT Inst settlement remains ≤10 seconds end-to-end.',
    fr: 'Règlement (UE) 2024/886 qui fait du virement euro instantané le parcours par défaut : joignabilité, parité tarifaire avec le SCT standard, et Verification of Payee obligatoire avant le départ du virement. Le règlement SCT Inst reste ≤10 secondes de bout en bout.',
  }, {
    aliases: { en: ['Instant Payments Regulation', 'IP Regulation', 'Regulation (EU) 2024/886'], fr: ['Règlement paiements instantanés', 'règlement (UE) 2024/886'] },
    seeAlso: ['vop', 'sct-inst', 'ip', 'sct', 'sepa'],
    links: [
      { label: 'SCT Inst standard', href: '/standards/sct-inst' },
      { label: 'SCT Inst happy path', href: '/flows/sct-inst-happy-path' },
    ],
  }),
  g('acmt-023', 'acmt.023', 'message', { en: 'Identification Verification Request', fr: 'Demande de vérification d’identité' }, {
    en: 'ISO 20022 message that carries the Verification of Payee request: the payee name as typed by the PSU and the IBAN to check. Do not normalise the name before sending — that defeats the check.',
    fr: 'Message ISO 20022 portant la demande de Verification of Payee : le nom du bénéficiaire tel que saisi par le PSU et l’IBAN à contrôler. Ne normalisez pas le nom avant envoi — cela annule l’intérêt du contrôle.',
  }, {
    aliases: { en: ['acmt.023', 'VoP request'], fr: ['acmt.023', 'demande VoP'] },
    seeAlso: ['vop', 'acmt-024', 'acmt', 'iso-20022'],
    links: [
      { label: 'Message acmt.023', href: '/messages/acmt.023' },
      { label: 'Sample', href: '/samples/acmt-023-vop' },
    ],
  }),
  g('acmt-024', 'acmt.024', 'message', { en: 'Identification Verification Report', fr: 'Rapport de vérification d’identité' }, {
    en: 'ISO 20022 answer to a VoP request. Carries MTCH, CMTC (with the suggested legal name) or NMTC. Close-match UX must show the suggested name; no-match requires explicit PSU risk acceptance.',
    fr: 'Réponse ISO 20022 à une demande VoP. Porte MTCH, CMTC (avec le nom légal suggéré) ou NMTC. Sur close-match, l’UX doit afficher le nom suggéré ; sur no-match, le PSU doit accepter explicitement le risque.',
  }, {
    aliases: { en: ['acmt.024', 'VoP report', 'VoP response'], fr: ['acmt.024', 'rapport VoP', 'réponse VoP'] },
    seeAlso: ['vop', 'acmt-023', 'mtch', 'cmtc', 'nmtc'],
    links: [
      { label: 'Message acmt.024', href: '/messages/acmt.024' },
      { label: 'Sample', href: '/samples/acmt-024-vop-report' },
    ],
  }),
  g('sct', 'SCT', 'scheme', { en: 'SEPA Credit Transfer', fr: 'Virement SEPA' }, {
    en: 'EPC scheme for non-urgent euro credit transfers between payment accounts in SEPA, on common ISO 20022 rules (typically pacs.008, Local Instrument not INST). Batch rails such as STEP2; instant variant is SCT Inst.',
    fr: 'Schéma EPC de virement euro non urgent entre comptes de paiement dans l’espace SEPA, sur des règles ISO 20022 communes (souvent pacs.008, sans Local Instrument INST). Rails de lot tels que STEP2 ; la variante instantanée est le SCT Inst.',
  }, {
    aliases: { en: ['SEPA Credit Transfer', 'SEPA CT', 'credit transfer'], fr: ['virement SEPA', 'SCT', 'virement crédit'] },
    seeAlso: ['sepa', 'sct-inst', 'sdd', 'pacs', 'step2', 'epc'],
    sources: ['konsentus'],
    links: [{ label: 'pacs.008', href: '/messages/pacs.008' }],
  }),
  g('sct-inst', 'SCT Inst', 'scheme', { en: 'SEPA Instant Credit Transfer', fr: 'Virement SEPA instantané' }, {
    en: 'Euro instant credit transfer scheme: funds available in ≤10 seconds, 24/7. Clearing via TIPS, RT1 or equivalent with Local Instrument INST on pacs.008. IPR pairs it with mandatory VoP.',
    fr: 'Schéma de virement euro instantané : fonds disponibles en ≤10 secondes, 24/7. Compensation via TIPS, RT1 ou équivalent avec Local Instrument INST sur pacs.008. L’IPR l’associe à une VoP obligatoire.',
  }, {
    aliases: { en: ['SCT Instant', 'instant SEPA', 'INST', 'SCT Inst'], fr: ['SCT Instant', 'SEPA Instant', 'virement instantané', 'INST'] },
    seeAlso: ['sct', 'sepa', 'vop', 'ipr', 'ip', 'tips', 'rt1', 'wero'],
    sources: ['konsentus'],
    links: [
      { label: 'Standard', href: '/standards/sct-inst' },
      { label: 'Happy path', href: '/flows/sct-inst-happy-path' },
    ],
  }),
  g('sdd', 'SDD', 'scheme', { en: 'SEPA Direct Debit', fr: 'Prélèvement SEPA' }, {
    en: 'EPC schemes for euro direct debits (SDD Core for consumers, SDD B2B for businesses). Customer-to-bank initiation is pain.008; R-transactions carry mandate and sequence-type rules.',
    fr: 'Schémas EPC de prélèvement euro (SDD Core pour les consommateurs, SDD B2B pour les entreprises). L’initiation client-banque est pain.008 ; les R-transactions suivent mandat et type de séquence.',
  }, {
    aliases: { en: ['SEPA Direct Debit', 'SDD Core', 'SDD B2B', 'direct debit'], fr: ['prélèvement SEPA', 'SDD Core', 'SDD B2B'] },
    seeAlso: ['sepa', 'sct', 'pain', 'epc'],
    sources: ['konsentus'],
    links: [{ label: 'pain.008', href: '/messages/pain.008' }],
  }),
  g('sepa', 'SEPA', 'scheme', { en: 'Single Euro Payments Area', fr: 'Espace unique de paiements en euros' }, {
    en: 'Harmonised euro payments area: credit transfers and direct debits run under common EPC schemes, standards and infrastructure so a cross-border euro payment is processed like a domestic one.',
    fr: 'Espace de paiements en euro harmonisé : virements et prélèvements sous schémas, normes et infrastructures EPC communs, pour qu’un paiement transfrontalier soit traité comme un paiement national.',
  }, {
    aliases: { en: ['Single Euro Payments Area', 'SEPA zone'], fr: ['espace SEPA', 'Single Euro Payments Area'] },
    seeAlso: ['sct', 'sct-inst', 'sdd', 'epc', 'tips', 'iban'],
    sources: ['konsentus'],
  }),
  g('stet', 'STET', 'scheme', { en: 'STET PSD2 API / CSM', fr: 'STET API PSD2 / CSM' }, {
    en: 'French interbank operator (Systèmes Technologiques d’Échange et de Traitement): runs CORE/STEP-like clearing and publishes the STET PSD2 API used by French ASPSPs. OAuth2 + QWAC; payment confirmation is a separate POST after SCA.',
    fr: 'Opérateur interbancaire français (Systèmes Technologiques d’Échange et de Traitement) : compensation et API PSD2 STET utilisée par les ASPSP français. OAuth2 + QWAC ; la confirmation de paiement est un POST distinct après SCA.',
  }, {
    aliases: { en: ['STET PSD2 API', 'STET CSM', 'Systèmes Technologiques d’Échange et de Traitement'], fr: ['API PSD2 STET', 'STET', 'CSM STET'] },
    seeAlso: ['xs2a', 'aspsp', 'pisp', 'aisp', 'qwac', 'oauth2'],
    links: [{ label: 'STET standard', href: '/standards/stet' }],
  }),
  g('tips', 'TIPS', 'scheme', { en: 'TARGET Instant Payment Settlement', fr: 'TARGET Instant Payment Settlement' }, {
    en: 'ECB instant settlement service in central bank money for SCT Inst. One of the CSMs that can clear a euro instant pacs.008 (alongside RT1). The 10-second scheme clock is not the TIPS hop clock.',
    fr: 'Service de règlement instantané de la BCE en monnaie banque centrale pour le SCT Inst. Un des CSM qui peuvent compenser un pacs.008 instantané euro (avec RT1). L’horloge schéma de 10 secondes n’est pas l’horloge du hop TIPS.',
  }, {
    aliases: { en: ['TARGET Instant Payment Settlement', 'TIPS CSM'], fr: ['TARGET Instant Payment Settlement', 'CSM TIPS'] },
    seeAlso: ['sct-inst', 'rt1', 'target2', 'csm', 'ecb', 'ip'],
    links: [{ label: 'SCT Inst', href: '/standards/sct-inst' }],
  }),
  g('rt1', 'RT1', 'scheme', { en: 'EBA Clearing RT1', fr: 'RT1 (EBA Clearing)' }, {
    en: 'EBA Clearing’s pan-European instant payment CSM for SCT Inst, settling in central-bank money. Alternative (or complement) to TIPS depending on the participant’s reachability.',
    fr: 'CSM paneuropéen de paiements instantanés d’EBA Clearing pour le SCT Inst, en monnaie banque centrale. Alternative (ou complément) à TIPS selon la joignabilité du participant.',
  }, {
    aliases: { en: ['EBA Clearing RT1', 'RT1 CSM'], fr: ['RT1 EBA Clearing', 'CSM RT1'] },
    seeAlso: ['tips', 'sct-inst', 'csm', 'eba'],
  }),
  g('step2', 'STEP2', 'scheme', { en: 'STEP2', fr: 'STEP2' }, {
    en: 'EBA Clearing’s mass-payment CSM for SEPA batch credit transfers and direct debits (not instant). Standard SCT often lands here rather than TIPS/RT1.',
    fr: 'CSM de paiements de masse d’EBA Clearing pour virements et prélèvements SEPA par lots (non instantané). Le SCT standard y aboutit souvent plutôt que sur TIPS/RT1.',
  }, {
    aliases: { en: ['STEP2 CSM', 'EBA Clearing STEP2'], fr: ['CSM STEP2'] },
    seeAlso: ['sct', 'sepa', 'csm', 'tips'],
  }),
  g('piis', 'PIIS', 'concept', { en: 'Payment Instrument Issuer Service', fr: 'Service d’émetteur d’instrument de paiement' }, {
    en: 'Berlin Group name for funds confirmation: a CBPII asks the ASPSP whether a given amount is available on the PSU’s account, without seeing the balance. Role in eIDAS certificates: PSP_IC.',
    fr: 'Nom Berlin Group de la confirmation de fonds : un CBPII demande à l’ASPSP si un montant est disponible sur le compte du PSU, sans voir le solde. Rôle eIDAS : PSP_IC.',
  }, {
    aliases: {
      en: ['Payment Instrument Issuer Service', 'funds confirmation', 'CAF', 'Confirmation of Funds', 'PSP_IC'],
      fr: ['confirmation de fonds', 'CAF', 'PIIS', 'PSP_IC'],
    },
    seeAlso: ['cbpii', 'ais', 'pis', 'aspsp', 'berlin-group', 'caf'],
    sources: ['ukob', 'konsentus'],
    links: [{ label: 'Berlin Group', href: '/standards/berlin-group' }],
  }),
  g('a2a', 'A2A', 'concept', { en: 'Account-to-account payment', fr: 'Paiement compte à compte' }, {
    en: 'Payment that moves funds between payment accounts (credit transfer / instant / wallet-on-instant) rather than card rails. Wero, Payconiq and SCT Inst checkout are A2A; PIIS/CBPII still often sits in front of a card.',
    fr: 'Paiement qui déplace des fonds entre comptes de paiement (virement / instantané / wallet sur instantané) plutôt que sur des rails carte. Wero, Payconiq et le checkout SCT Inst sont de l’A2A ; le PIIS/CBPII reste souvent devant une carte.',
  }, {
    aliases: { en: ['account-to-account', 'A2A payment', 'account to account'], fr: ['compte à compte', 'paiement A2A'] },
    seeAlso: ['sct-inst', 'wero', 'payconiq', 'ip', 'pis'],
    links: [{ label: 'Wero A2A flow', href: '/flows/wero-a2a-payment' }],
  }),
  g('ip', 'IP', 'concept', { en: 'Instant Payment', fr: 'Paiement instantané' }, {
    en: 'Umbrella term for credit transfers that settle in seconds, 24/7, with immediate funds availability — not next-batch ACH. In the euro area that is usually SCT Inst (TIPS / RT1); in Switzerland SIC IP for CHF. IPR pushes euro IP as the default path and pairs it with VoP.',
    fr: 'Terme générique pour les virements qui se règlent en secondes, 24/7, avec disponibilité immédiate des fonds — pas le prochain lot ACH. En zone euro, c’est en général le SCT Inst (TIPS / RT1) ; en Suisse, le SIC IP pour le CHF. L’IPR fait de l’IP euro le parcours par défaut et l’associe à la VoP.',
  }, {
    aliases: {
      en: ['Instant Payment', 'instant payments', 'real-time payment', 'RTP', 'INST', 'SCT Inst', 'SIC IP'],
      fr: ['paiement instantané', 'virement instantané', 'temps réel', 'INST', 'SCT Inst', 'SIC IP'],
    },
    seeAlso: ['sct-inst', 'ipr', 'tips', 'sic-ip', 'wero', 'payconiq', 'ach'],
    links: [
      { label: 'SCT Inst', href: '/standards/sct-inst' },
      { label: 'SIC IP flow', href: '/flows/sic-ip-instant' },
    ],
  }),
  g('wero', 'Wero', 'scheme', { en: 'Wero (European Payments Initiative)', fr: 'Wero (European Payments Initiative)' }, {
    en: 'Pan-European account-to-account retail scheme from the European Payments Initiative (EPI). The wallet UX (proxy alias, merchant intent, status) sits on top; settlement still lands on instant rails such as SCT Inst. Debug both the scheme status and the underlying pacs.002.',
    fr: 'Schéma de paiement retail pan-européen compte-à-compte de l’European Payments Initiative (EPI). L’UX wallet (alias proxy, intent commerçant, statut) est au-dessus ; le règlement reste sur des rails instantanés tels que SCT Inst. Déboguez à la fois le statut schéma et le pacs.002 sous-jacent.',
  }, {
    aliases: { en: ['Wero', 'EPI', 'European Payments Initiative', 'EPI wallet'], fr: ['Wero', 'EPI', 'European Payments Initiative', 'portefeuille EPI'] },
    seeAlso: ['a2a', 'ip', 'sct-inst', 'payconiq', 'epi'],
    links: [
      { label: 'Standard', href: '/standards/wero' },
      { label: 'Wero A2A flow', href: '/flows/wero-a2a-payment' },
    ],
  }),
  g('epi', 'EPI', 'scheme', { en: 'European Payments Initiative', fr: 'European Payments Initiative' }, {
    en: 'Bank-led initiative behind the Wero wallet / A2A scheme. EPI is the organisation; Wero is the customer brand.',
    fr: 'Initiative bancaire derrière le wallet / schéma A2A Wero. EPI est l’organisation ; Wero est la marque client.',
  }, {
    aliases: { en: ['European Payments Initiative'], fr: ['European Payments Initiative'] },
    seeAlso: ['wero', 'a2a'],
  }),
  g('payconiq', 'Payconiq', 'scheme', { en: 'Payconiq', fr: 'Payconiq' }, {
    en: 'Benelux mobile / QR account-to-account payment brand (Belgium and Luxembourg; historically also the Netherlands). Often seen as Payconiq by Bancontact. PSU scans or opens a deep link; money moves as an A2A debit/credit rather than card rails.',
    fr: 'Marque de paiement mobile / QR compte-à-compte du Benelux (Belgique et Luxembourg ; historiquement aussi les Pays-Bas). Souvent présentée comme Payconiq by Bancontact. Le PSU scanne ou ouvre un deep link ; l’argent circule en débit/crédit A2A plutôt que sur des rails carte.',
  }, {
    aliases: { en: ['Payconiq', 'Payconiq by Bancontact', 'Bancontact Payconiq', 'PQ'], fr: ['Payconiq', 'Payconiq by Bancontact', 'PQ'] },
    seeAlso: ['wero', 'a2a', 'ip', 'sct-inst'],
    links: [{ label: 'Interop map', href: '/map' }],
  }),
  g('ais', 'AIS', 'concept', { en: 'Account Information Service', fr: 'Service d’information sur les comptes' }, {
    en: 'PSD2 service that, with PSU consent, reads payment-account data (accounts, balances, transactions) held at an ASPSP. Provided by an AISP. Under FiDA the broader analogue is a FISP.',
    fr: 'Service PSD2 qui, avec le consentement du PSU, lit les données de comptes de paiement (comptes, soldes, transactions) chez un ASPSP. Fourni par un AISP. Sous FiDA, l’analogue plus large est le FISP.',
  }, {
    aliases: { en: ['Account Information Service', 'account information', 'PSP_AI'], fr: ['information sur les comptes', 'AIS', 'PSP_AI'] },
    seeAlso: ['aisp', 'pis', 'piis', 'consent', 'aspsp', 'fisp'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
  }),
  g('pis', 'PIS', 'concept', { en: 'Payment Initiation Service', fr: 'Service d’initiation de paiement' }, {
    en: 'PSD2 service that initiates a payment order on a payment account held at another PSP, at the PSU’s request. Provided by a PISP. Berlin Group path: POST /v1/payments/{product}.',
    fr: 'Service PSD2 qui initie un ordre de paiement sur un compte tenu chez un autre PSP, à la demande du PSU. Fourni par un PISP. Chemin Berlin Group : POST /v1/payments/{product}.',
  }, {
    aliases: { en: ['Payment Initiation Service', 'payment initiation', 'PSP_PI'], fr: ['initiation de paiement', 'PIS', 'PSP_PI'] },
    seeAlso: ['pisp', 'ais', 'piis', 'sct', 'sct-inst', 'a2a'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
  }),
  g('aisp', 'AISP', 'concept', { en: 'Account Information Service Provider', fr: 'Prestataire de services d’information sur les comptes' }, {
    en: 'Regulated TPP authorised to provide AIS — consolidated payment-account information from one or more ASPSPs, with explicit PSU consent. Precursor to FISP under FiDA.',
    fr: 'TPP réglementé autorisé à fournir de l’AIS — information consolidée sur des comptes de paiement auprès d’un ou plusieurs ASPSP, avec consentement explicite du PSU. Précurseur du FISP sous FiDA.',
  }, {
    aliases: { en: ['Account Information Service Provider', 'account information provider'], fr: ['prestataire d’information sur les comptes', 'AISP'] },
    seeAlso: ['ais', 'tpp', 'aspsp', 'pisp', 'fisp', 'psd2'],
    sources: ['ukob', 'konsentus', 'ravelin'],
  }),
  g('pisp', 'PISP', 'concept', { en: 'Payment Initiation Service Provider', fr: 'Prestataire de services d’initiation de paiement' }, {
    en: 'Regulated TPP authorised to initiate a payment order at the PSU’s request on an account held at another PSP.',
    fr: 'TPP réglementé autorisé à initier un ordre de paiement à la demande du PSU sur un compte tenu chez un autre PSP.',
  }, {
    aliases: { en: ['Payment Initiation Service Provider', 'payment initiation provider'], fr: ['prestataire d’initiation de paiement', 'PISP'] },
    seeAlso: ['pis', 'tpp', 'aspsp', 'aisp', 'cbpii', 'psd2'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
  }),
  g('cbpii', 'CBPII', 'concept', { en: 'Card Based Payment Instrument Issuer', fr: 'Émetteur d’instrument de paiement fondé sur une carte' }, {
    en: 'PSP that issues card-based instruments which can pull funds from a payment account at another PSP. Uses PIIS / funds confirmation. eIDAS role PSP_IC. Bundesbank calls this a third-party issuer: the card issuer is not the institution that holds the payer’s account.',
    fr: 'PSP qui émet des instruments fondés sur une carte pouvant débiter un compte de paiement chez un autre PSP. Utilise le PIIS / la confirmation de fonds. Rôle eIDAS PSP_IC. La Bundesbank parle d’émetteur tiers : l’émetteur de la carte n’est pas l’établissement qui tient le compte du payeur.',
  }, {
    aliases: {
      en: ['Card Based Payment Instrument Issuer', 'card-based payment instrument issuer', 'third-party issuer'],
      fr: ['émetteur d’instrument de paiement fondé sur une carte', 'CBPII', 'émetteur tiers'],
    },
    seeAlso: ['piis', 'psp', 'tpp', 'caf', 'third-party-issuer'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
  }),
  g('third-party-issuer', 'Third-party issuer', 'concept', { en: 'Third-party issuer', fr: 'Émetteur tiers' }, {
    en: 'Bundesbank PSD2 term for a payment-card issuer that does not hold the account to be debited. In XS2A language that is a CBPII, using PIIS / funds confirmation against the ASPSP.',
    fr: 'Terme PSD2 de la Bundesbank pour un émetteur de carte qui ne tient pas le compte à débiter. En langage XS2A, c’est un CBPII, qui utilise le PIIS / la confirmation de fonds auprès de l’ASPSP.',
  }, {
    aliases: { en: ['third party issuer', 'third-party card issuer'], fr: ['émetteur tiers', 'émetteur de carte tiers'] },
    seeAlso: ['cbpii', 'piis', 'tpp', 'aspsp'],
    sources: ['bundesbank'],
  }),
  g('aspsp', 'ASPSP', 'concept', { en: 'Account Servicing Payment Service Provider', fr: 'Prestataire de services de paiement gestionnaire de compte' }, {
    en: 'PSP that provides and maintains a payment account for the payer — typically the bank. In Open Banking it publishes Read/Write APIs so TPPs can, with consent, read data and/or initiate payments. Under FiDA it is a Data Holder.',
    fr: 'PSP qui fournit et tient un compte de paiement pour le payeur — en pratique la banque. En Open Banking il publie des API Read/Write pour que les TPP, avec consentement, lisent les données et/ou initient des paiements. Sous FiDA, c’est un Data Holder.',
  }, {
    aliases: { en: ['Account Servicing Payment Service Provider', 'account servicing PSP', 'the bank'], fr: ['PSP gestionnaire de compte', 'ASPSP', 'la banque'] },
    seeAlso: ['psp', 'tpp', 'psu', 'data-holder', 'xs2a'],
    sources: ['ukob', 'konsentus'],
  }),
  g('tpp', 'TPP', 'concept', { en: 'Third Party Provider', fr: 'Prestataire tiers' }, {
    en: 'Under PSD2: a regulated AISP, PISP and/or CBPII (Bundesbank: third-party payment service provider, including third-party issuers). Not the ASPSP holding the account. Card-acquiring material sometimes uses TPP for a processor without a merchant account (PayPal-style) — that is not the PSD2 meaning.',
    fr: 'Sous PSD2 : un AISP, PISP et/ou CBPII réglementé (Bundesbank : prestataire de paiement tiers, y compris émetteurs tiers). Pas l’ASPSP qui tient le compte. Les textes acquiring emploient parfois TPP pour un processeur sans compte commerçant (style PayPal) — ce n’est pas le sens PSD2.',
  }, {
    aliases: {
      en: ['Third Party Provider', 'third-party provider', 'third-party payment service provider', 'TPPP'],
      fr: ['prestataire tiers', 'TPP', 'prestataire de paiement tiers'],
    },
    seeAlso: ['aisp', 'pisp', 'cbpii', 'aspsp', 'tsp', 'third-party-issuer'],
    sources: ['ukob', 'konsentus', 'bundesbank', 'ravelin'],
  }),
  g('psp', 'PSP', 'concept', { en: 'Payment Service Provider', fr: 'Prestataire de services de paiement' }, {
    en: 'Entity that carries out regulated payment services — includes AISPs, PISPs, CBPIIs and ASPSPs.',
    fr: 'Entité qui fournit des services de paiement réglementés — AISP, PISP, CBPII et ASPSP.',
  }, {
    aliases: { en: ['Payment Service Provider', 'Payment Services Provider'], fr: ['prestataire de services de paiement', 'PSP'] },
    seeAlso: ['psu', 'aspsp', 'tpp', 'emi', 'psd2'],
    sources: ['ukob', 'konsentus', 'ravelin'],
  }),
  g('psu', 'PSU', 'concept', { en: 'Payment Service User', fr: 'Utilisateur de services de paiement' }, {
    en: 'Natural or legal person using a payment service as payer, payee or both. The human (or company) in the SCA and consent journey.',
    fr: 'Personne physique ou morale qui utilise un service de paiement comme payeur, bénéficiaire ou les deux. L’humain (ou la société) du parcours SCA et consentement.',
  }, {
    aliases: { en: ['Payment Service User', 'Payment Services User', 'end user', 'payer'], fr: ['utilisateur de services de paiement', 'PSU', 'payeur'] },
    seeAlso: ['psp', 'sca', 'consent', 'customer'],
    sources: ['ukob', 'konsentus'],
  }),
  g('tsp', 'TSP', 'concept', { en: 'Technical Service Provider', fr: 'Prestataire de services techniques' }, {
    en: 'Unregulated (or separately regulated) firm that helps AISPs/PISPs/ASPSPs deliver Open Banking — gateways, consent UX, hosting. Not itself a TPP unless it holds the licence.',
    fr: 'Société (souvent non agréée PSP) qui aide AISP/PISP/ASPSP à délivrer l’Open Banking — passerelles, UX de consentement, hébergement. Ce n’est pas un TPP tant qu’elle n’a pas l’agrément.',
  }, {
    aliases: { en: ['Technical Service Provider', 'technical provider'], fr: ['prestataire technique', 'TSP'] },
    seeAlso: ['tpp', 'aspsp'],
    sources: ['ukob'],
  }),
  g('caf', 'CAF', 'concept', { en: 'Confirmation of Available Funds', fr: 'Confirmation de fonds disponibles' }, {
    en: 'Funds-check API (PolishAPI name CAF; Berlin Group PIIS). Returns yes/no for an amount on an account, not the balance.',
    fr: 'API de contrôle de fonds (CAF en PolishAPI ; PIIS Berlin Group). Répond oui/non pour un montant, pas le solde.',
  }, {
    aliases: { en: ['Confirmation of Available Funds', 'funds confirmation'], fr: ['confirmation de fonds disponibles', 'CAF'] },
    seeAlso: ['piis', 'cbpii'],
  }),
  g('xs2a', 'XS2A', 'concept', { en: 'Access to Account', fr: 'Accès au compte' }, {
    en: 'PSD2 requirement that ASPSPs give TPPs access to payment accounts via dedicated interfaces. Berlin Group’s NextGenPSD2 is the usual XS2A API profile in continental Europe.',
    fr: 'Exigence PSD2 : les ASPSP donnent aux TPP l’accès aux comptes de paiement via des interfaces dédiées. NextGenPSD2 du Berlin Group est le profil XS2A usuel en Europe continentale.',
  }, {
    aliases: { en: ['Access to Account', 'NextGenPSD2', 'dedicated interface'], fr: ['accès au compte', 'XS2A', 'NextGenPSD2'] },
    seeAlso: ['berlin-group', 'psd2', 'aspsp', 'tpp'],
    links: [{ label: 'Berlin Group', href: '/standards/berlin-group' }],
  }),
  g('berlin-group', 'Berlin Group', 'scheme', { en: 'NextGenPSD2 XS2A Framework', fr: 'Cadre NextGenPSD2 XS2A' }, {
    en: 'Pan-European JSON API standard for AIS, PIS and PIIS with four SCA approaches. De facto default across DE, AT, NL, ES, the Nordics and much of CEE. Banks implement subsets — capability discovery is part of onboarding.',
    fr: 'Standard d’API JSON paneuropéen pour AIS, PIS et PIIS avec quatre approches SCA. Défaut de facto en DE, AT, NL, ES, Nordiques et une grande partie de l’Europe centrale. Les banques n’implémentent que des sous-ensembles — la découverte des capacités fait partie de l’onboarding.',
  }, {
    aliases: { en: ['NextGenPSD2', 'The Berlin Group', 'BG XS2A'], fr: ['NextGenPSD2', 'Berlin Group'] },
    seeAlso: ['xs2a', 'ais', 'pis', 'piis', 'stet'],
    links: [{ label: 'Standard', href: '/standards/berlin-group' }],
  }),
  g('open-banking', 'Open Banking', 'concept', { en: 'Open Banking', fr: 'Open Banking' }, {
    en: 'PSD2-era data access to payment accounts via APIs, with PSU consent: AIS, PIS and funds confirmation. In the UK also the CMA Order / Open Banking Limited directory and standards. Open Finance extends the same idea beyond payment accounts.',
    fr: 'Accès PSD2 aux comptes de paiement via API, avec consentement du PSU : AIS, PIS et confirmation de fonds. Au Royaume-Uni, aussi l’ordre CMA / l’annuaire et les standards d’Open Banking Limited. L’Open Finance étend l’idée au-delà des comptes de paiement.',
  }, {
    aliases: { en: ['open banking', 'Open Banking Ecosystem'], fr: ['open banking', 'écosystème Open Banking'] },
    seeAlso: ['open-finance', 'psd2', 'xs2a', 'obl', 'fida'],
    sources: ['ukob', 'konsentus'],
  }),
  g('open-finance', 'Open Finance', 'concept', { en: 'Open Finance', fr: 'Open Finance' }, {
    en: 'Extension of Open Banking-like sharing to savings, investments, pensions, insurance and other financial data. In the EU the proposed legal wrapper is FiDA; Mastercard Open Finance US is a commercial aggregation platform covering similar ground.',
    fr: 'Extension du partage de type Open Banking à l’épargne, aux investissements, retraites, assurances et autres données financières. En UE, le cadre proposé est FiDA ; Mastercard Open Finance US est une plateforme d’agrégation commerciale sur un périmètre proche.',
  }, {
    aliases: { en: ['open finance', 'financial data access'], fr: ['open finance', 'accès aux données financières'] },
    seeAlso: ['open-banking', 'fida', 'fisp', 'data-connect'],
    sources: ['ukob', 'konsentus', 'mastercard'],
  }),
  g('consent', 'Consent', 'concept', { en: 'Consent', fr: 'Consentement' }, {
    en: 'Explicit PSU permission for a TPP to access data or initiate a payment. In Berlin Group it is a resource you POST and drive through SCA; in UK OB it is an intent bound into an OAuth/OIDC request. Mastercard US calls the analogue permissioning.',
    fr: 'Permission explicite du PSU pour qu’un TPP accède aux données ou initie un paiement. Chez Berlin Group c’est une ressource POST puis SCA ; au UK OB un intent lié à OAuth/OIDC. Mastercard US parle de permissioning.',
  }, {
    aliases: { en: ['explicit consent', 'AIS consent', 'permission'], fr: ['consentement explicite', 'consentement AIS'] },
    seeAlso: ['sca', 'ais', 'permissioning', 'psd2', 'gdpr'],
    sources: ['konsentus', 'ukob', 'mastercard'],
  }),
  g('sca', 'SCA', 'concept', { en: 'Strong Customer Authentication', fr: 'Authentification forte du client' }, {
    en: 'PSD2/RTS multi-factor authentication using at least two of knowledge, possession and inherence, independent so that one breach does not compromise the others. Approaches: redirect, decoupled, embedded, OAuth2 SCA.',
    fr: 'Authentification multifactorielle PSD2/RTS utilisant au moins deux facteurs parmi connaissance, possession et inhérence, indépendants. Approches : redirect, découplé, embarqué, OAuth2 SCA.',
  }, {
    aliases: { en: ['Strong Customer Authentication', 'strong auth', '2FA (payments)'], fr: ['authentification forte', 'SCA'] },
    seeAlso: ['rts', 'psd2', '2fa', '3ds', 'psu'],
    sources: ['ukob', 'konsentus', 'bundesbank', 'ravelin'],
  }),
  g('2fa', '2FA', 'concept', { en: 'Two-Factor Authentication', fr: 'Authentification à deux facteurs' }, {
    en: 'Access granted only after two independent authentication factors. SCA is the payments-regulated form of this idea, with extra independence and confidentiality rules.',
    fr: 'Accès accordé seulement après deux facteurs d’authentification indépendants. La SCA est la forme réglementée paiements de cette idée, avec des règles d’indépendance et de confidentialité supplémentaires.',
  }, {
    aliases: { en: ['two-factor authentication', 'two factor'], fr: ['authentification à deux facteurs', 'double facteur'] },
    seeAlso: ['sca', '3ds'],
    sources: ['konsentus'],
  }),
  g('3ds', '3DS', 'concept', { en: '3-D Secure', fr: '3-D Secure' }, {
    en: 'Card-based authentication protocol (EMV 3-D Secure). Parallel to SCA on A2A rails: cards use 3DS; account-to-account uses ASPSP SCA.',
    fr: 'Protocole d’authentification carte (EMV 3-D Secure). Parallèle à la SCA sur les rails A2A : les cartes utilisent 3DS ; le compte-à-compte utilise la SCA de l’ASPSP.',
  }, {
    aliases: { en: ['3-D Secure', 'EMV 3DS', '3D Secure'], fr: ['3-D Secure', 'EMV 3DS'] },
    seeAlso: ['sca', 'cbpii', 'a2a'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('psd2', 'PSD2', 'regulation', { en: 'Second Payment Services Directive', fr: 'Deuxième directive sur les services de paiement' }, {
    en: 'Directive (EU) 2015/2366: current Open Banking regime — dedicated XS2A interfaces, TPP roles, SCA. UK implemented it via the Payment Services Regulations 2017. Successor stack is PSD3 + EU PSR.',
    fr: 'Directive (UE) 2015/2366 : régime Open Banking actuel — interfaces XS2A dédiées, rôles TPP, SCA. Le Royaume-Uni l’a transposée par les Payment Services Regulations 2017. La pile successeur est PSD3 + PSR UE.',
  }, {
    aliases: { en: ['Revised Payment Services Directive', 'Payment Services Directive 2', '2015/2366'], fr: ['DSP2', 'directive services de paiement 2'] },
    seeAlso: ['psd3', 'psr-eu', 'psr-uk', 'rts', 'xs2a', 'open-banking'],
    sources: ['ukob', 'konsentus', 'bundesbank', 'ravelin'],
  }),
  g('psd3', 'PSD3', 'regulation', { en: 'Third Payment Services Directive', fr: 'Troisième directive sur les services de paiement' }, {
    en: 'Proposed EU directive on authorisation, supervision and operation of PSPs, intended to replace the directive half of PSD2. Directly applicable rules move into the EU Payment Services Regulation (PSR).',
    fr: 'Directive UE proposée sur l’agrément, la supervision et le fonctionnement des PSP, destinée à remplacer la moitié « directive » de la PSD2. Les règles directement applicables passent dans le règlement UE sur les services de paiement (PSR).',
  }, {
    aliases: { en: ['Third Payment Services Directive', 'PSD 3'], fr: ['DSP3', 'troisième directive services de paiement'] },
    seeAlso: ['psd2', 'psr-eu', 'fida'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('psr-eu', 'PSR (EU)', 'regulation', { en: 'Payment Services Regulation (EU)', fr: 'Règlement sur les services de paiement (UE)' }, {
    en: 'Proposed EU regulation (directly applicable) that would carry API access, fraud and consumer-protection rules out of PSD2. Not the UK Payment Services Regulations 2017 — same acronym, different instrument.',
    fr: 'Règlement UE proposé (d’application directe) qui reprendrait les règles d’accès API, fraude et protection du consommateur hors de la PSD2. À ne pas confondre avec les Payment Services Regulations 2017 britanniques — même sigle, autre texte.',
  }, {
    aliases: { en: ['EU PSR', 'Payment Services Regulation', 'PSR'], fr: ['PSR UE', 'règlement services de paiement'] },
    seeAlso: ['psd2', 'psd3', 'psr-uk'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('psr-uk', 'PSR (UK)', 'regulation', { en: 'Payment Services Regulations 2017', fr: 'Payment Services Regulations 2017' }, {
    en: 'UK implementation of PSD2, including associated EBA RTS. Open Banking UK glossary uses “PSR” for this, not the later EU Payment Services Regulation.',
    fr: 'Transposition britannique de la PSD2, y compris les RTS de l’ABE. Le glossaire Open Banking UK emploie « PSR » pour ce texte, pas pour le futur règlement UE.',
  }, {
    aliases: { en: ['Payment Services Regulations', 'UK PSR', 'PSRs'], fr: ['Payment Services Regulations', 'PSR UK'] },
    seeAlso: ['psd2', 'psr-eu', 'fca', 'rts'],
    sources: ['ukob'],
  }),
  g('rts', 'RTS', 'regulation', { en: 'Regulatory Technical Standards', fr: 'Normes techniques de réglementation' }, {
    en: 'Binding technical rules under PSD (notably the SCA and common-and-secure-communication RTS). Drafted by the EBA, endorsed by the Commission.',
    fr: 'Règles techniques contraignantes au titre de la DSP (notamment SCA et communication commune et sécurisée). Rédigées par l’ABE, adoptées par la Commission.',
  }, {
    aliases: { en: ['Regulatory Technical Standards', 'EBA RTS', 'SCA RTS'], fr: ['normes techniques de réglementation', 'RTS ABE'] },
    seeAlso: ['its', 'eba', 'sca', 'psd2'],
    sources: ['ukob', 'konsentus', 'ravelin'],
  }),
  g('its', 'ITS', 'regulation', { en: 'Implementing Technical Standards', fr: 'Normes techniques d’exécution' }, {
    en: 'Legally binding technical specifications from the ESAs for harmonised implementation of PSD, FiDA and similar acts.',
    fr: 'Spécifications techniques juridiquement contraignantes des AES pour une mise en œuvre harmonisée de la DSP, de FiDA et textes proches.',
  }, {
    aliases: { en: ['Implementing Technical Standards'], fr: ['normes techniques d’exécution'] },
    seeAlso: ['rts', 'esa', 'fida'],
    sources: ['konsentus'],
  }),
  g('fida', 'FiDA', 'regulation', { en: 'Financial Data Access Regulation', fr: 'Règlement sur l’accès aux données financières' }, {
    en: 'Proposed EU Open Finance regulation: rights and duties for sharing a wider set of financial data (savings, investments, insurance, pensions) with user consent, via Financial Data Sharing Schemes.',
    fr: 'Règlement UE Open Finance proposé : droits et devoirs pour partager un ensemble plus large de données financières (épargne, investissements, assurance, retraites) avec consentement, via des schémas de partage (FDSS).',
  }, {
    aliases: { en: ['Financial Data Access', 'FiDA regulation', 'Open Finance regulation'], fr: ['accès aux données financières', 'règlement FiDA'] },
    seeAlso: ['open-finance', 'fisp', 'fdss', 'data-holder', 'psd3'],
    sources: ['konsentus'],
  }),
  g('fisp', 'FISP', 'concept', { en: 'Financial Information Service Provider', fr: 'Prestataire de services d’information financière' }, {
    en: 'FiDA data-user role: regulated entity that consumes financial data from Data Holders to power products. Broader than an AISP (not limited to payment accounts).',
    fr: 'Rôle « data user » FiDA : entité réglementée qui consomme les données des Data Holders. Plus large qu’un AISP (pas limité aux comptes de paiement).',
  }, {
    aliases: { en: ['Financial Information Service Provider'], fr: ['prestataire d’information financière'] },
    seeAlso: ['aisp', 'fida', 'data-user', 'data-holder'],
    sources: ['konsentus'],
  }),
  g('fdss', 'FDSS', 'concept', { en: 'Financial Data Sharing Scheme', fr: 'Schéma de partage de données financières' }, {
    en: 'FiDA governance wrapper: rules, accreditation, directories, interoperability, security and dispute resolution for how financial data is accessed.',
    fr: 'Cadre de gouvernance FiDA : règles, accréditation, annuaires, interopérabilité, sécurité et règlement des litiges pour l’accès aux données financières.',
  }, {
    aliases: { en: ['Financial Data Sharing Scheme', 'Data Sharing Scheme'], fr: ['schéma de partage de données financières'] },
    seeAlso: ['fida', 'scheme-operator', 'dasp'],
    sources: ['konsentus'],
  }),
  g('dasp', 'DASP', 'concept', { en: 'Data Access Service Provider', fr: 'Prestataire de services d’accès aux données' }, {
    en: 'Technical intermediary under FiDA sitting between Data Holders and Data Users inside an FDSS.',
    fr: 'Intermédiaire technique sous FiDA entre Data Holders et Data Users au sein d’un FDSS.',
  }, {
    aliases: { en: ['Data Access Service Provider'], fr: ['prestataire d’accès aux données'] },
    seeAlso: ['fdss', 'fida', 'tsp'],
    sources: ['konsentus'],
  }),
  g('data-holder', 'Data Holder', 'concept', { en: 'Data Holder', fr: 'Détenteur de données' }, {
    en: 'FiDA institution required to provide access to financial data — banks, insurers, pension providers, investment firms, lessors. ASPSPs become Data Holders for payment-account data.',
    fr: 'Institution FiDA tenue de donner accès aux données financières — banques, assureurs, retraites, entreprises d’investissement, bailleurs. Les ASPSP deviennent Data Holders pour les comptes de paiement.',
  }, {
    aliases: { en: ['data holder', 'FiDA data holder'], fr: ['détenteur de données', 'Data Holder'] },
    seeAlso: ['aspsp', 'data-user', 'fida'],
    sources: ['konsentus'],
  }),
  g('data-user', 'Data User', 'concept', { en: 'Data User', fr: 'Utilisateur de données' }, {
    en: 'FiDA regulated entity that accesses financial data — typically a FISP.',
    fr: 'Entité réglementée FiDA qui accède aux données financières — en pratique un FISP.',
  }, {
    aliases: { en: ['data user', 'FiDA data user'], fr: ['utilisateur de données'] },
    seeAlso: ['fisp', 'data-holder', 'fida'],
    sources: ['konsentus'],
  }),
  g('scheme-operator', 'Scheme operator', 'concept', { en: 'Scheme operator (FDSS)', fr: 'Opérateur de schéma (FDSS)' }, {
    en: 'Under FiDA, the entity that governs, manages and enforces the FDSS rulebook and operations.',
    fr: 'Sous FiDA, l’entité qui gouverne, gère et fait appliquer le rulebook et les opérations du FDSS.',
  }, {
    aliases: { en: ['scheme operator'], fr: ['opérateur de schéma'] },
    seeAlso: ['fdss', 'scheme-owner'],
    sources: ['konsentus'],
  }),
  g('scheme-owner', 'Scheme owner', 'concept', { en: 'Scheme owner (FDSS)', fr: 'Propriétaire de schéma (FDSS)' }, {
    en: 'Under FiDA, the legal entity that establishes the FDSS and remains accountable for its purpose and compliance.',
    fr: 'Sous FiDA, l’entité juridique qui établit le FDSS et reste responsable de sa finalité et de sa conformité.',
  }, {
    aliases: { en: ['scheme owner'], fr: ['propriétaire de schéma'] },
    seeAlso: ['fdss', 'scheme-operator'],
    sources: ['konsentus'],
  }),
  g('dora', 'DORA', 'regulation', { en: 'Digital Operational Resilience Act', fr: 'Règlement sur la résilience opérationnelle numérique' }, {
    en: 'EU regulation on ICT risk and operational resilience for financial entities and their critical ICT providers — the security floor under Open Banking / Open Finance connectivity.',
    fr: 'Règlement UE sur le risque TIC et la résilience opérationnelle des entités financières et de leurs prestataires TIC critiques — le plancher de sécurité sous la connectivité Open Banking / Open Finance.',
  }, {
    aliases: { en: ['Digital Operational Resilience Act'], fr: ['DORA', 'résilience opérationnelle numérique'] },
    seeAlso: ['nis2', 'ict', 'fida'],
    sources: ['konsentus'],
  }),
  g('nis2', 'NIS2', 'regulation', { en: 'Network and Information Security Directive 2', fr: 'Directive NIS 2' }, {
    en: 'EU cybersecurity directive: risk management, incident response and reporting. Overlaps DORA for many PSPs.',
    fr: 'Directive UE cybersécurité : gestion des risques, réponse aux incidents et reporting. Chevauche DORA pour beaucoup de PSP.',
  }, {
    aliases: { en: ['NIS 2', 'Network and Information Security Directive'], fr: ['directive NIS2'] },
    seeAlso: ['dora'],
    sources: ['konsentus'],
  }),
  g('gdpr', 'GDPR', 'regulation', { en: 'General Data Protection Regulation', fr: 'Règlement général sur la protection des données' }, {
    en: 'EU data-protection regulation. Open Banking consents sit beside GDPR legal bases — do not treat a PSD2 consent as a blanket GDPR waiver.',
    fr: 'Règlement UE sur la protection des données. Les consentements Open Banking coexistent avec les bases RGPD — un consentement PSD2 n’est pas une dérogation RGPD générale.',
  }, {
    aliases: { en: ['General Data Protection Regulation', 'EU GDPR', 'UK GDPR'], fr: ['RGPD', 'règlement général sur la protection des données'] },
    seeAlso: ['consent', 'pii', 'dpa'],
    sources: ['ukob', 'konsentus'],
  }),
  g('aml', 'AML', 'regulation', { en: 'Anti-Money Laundering', fr: 'Lutte contre le blanchiment' }, {
    en: 'Controls to detect and prevent money laundering. PSPs combine AML with CFT and KYC/KYB onboarding.',
    fr: 'Dispositifs de détection et de prévention du blanchiment. Les PSP les combinent avec CFT et KYC/KYB.',
  }, {
    aliases: { en: ['anti-money laundering', 'AML framework'], fr: ['lutte contre le blanchiment', 'LCB'] },
    seeAlso: ['cft', 'kyc'],
    sources: ['konsentus'],
  }),
  g('cft', 'CFT', 'regulation', { en: 'Counter-Financing of Terrorism', fr: 'Lutte contre le financement du terrorisme' }, {
    en: 'Terrorist-financing controls, usually paired with AML in PSP compliance programmes.',
    fr: 'Contrôles du financement du terrorisme, généralement couplés à l’AML dans les programmes de conformité PSP.',
  }, {
    aliases: { en: ['counter-terrorist financing', 'CTF'], fr: ['lutte contre le financement du terrorisme', 'LFT'] },
    seeAlso: ['aml', 'kyc'],
    sources: ['konsentus'],
  }),
  g('kyc', 'KYC', 'concept', { en: 'Know Your Customer / Business', fr: 'Connaissance du client / de l’entreprise' }, {
    en: 'Identity-verification processes for onboarding PSUs and, for KYB, firms (TPP accreditation, directory listings). Often requires LEI for legal entities.',
    fr: 'Vérification d’identité à l’onboarding des PSU et, pour le KYB, des sociétés (accréditation TPP, annuaires). Souvent un LEI pour les personnes morales.',
  }, {
    aliases: { en: ['Know Your Customer', 'Know Your Business', 'KYB', 'KYC/KYB'], fr: ['connaissance du client', 'KYB', 'KYC'] },
    seeAlso: ['lei', 'aml', 'tpp'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('eba', 'EBA', 'regulation', { en: 'European Banking Authority', fr: 'Autorité bancaire européenne' }, {
    en: 'EU supervisory authority for banking and payments technical standards (RTS/ITS), including the SCA RTS that Open Banking APIs implement.',
    fr: 'Autorité de supervision UE pour la banque et les normes techniques paiements (RTS/ITS), dont le RTS SCA que les API Open Banking implémentent.',
  }, {
    aliases: { en: ['European Banking Authority'], fr: ['Autorité bancaire européenne', 'ABE'] },
    seeAlso: ['rts', 'esa', 'nca'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('ecb', 'ECB', 'regulation', { en: 'European Central Bank', fr: 'Banque centrale européenne' }, {
    en: 'Central bank of the euro area. Operates TARGET services including TIPS for instant settlement in central bank money.',
    fr: 'Banque centrale de la zone euro. Opère les services TARGET, dont TIPS pour le règlement instantané en monnaie banque centrale.',
  }, {
    aliases: { en: ['European Central Bank'], fr: ['Banque centrale européenne', 'BCE'] },
    seeAlso: ['tips', 'target2'],
    sources: ['konsentus'],
  }),
  g('nca', 'NCA', 'regulation', { en: 'National Competent Authority', fr: 'Autorité nationale compétente' }, {
    en: 'National supervisor of PSPs in its Member State (e.g. ACPR, BaFin, DNB). Issues TPP licences and hosts the public register TPPs appear in.',
    fr: 'Superviseur national des PSP dans son État membre (ACPR, BaFin, DNB…). Délivre les agréments TPP et tient le registre public.',
  }, {
    aliases: { en: ['National Competent Authority', 'competent authority'], fr: ['autorité nationale compétente', 'autorité compétente'] },
    seeAlso: ['eba', 'tpp', 'passporting'],
    sources: ['ukob', 'konsentus'],
  }),
  g('esa', 'ESA', 'regulation', { en: 'European Supervisory Authorities', fr: 'Autorités européennes de surveillance' }, {
    en: 'Collective term for EBA, ESMA and EIOPA.',
    fr: 'Terme collectif pour ABE, AEMF et AEAPP.',
  }, {
    aliases: { en: ['European Supervisory Authorities', 'ESAs'], fr: ['autorités européennes de surveillance', 'AES'] },
    seeAlso: ['eba', 'its'],
    sources: ['konsentus'],
  }),
  g('fca', 'FCA', 'regulation', { en: 'Financial Conduct Authority', fr: 'Financial Conduct Authority' }, {
    en: 'UK conduct regulator for financial services. Co-chairs JROC for the next phase of UK Open Banking; registers AISPs/PISPs under the PSRs.',
    fr: 'Régulateur de conduite britannique. Co-préside le JROC pour la suite de l’Open Banking UK ; enregistre AISP/PISP au titre des PSR.',
  }, {
    aliases: { en: ['Financial Conduct Authority'], fr: ['Financial Conduct Authority'] },
    seeAlso: ['jroc', 'psr-uk', 'cma'],
    sources: ['ukob', 'ravelin'],
  }),
  g('cma', 'CMA', 'regulation', { en: 'Competition and Markets Authority', fr: 'Competition and Markets Authority' }, {
    en: 'UK competition authority. The 2017 Retail Banking Market Investigation Order forced the CMA9 to implement Open Banking APIs.',
    fr: 'Autorité britannique de la concurrence. L’ordre de 2017 sur la banque de détail a contraint le CMA9 à implémenter les API Open Banking.',
  }, {
    aliases: { en: ['Competition and Markets Authority', 'CMA Order'], fr: ['Competition and Markets Authority', 'ordre CMA'] },
    seeAlso: ['cma9', 'cma-order', 'obl', 'open-banking'],
    sources: ['ukob'],
  }),
  g('cma-order', 'CMA Order', 'regulation', { en: 'Retail Banking Market Investigation Order 2017', fr: 'Retail Banking Market Investigation Order 2017' }, {
    en: 'UK order requiring the CMA9 to adopt Open Banking standards, the Directory and Read/Write APIs.',
    fr: 'Ordre britannique imposant au CMA9 d’adopter les standards Open Banking, l’annuaire et les API Read/Write.',
  }, {
    aliases: { en: ['CMA Order', '2017 Order'], fr: ['ordre CMA', 'ordre 2017'] },
    seeAlso: ['cma', 'cma9', 'obl'],
    sources: ['ukob'],
  }),
  g('cma9', 'CMA9', 'concept', { en: 'CMA9 banks', fr: 'Banques CMA9' }, {
    en: 'The nine UK banks and building societies mandated by the CMA Order: AIB/First Trust, Bank of Ireland, Barclays, HSBC, Lloyds, Nationwide, Danske, NatWest, Santander UK.',
    fr: 'Les neuf banques et building societies britanniques contraintes par l’ordre CMA : AIB/First Trust, Bank of Ireland, Barclays, HSBC, Lloyds, Nationwide, Danske, NatWest, Santander UK.',
  }, {
    aliases: { en: ['CMA9', 'CMA 9'], fr: ['CMA9'] },
    seeAlso: ['cma', 'cma-order', 'obl'],
    sources: ['ukob'],
  }),
  g('obl', 'OBL', 'concept', { en: 'Open Banking Limited', fr: 'Open Banking Limited' }, {
    en: 'UK delivery body (formerly OBIE) that maintains the Open Banking standards and Directory with the CMA9 and other participants.',
    fr: 'Organisme britannique (ex-OBIE) qui maintient les standards Open Banking et l’annuaire avec le CMA9 et les autres participants.',
  }, {
    aliases: { en: ['Open Banking Limited', 'OBIE', 'Open Banking Implementation Entity'], fr: ['Open Banking Limited', 'OBIE'] },
    seeAlso: ['directory', 'open-banking', 'cma9'],
    sources: ['ukob'],
  }),
  g('directory', 'Directory', 'concept', { en: 'Open Banking Directory', fr: 'Annuaire Open Banking' }, {
    en: 'Trust framework of regulated UK participants: software statements, certificates and enrolment that let TPPs and ASPSPs identify each other. Has a Directory Sandbox for test endpoints.',
    fr: 'Cadre de confiance des participants UK réglementés : software statements, certificats et enrolment pour que TPP et ASPSP s’identifient. Un Directory Sandbox sert aux endpoints de test.',
  }, {
    aliases: { en: ['OB Directory', 'Directory Sandbox'], fr: ['annuaire Open Banking', 'Directory Sandbox'] },
    seeAlso: ['obl', 'sandbox', 'fapi'],
    sources: ['ukob'],
  }),
  g('jroc', 'JROC', 'regulation', { en: 'Joint Regulatory Oversight Committee', fr: 'Joint Regulatory Oversight Committee' }, {
    en: 'UK committee (from 2023) overseeing the next phase of Open Banking, co-chaired by the FCA and the Payment Systems Regulator.',
    fr: 'Comité britannique (depuis 2023) qui supervise la phase suivante de l’Open Banking, co-présidé par la FCA et le Payment Systems Regulator.',
  }, {
    aliases: { en: ['Joint Regulatory Oversight Committee'], fr: ['Joint Regulatory Oversight Committee'] },
    seeAlso: ['fca', 'open-banking'],
    sources: ['ukob'],
  }),
  g('app-fraud', 'APP fraud', 'concept', { en: 'Authorised Push Payment fraud', fr: 'Fraude au virement autorisé' }, {
    en: 'Victim is tricked into sending funds to a fraudulent account (fake payee, impersonation). VoP / CoP exist to cut this class of loss.',
    fr: 'La victime est trompée pour envoyer des fonds vers un compte frauduleux (faux bénéficiaire, usurpation). VoP / CoP visent cette classe de perte.',
  }, {
    aliases: { en: ['Authorised Push Payment fraud', 'APP', 'push payment fraud'], fr: ['fraude au virement autorisé', 'fraude APP'] },
    seeAlso: ['vop', 'cop', 'iban-nb'],
    sources: ['ukob'],
  }),
  g('vrp', 'VRP', 'concept', { en: 'Variable Recurring Payments', fr: 'Paiements récurrents variables' }, {
    en: 'UK Open Banking: one SCA authorises a mandate with limits; subsequent payments can run without a new SCA. Sweeping VRPs move money between the PSU’s own accounts; commercial VRPs pay third parties.',
    fr: 'Open Banking UK : une SCA autorise un mandat avec plafonds ; les paiements suivants peuvent partir sans nouvelle SCA. Les VRP sweeping déplacent l’argent entre comptes du PSU ; les VRP commerciales paient des tiers.',
  }, {
    aliases: { en: ['Variable Recurring Payments', 'sweeping VRP', 'commercial VRP'], fr: ['paiements récurrents variables', 'VRP sweeping'] },
    seeAlso: ['sweeping', 'pis', 'sca'],
    sources: ['ukob'],
  }),
  g('sweeping', 'Sweeping', 'concept', { en: 'Sweeping', fr: 'Sweeping' }, {
    en: 'Automated movement of a customer’s funds between two accounts in their name (e.g. current to savings) to avoid overdraft, repay a loan or catch a better rate. Often implemented as a VRP.',
    fr: 'Mouvement automatique des fonds d’un client entre deux comptes à son nom (ex. courant vers épargne) pour éviter un découvert, rembourser un prêt ou capter un meilleur taux. Souvent implémenté en VRP.',
  }, {
    aliases: { en: ['account sweeping', 'sweep'], fr: ['sweeping', 'virement automatique entre comptes'] },
    seeAlso: ['vrp', 'a2a'],
    sources: ['ukob'],
  }),
  g('smart-data', 'Smart data', 'concept', { en: 'Smart data', fr: 'Smart data' }, {
    en: 'UK policy term for secure sharing of customer data with authorised TPPs at the customer’s request — Open Banking is the payments instance of a wider smart-data programme.',
    fr: 'Terme de politique britannique pour le partage sécurisé de données client avec des TPP autorisés à la demande du client — l’Open Banking en est l’instance paiements.',
  }, {
    aliases: { en: ['smart data', 'Smart Data Council'], fr: ['smart data'] },
    seeAlso: ['open-banking', 'open-finance'],
    sources: ['ukob'],
  }),
  g('open-data', 'Open Data', 'concept', { en: 'Open Data (UK OB)', fr: 'Open Data (OB UK)' }, {
    en: 'UK Open Banking product/ATM/branch reference data that anyone can access — not the PSU’s private transaction data (that is Read/Write).',
    fr: 'Données de référence UK Open Banking (produits, DAB, agences) accessibles à tous — pas les transactions privées du PSU (celles-ci sont Read/Write).',
  }, {
    aliases: { en: ['Open Data API', 'open data'], fr: ['Open Data', 'API Open Data'] },
    seeAlso: ['read-write-api', 'open-banking'],
    sources: ['ukob'],
  }),
  g('read-write-api', 'Read/Write API', 'concept', { en: 'Read/Write API', fr: 'API Read/Write' }, {
    en: 'UK Open Banking APIs that, with consent, read PCA/BCA transactions or initiate payments — as opposed to public Open Data.',
    fr: 'API Open Banking UK qui, avec consentement, lisent les transactions PCA/BCA ou initient des paiements — par opposition à l’Open Data public.',
  }, {
    aliases: { en: ['Read/Write Data', 'Read Write APIs'], fr: ['API Read/Write', 'données Read/Write'] },
    seeAlso: ['open-data', 'ais', 'pis', 'directory'],
    sources: ['ukob'],
  }),
  g('iban', 'IBAN', 'concept', { en: 'International Bank Account Number', fr: 'Identifiant international de compte bancaire' }, {
    en: 'ISO 13616 identifier of a payment account. SEPA credit transfers address the payee by IBAN; VoP checks the name against that IBAN.',
    fr: 'Identifiant ISO 13616 d’un compte de paiement. Les virements SEPA adressent le bénéficiaire par IBAN ; la VoP contrôle le nom contre cet IBAN.',
  }, {
    aliases: { en: ['International Bank Account Number'], fr: ['identifiant international de compte bancaire'] },
    seeAlso: ['bic', 'vop', 'sepa'],
    sources: ['konsentus'],
  }),
  g('bic', 'BIC', 'concept', { en: 'Business Identifier Code', fr: 'Code d’identification des entreprises' }, {
    en: 'ISO 9362 bank identifier (SWIFT BIC). In ISO 20022 it appears as BICFI on agents (DbtrAgt / CdtrAgt).',
    fr: 'Identifiant bancaire ISO 9362 (BIC SWIFT). En ISO 20022 il apparaît en BICFI sur les agents (DbtrAgt / CdtrAgt).',
  }, {
    aliases: { en: ['SWIFT BIC', 'BICFI', 'Bank Identifier Code'], fr: ['BIC SWIFT', 'BICFI'] },
    seeAlso: ['iban', 'iso-20022'],
  }),
  g('lei', 'LEI', 'concept', { en: 'Legal Entity Identifier', fr: 'Identifiant d’entité juridique' }, {
    en: 'Global identifier for legal entities, used in TPP accreditation and directory listings.',
    fr: 'Identifiant mondial des personnes morales, utilisé pour l’accréditation TPP et les annuaires.',
  }, {
    aliases: { en: ['Legal Entity Identifier'], fr: ['identifiant d’entité juridique'] },
    seeAlso: ['kyc', 'directory'],
    sources: ['konsentus'],
  }),
  g('iban-nb', 'IBAN-NB', 'concept', { en: 'IBAN Name Check', fr: 'Contrôle nom/IBAN' }, {
    en: 'Payee-verification requirement (name vs IBAN). EU implementation is Verification of Payee on acmt.023/024.',
    fr: 'Exigence de vérification du bénéficiaire (nom vs IBAN). L’implémentation UE est la Verification of Payee sur acmt.023/024.',
  }, {
    aliases: { en: ['IBAN Name Check', 'IBAN-NB', 'name/IBAN check'], fr: ['contrôle nom/IBAN', 'IBAN-NB'] },
    seeAlso: ['vop', 'cop'],
    sources: ['konsentus'],
  }),
  g('iso-20022', 'ISO 20022', 'concept', { en: 'ISO 20022', fr: 'ISO 20022' }, {
    en: 'Methodology and XML/JSON financial messaging standard. Clearing uses business areas pain, pacs, camt, acmt. Version in the xmlns (pacs.008.001.08 vs .10) is a common rejection cause.',
    fr: 'Méthodologie et standard de messagerie financière XML/JSON. La compensation utilise les domaines pain, pacs, camt, acmt. La version dans le xmlns (pacs.008.001.08 vs .10) est une cause fréquente de rejet.',
  }, {
    aliases: { en: ['ISO20022', 'MX messages'], fr: ['ISO20022', 'messages MX'] },
    seeAlso: ['pain', 'pacs', 'camt', 'acmt', 'sct'],
    sources: ['konsentus'],
    links: [{ label: 'pacs.008', href: '/messages/pacs.008' }],
  }),
  g('pain', 'pain', 'concept', { en: 'Payments Initiation (pain)', fr: 'Initiation des paiements (pain)' }, {
    en: 'ISO 20022 business area for customer-to-bank instructions: pain.001 credit, pain.008 direct debit, pain.013 request-to-pay.',
    fr: 'Domaine ISO 20022 des instructions client-banque : pain.001 virement, pain.008 prélèvement, pain.013 request-to-pay.',
  }, {
    aliases: { en: ['Payments Initiation', 'pain.001'], fr: ['initiation des paiements', 'pain'] },
    seeAlso: ['pacs', 'iso-20022', 'camt', 'acmt'],
    links: [{ label: 'pain.001', href: '/messages/pain.001' }],
  }),
  g('pacs', 'pacs', 'concept', { en: 'Payments Clearing & Settlement (pacs)', fr: 'Compensation et règlement (pacs)' }, {
    en: 'ISO 20022 interbank clearing area. pacs.008 is the customer credit transfer; pacs.002 is the status/ack.',
    fr: 'Domaine ISO 20022 de compensation interbancaire. pacs.008 est le virement client ; pacs.002 le statut/ack.',
  }, {
    aliases: { en: ['Payments Clearing and Settlement'], fr: ['compensation et règlement'] },
    seeAlso: ['pain', 'camt', 'csm', 'iso-20022'],
    links: [{ label: 'pacs.008', href: '/messages/pacs.008' }],
  }),
  g('camt', 'camt', 'concept', { en: 'Cash Management (camt)', fr: 'Gestion de trésorerie (camt)' }, {
    en: 'ISO 20022 cash-management area: statements (camt.053), notifications (camt.054), recalls (camt.056) and investigations.',
    fr: 'Domaine ISO 20022 de cash management : relevés (camt.053), notifications (camt.054), rappels (camt.056) et investigations.',
  }, {
    aliases: { en: ['Cash Management'], fr: ['gestion de trésorerie'] },
    seeAlso: ['pacs', 'iso-20022', 'pain'],
  }),
  g('acmt', 'acmt', 'concept', { en: 'Account Management (acmt)', fr: 'Gestion de compte (acmt)' }, {
    en: 'ISO 20022 account-management area. VoP uses acmt.023 (request) and acmt.024 (report).',
    fr: 'Domaine ISO 20022 de gestion de compte. La VoP utilise acmt.023 (demande) et acmt.024 (rapport).',
  }, {
    aliases: { en: ['Account Management'], fr: ['gestion de compte'] },
    seeAlso: ['vop', 'acmt-023', 'acmt-024'],
  }),
  g('csm', 'CSM', 'concept', { en: 'Clearing and Settlement Mechanism', fr: 'Mécanisme de compensation et de règlement' }, {
    en: 'The rail that actually clears and settles: TIPS, RT1, STEP2, SIC, euroSIC. Distinct from the XS2A API the TPP talks to.',
    fr: 'Le rail qui compense et règle vraiment : TIPS, RT1, STEP2, SIC, euroSIC. Distinct de l’API XS2A à laquelle parle le TPP.',
  }, {
    aliases: { en: ['clearing and settlement mechanism', 'clearing system', 'the rail'], fr: ['mécanisme de compensation', 'CSM', 'le rail'] },
    seeAlso: ['tips', 'rt1', 'sic', 'pacs'],
  }),
  g('sic', 'SIC', 'scheme', { en: 'Swiss Interbank Clearing', fr: 'Swiss Interbank Clearing' }, {
    en: 'SIX CHF high-value and retail clearing in central bank money. Fully ISO 20022. Instant CHF is SIC IP, not SCT Inst.',
    fr: 'Compensation SIX en CHF, gros montants et retail, en monnaie banque centrale. Entièrement ISO 20022. L’instantané CHF est SIC IP, pas SCT Inst.',
  }, {
    aliases: { en: ['Swiss Interbank Clearing', 'SIC CHF'], fr: ['Swiss Interbank Clearing', 'SIC CHF'] },
    seeAlso: ['eurosic', 'sic-ip', 'csm'],
    links: [{ label: 'Swiss SPS / SIC', href: '/standards/swiss-sps' }],
  }),
  g('eurosic', 'euroSIC', 'scheme', { en: 'euroSIC', fr: 'euroSIC' }, {
    en: 'SIX EUR clearing for Swiss participants. EUR legs of Swiss traffic often settle here rather than in SEPA STEP2.',
    fr: 'Compensation SIX en EUR pour les participants suisses. Les jambes EUR du trafic suisse y sont souvent réglées plutôt que dans STEP2 SEPA.',
  }, {
    aliases: { en: ['euroSIC'], fr: ['euroSIC'] },
    seeAlso: ['sic', 'sepa', 'csm'],
  }),
  g('sic-ip', 'SIC IP', 'scheme', { en: 'SIC Instant Payments', fr: 'SIC Instant Payments' }, {
    en: 'SIX CHF instant rail, ~10 seconds in central bank money. Treat timeouts like SCT Inst (pacs.028), not like batch SIC.',
    fr: 'Rail instantané CHF de SIX, ~10 secondes en monnaie banque centrale. Traitez les timeouts comme du SCT Inst (pacs.028), pas comme du SIC de lot.',
  }, {
    aliases: { en: ['SIC Instant Payment', 'SIC Instant'], fr: ['SIC Instant', 'paiements instantanés SIC'] },
    seeAlso: ['sic', 'ip', 'sct-inst'],
    links: [{ label: 'SIC IP flow', href: '/flows/sic-ip-instant' }],
  }),
  g('target2', 'T2', 'scheme', { en: 'TARGET2 / T2', fr: 'TARGET2 / T2' }, {
    en: 'ECB real-time gross settlement for the euro. TIPS is the instant service in the same TARGET family; high-value non-instant still goes T2.',
    fr: 'Règlement brut en temps réel de la BCE pour l’euro. TIPS est le service instantané de la même famille TARGET ; le gros montant non instantané reste en T2.',
  }, {
    aliases: { en: ['TARGET2', 'T2', 'TARGET'], fr: ['TARGET2', 'T2'] },
    seeAlso: ['tips', 'ecb', 'csm'],
  }),
  g('cbpr-plus', 'CBPR+', 'scheme', { en: 'CBPR+', fr: 'CBPR+' }, {
    en: 'SWIFT Cross-Border Payments and Reporting Plus — ISO 20022 usage guidelines for correspondent banking. Schema versions (pacs.008.001.08 vs .13) follow CBPR+ windows, not SEPA IGs.',
    fr: 'SWIFT Cross-Border Payments and Reporting Plus — lignes directrices ISO 20022 pour la banque correspondante. Les versions de schéma suivent les fenêtres CBPR+, pas les IG SEPA.',
  }, {
    aliases: { en: ['CBPR+', 'Cross-Border Payments and Reporting Plus'], fr: ['CBPR+'] },
    seeAlso: ['iso-20022', 'pacs'],
  }),
  g('ach', 'ACH', 'scheme', { en: 'Automated Clearing House', fr: 'Chambre de compensation automatisée' }, {
    en: 'Batch retail clearing (US ACH, and loosely any next-batch credit). Instant payments are defined against this: seconds, not next window. Mastercard Partner Linked often fetches ACH routing for US payouts.',
    fr: 'Compensation retail par lots (ACH US, et par extension tout virement du prochain cycle). Les paiements instantanés se définissent contre cela : des secondes, pas la prochaine fenêtre. Partner Linked Mastercard lit souvent le routage ACH pour les payouts US.',
  }, {
    aliases: { en: ['Automated Clearing House', 'ACH credit', 'ACH routing'], fr: ['ACH', 'chambre de compensation automatisée'] },
    seeAlso: ['ip', 'partner-linked', 'sct'],
    sources: ['mastercard'],
  }),
  g('oauth2', 'OAuth2', 'concept', { en: 'Open Authorisation 2.0', fr: 'Open Authorisation 2.0' }, {
    en: 'Authorisation framework used by STET, UK Open Banking (with OIDC) and Mastercard FI connections. Berlin Group base profile is consent-resource, not OAuth; OAuth2 SCA is an optional approach.',
    fr: 'Cadre d’autorisation utilisé par STET, l’Open Banking UK (avec OIDC) et les connexions FI Mastercard. Le profil de base Berlin Group est une ressource de consentement, pas OAuth ; OAuth2 SCA est une approche optionnelle.',
  }, {
    aliases: { en: ['OAuth 2.0', 'OAuth2', 'Open Authorisation'], fr: ['OAuth 2.0', 'OAuth2'] },
    seeAlso: ['oidc', 'fapi', 'access-token', 'app-registration'],
    sources: ['konsentus', 'mastercard'],
  }),
  g('oidc', 'OIDC', 'concept', { en: 'OpenID Connect', fr: 'OpenID Connect' }, {
    en: 'Identity layer on OAuth2. UK Open Banking binds the consent id in a signed request object (`openbanking_intent_id`).',
    fr: 'Couche identité sur OAuth2. L’Open Banking UK lie l’id de consentement dans un request object signé (`openbanking_intent_id`).',
  }, {
    aliases: { en: ['OpenID Connect', 'OIDC'], fr: ['OpenID Connect'] },
    seeAlso: ['oauth2', 'fapi', 'consent'],
    sources: ['konsentus'],
  }),
  g('fapi', 'FAPI', 'concept', { en: 'Financial-grade API', fr: 'Financial-grade API' }, {
    en: 'OpenID Foundation high-security profile (FAPI 2.0: mTLS or private_key_jwt, PAR, PKCE). UK Open Banking security baseline.',
    fr: 'Profil haute sécurité de l’OpenID Foundation (FAPI 2.0 : mTLS ou private_key_jwt, PAR, PKCE). Socle de sécurité de l’Open Banking UK.',
  }, {
    aliases: { en: ['Financial-Grade API', 'FAPI 2.0'], fr: ['Financial-grade API', 'FAPI 2.0'] },
    seeAlso: ['oauth2', 'oidc', 'mtls', 'directory'],
    sources: ['konsentus'],
  }),
  g('mtls', 'mTLS', 'concept', { en: 'Mutual TLS', fr: 'TLS mutuel' }, {
    en: 'Both sides present certificates. PSD2 XS2A uses a QWAC; FAPI may use mTLS as the client-auth method. (Konsentus glossary writes “Mutual Transport Later Security” — the protocol is mutual TLS.)',
    fr: 'Les deux côtés présentent un certificat. XS2A PSD2 utilise un QWAC ; FAPI peut utiliser mTLS comme auth client. (Le glossaire Konsentus écrit « Mutual Transport Later Security » — le protocole est le TLS mutuel.)',
  }, {
    aliases: { en: ['mutual TLS', 'mTLS', 'Mutual Transport Layer Security'], fr: ['TLS mutuel', 'mTLS'] },
    seeAlso: ['qwac', 'eidas', 'fapi'],
    sources: ['konsentus'],
  }),
  g('eidas', 'eIDAS', 'regulation', { en: 'eIDAS', fr: 'eIDAS' }, {
    en: 'EU trust-services regulation. PSD2 TPP certificates (QWAC, QSealC) are eIDAS qualified certificates listing roles PSP_AI / PSP_PI / PSP_IC. eIDAS 2.0 adds the EUDI Wallet.',
    fr: 'Règlement UE sur les services de confiance. Les certificats TPP PSD2 (QWAC, QSealC) sont des certificats qualifiés eIDAS portant les rôles PSP_AI / PSP_PI / PSP_IC. eIDAS 2.0 ajoute le wallet EUDI.',
  }, {
    aliases: { en: ['eIDAS 2.0', 'electronic identification'], fr: ['eIDAS 2.0', 'identification électronique'] },
    seeAlso: ['qwac', 'qsealc', 'eudi-wallet', 'qtsp'],
  }),
  g('qwac', 'QWAC', 'concept', { en: 'Qualified Website Authentication Certificate', fr: 'Certificat qualifié d’authentification de site' }, {
    en: 'eIDAS certificate for TPP mTLS to the ASPSP. Role attributes in the cert are the legal roles (PSP_AI, PSP_PI, PSP_IC) — a missing attribute is a 401, not a business error.',
    fr: 'Certificat eIDAS pour le mTLS TPP vers l’ASPSP. Les attributs de rôle du certificat sont les rôles légaux (PSP_AI, PSP_PI, PSP_IC) — un attribut manquant est un 401, pas une erreur métier.',
  }, {
    aliases: { en: ['QWAC', 'qualified website certificate'], fr: ['QWAC', 'certificat de site qualifié'] },
    seeAlso: ['qsealc', 'eidas', 'mtls', 'qtsp'],
  }),
  g('qsealc', 'QSealC', 'concept', { en: 'Qualified Electronic Seal Certificate', fr: 'Certificat de cachet électronique qualifié' }, {
    en: 'eIDAS seal certificate used to sign HTTP requests (Berlin Group HTTP Signature / TPP-Signature-Certificate) or other message-level seals.',
    fr: 'Certificat de cachet eIDAS pour signer les requêtes HTTP (signature Berlin Group / TPP-Signature-Certificate) ou d’autres cachets de message.',
  }, {
    aliases: { en: ['QSealC', 'QSeal', 'qualified seal'], fr: ['QSealC', 'QSeal', 'cachet qualifié'] },
    seeAlso: ['qwac', 'eidas'],
  }),
  g('qtsp', 'QTSP', 'concept', { en: 'Qualified Trust Service Provider', fr: 'Prestataire de services de confiance qualifié' }, {
    en: 'Issuer of QWAC/QSealC, listed on the EU Trusted List. ASPSPs reject certs from unlisted issuers.',
    fr: 'Émetteur de QWAC/QSealC, inscrit sur la liste de confiance UE. Les ASPSP rejettent les certificats d’émetteurs non listés.',
  }, {
    aliases: { en: ['Qualified Trust Service Provider'], fr: ['prestataire de confiance qualifié'] },
    seeAlso: ['qwac', 'eidas'],
  }),
  g('eudi-wallet', 'EUDI Wallet', 'concept', { en: 'European Digital Identity Wallet', fr: 'Portefeuille d’identité numérique européen' }, {
    en: 'eIDAS 2.0 wallet that may carry authentication and consent for Open Banking / Open Finance journeys.',
    fr: 'Wallet eIDAS 2.0 susceptible de porter authentification et consentement dans les parcours Open Banking / Open Finance.',
  }, {
    aliases: { en: ['EUDI Wallet', 'European Digital Identity Wallet'], fr: ['wallet EUDI', 'portefeuille d’identité numérique européen'] },
    seeAlso: ['eidas', 'sca', 'consent'],
    sources: ['konsentus'],
  }),
  g('emi', 'EMI', 'concept', { en: 'Electronic Money Institution', fr: 'Établissement de monnaie électronique' }, {
    en: 'Firm authorised to issue e-money and related payment services. Many AISPs/PISPs are licensed as EMI or PI rather than as a bank.',
    fr: 'Établissement agréé pour émettre de la monnaie électronique et des services de paiement liés. Beaucoup d’AISP/PISP sont agréés EMI ou PI plutôt que banque.',
  }, {
    aliases: { en: ['Electronic Money Institution', 'e-money institution'], fr: ['établissement de monnaie électronique', 'EME'] },
    seeAlso: ['psp', 'tpp'],
    sources: ['konsentus'],
  }),
  g('passporting', 'Passporting', 'concept', { en: 'Passporting', fr: 'Passeport européen' }, {
    en: 'Using a home-state PSP licence to provide services in other EEA states. Host NCAs still expect you on their register.',
    fr: 'Utiliser un agrément PSP de l’État d’origine pour servir d’autres États de l’EEE. Les ANC d’accueil attendent quand même de vous voir sur leur registre.',
  }, {
    aliases: { en: ['passporting', 'EU passport'], fr: ['passeport européen', 'passporting'] },
    seeAlso: ['nca', 'tpp', 'psd2', 'fida'],
    sources: ['konsentus'],
  }),
  g('pii', 'PII', 'concept', { en: 'Personally Identifiable Information', fr: 'Données personnelles identifiantes' }, {
    en: 'Personal data protected under GDPR. Payment-account data in AIS is typically PII — minimise what you store.',
    fr: 'Données personnelles protégées par le RGPD. Les données de compte en AIS sont en général des PII — minimisez ce que vous stockez.',
  }, {
    aliases: { en: ['personally identifiable information', 'personal data'], fr: ['données personnelles', 'PII'] },
    seeAlso: ['gdpr', 'consent'],
    sources: ['konsentus'],
  }),
  g('dpa', 'DPA', 'regulation', { en: 'Data Protection Authority', fr: 'Autorité de protection des données' }, {
    en: 'National privacy regulator (CNIL, ICO, …) enforcing GDPR alongside the NCA’s payments supervision.',
    fr: 'Régulateur national de la vie privée (CNIL, ICO…) qui applique le RGPD à côté de la supervision paiements de l’ANC.',
  }, {
    aliases: { en: ['Data Protection Authority', 'supervisory authority (GDPR)'], fr: ['autorité de protection des données'] },
    seeAlso: ['gdpr', 'nca'],
    sources: ['konsentus'],
  }),
  g('ict', 'ICT', 'concept', { en: 'Information and Communication Technology', fr: 'Technologies de l’information et de la communication' }, {
    en: 'Systems and infrastructure in DORA’s scope — including the XS2A estate and CSMs you depend on.',
    fr: 'Systèmes et infrastructures dans le périmètre DORA — y compris le SI XS2A et les CSM dont vous dépendez.',
  }, {
    aliases: { en: ['ICT systems', 'information and communication technology'], fr: ['TIC', 'systèmes d’information'] },
    seeAlso: ['dora'],
    sources: ['konsentus'],
  }),
  g('epc', 'EPC', 'concept', { en: 'European Payments Council', fr: 'Conseil européen des paiements' }, {
    en: 'Scheme manager for SCT, SCT Inst and SDD rulebooks. Usage guidelines (IGs) pin the ISO 20022 version a SEPA payment must use.',
    fr: 'Gestionnaire des rulebooks SCT, SCT Inst et SDD. Les lignes directrices (IG) figent la version ISO 20022 d’un paiement SEPA.',
  }, {
    aliases: { en: ['European Payments Council'], fr: ['Conseil européen des paiements'] },
    seeAlso: ['sct', 'sct-inst', 'sdd', 'sepa'],
  }),
  g('api', 'API', 'concept', { en: 'Application Programming Interface', fr: 'Interface de programmation applicative' }, {
    en: 'Machine-to-machine interface. In this catalog: JSON XS2A APIs on one side, ISO 20022 XML clearing on the other.',
    fr: 'Interface machine-à-machine. Dans ce catalogue : API JSON XS2A d’un côté, compensation XML ISO 20022 de l’autre.',
  }, {
    aliases: { en: ['Application Programming Interface', 'Open API'], fr: ['interface de programmation', 'API ouverte'] },
    seeAlso: ['xs2a', 'oauth2'],
    sources: ['ukob', 'konsentus', 'ravelin'],
  }),
];
