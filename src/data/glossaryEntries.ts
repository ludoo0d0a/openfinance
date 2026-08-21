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
  g('sct', 'SCT', 'scheme', { en: 'SEPA Credit Transfer', fr: 'Virement SEPA' }, {
    en: 'EPC scheme for non-urgent euro credit transfers between payment accounts in SEPA, on common ISO 20022 rules (typically pacs.008, Local Instrument not INST). Batch rails such as STEP2; instant variant is SCT Inst.',
    fr: 'Schéma EPC de virement euro non urgent entre comptes de paiement dans l’espace SEPA, sur des règles ISO 20022 communes (souvent pacs.008, sans Local Instrument INST). Rails de lot tels que STEP2 ; la variante instantanée est le SCT Inst.',
  }, {
    aliases: { en: ['SEPA Credit Transfer', 'SEPA CT', 'credit transfer'], fr: ['virement SEPA', 'SCT', 'virement crédit'] },
    seeAlso: ['sepa', 'sct-inst', 'sdd', 'pacs', 'step2', 'epc'],
    sources: ['konsentus'],
    links: [
      { label: 'Explorer', href: '/payment/sepa-credit-transfer' },
      { label: 'pacs.008', href: '/messages/pacs.008' },
    ],
  }),
  g('sct-inst', 'SCT Inst', 'scheme', { en: 'SEPA Instant Credit Transfer', fr: 'Virement SEPA instantané' }, {
    en: 'Euro instant credit transfer scheme: funds available in ≤10 seconds, 24/7. Clearing via TIPS, RT1 or equivalent with Local Instrument INST on pacs.008. IPR pairs it with mandatory VoP. SCT Inst checkout is the rail itself — no proxy/wallet overlay (unlike Wero/Bizum).',
    fr: 'Schéma de virement euro instantané : fonds disponibles en ≤10 secondes, 24/7. Compensation via TIPS, RT1 ou équivalent avec Local Instrument INST sur pacs.008. L’IPR l’associe à la VoP obligatoire. Le checkout SCT Inst est le rail lui-même — pas d’overlay proxy/wallet (contrairement à Wero/Bizum).',
  }, {
    aliases: { en: ['SCT Instant', 'instant SEPA', 'INST', 'SCT Inst'], fr: ['SCT Instant', 'SEPA Instant', 'virement instantané', 'INST'] },
    seeAlso: ['sct', 'sepa', 'vop', 'ipr', 'ip', 'tips', 'rt1', 'wero', 'a2a-overlay'],
    sources: ['konsentus'],
    links: [
      { label: 'Standard', href: '/standards/sct-inst' },
      { label: 'SCT Inst checkout', href: '/payment/sepa-instant' },
      { label: 'Happy path', href: '/flows/sct-inst-happy-path' },
    ],
  }),
  g('sdd', 'SDD', 'scheme', { en: 'SEPA Direct Debit', fr: 'Prélèvement SEPA' }, {
    en: 'EPC schemes for euro direct debits (SDD Core for consumers, SDD B2B for businesses). Customer-to-bank initiation is pain.008; R-transactions carry mandate and sequence-type rules.',
    fr: 'Schémas EPC de prélèvement euro (SDD Core pour les consommateurs, SDD B2B pour les entreprises). L’initiation client-banque est pain.008 ; les R-transactions suivent mandat et type de séquence.',
  }, {
    aliases: { en: ['SEPA Direct Debit', 'SDD Core', 'SDD B2B', 'B2B', 'direct debit'], fr: ['prélèvement SEPA', 'SDD Core', 'SDD B2B', 'B2B'] },
    seeAlso: ['sepa', 'sct', 'pain', 'epc', 'b2b'],
    sources: ['konsentus'],
    links: [
      { label: 'Explorer', href: '/payment/sepa-direct-debit' },
      { label: 'pain.008', href: '/messages/pain.008' },
    ],
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
    en: 'Payment that moves funds between payment accounts (credit transfer / instant / overlay-on-instant) rather than card rails. A2A overlay (Wero, Bizum, …), Pix/UPI, SCT Inst checkout and PISP A2A are A2A; PIIS/CBPII still often sits in front of a card.',
    fr: 'Paiement qui déplace des fonds entre comptes de paiement (virement / instantané / overlay-sur-instantané) plutôt que sur des rails carte. Overlay A2A (Wero, Bizum, …), Pix/UPI, checkout SCT Inst et PISP A2A sont de l’A2A ; le PIIS/CBPII reste souvent devant une carte.',
  }, {
    aliases: { en: ['account-to-account', 'A2A payment', 'account to account'], fr: ['compte à compte', 'paiement A2A'] },
    seeAlso: ['a2a-overlay', 'sct-inst', 'wero', 'payconiq', 'ideal', 'bancontact', 'bizum', 'twint', 'pix', 'upi', 'ip', 'pis', 'pisp-a2a'],
    links: [
      { label: 'A2A overlay (Wero sample)', href: '/payment/wero' },
      { label: 'Instant A2A (Pix, UPI)', href: '/payment/instant-a2a' },
      { label: 'PISP A2A', href: '/payment/pisp-a2a' },
    ],
  }),
  g('ip', 'IP', 'concept', { en: 'Instant Payment', fr: 'Paiement instantané' }, {
    en: 'Umbrella term for credit transfers that settle in seconds, 24/7, with immediate funds availability — not next-batch ACH. In the euro area that is usually SCT Inst (TIPS / RT1); in Switzerland SIC IP for CHF. IPR pushes euro IP as the default path and pairs it with VoP.',
    fr: 'Terme générique pour les virements qui se règlent en secondes, 24/7, avec disponibilité immédiate des fonds — pas le prochain lot ACH. En zone euro, c’est en général le SCT Inst (TIPS / RT1) ; en Suisse, le SIC IP pour le CHF. L’IPR fait de l’IP euro le parcours par défaut et l’associe à la VoP.',
  }, {
    aliases: {
      en: ['Instant Payment', 'instant payments', 'real-time payment', 'RTP', 'INST', 'SCT Inst', 'SIC IP'],
      fr: ['paiement instantané', 'virement instantané', 'temps réel', 'INST', 'SCT Inst', 'SIC IP'],
    },
    seeAlso: ['sct-inst', 'ipr', 'tips', 'sic-ip', 'wero', 'payconiq', 'swish', 'blik', 'pix', 'upi', 'ach'],
    links: [
      { label: 'SCT Inst', href: '/standards/sct-inst' },
      { label: 'SIC IP flow', href: '/flows/sic-ip-instant' },
    ],
  }),
  g('a2a-overlay', 'A2A overlay', 'scheme', { en: 'A2A overlay', fr: 'Overlay A2A' }, {
    en: 'Retail account-to-account overlay: wallet UX (intent, alias proxy, status) on top of an instant rail. Samples: Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Distinct from Pix/UPI (the scheme is the rail), SCT Inst checkout, PISP A2A (TrueLayer-style XS2A), and digital wallets (PayPal, Alipay, Apple Pay).',
    fr: 'Overlay compte-à-compte retail : UX wallet (intent, proxy alias, statut) au-dessus d’un rail instantané. Exemples : Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Distinct de Pix/UPI (le schéma est le rail), du checkout SCT Inst, du PISP A2A (XS2A style TrueLayer) et des wallets numériques (PayPal, Alipay, Apple Pay).',
  }, {
    aliases: {
      en: ['A2A overlay', 'retail A2A scheme', 'A2A wallet overlay'],
      fr: ['overlay A2A', 'schéma A2A retail', 'wallet A2A'],
    },
    seeAlso: ['wero', 'a2a', 'ip', 'sct-inst', 'payconiq', 'ideal', 'bizum', 'twint', 'blik', 'swish', 'vipps-mobilepay', 'pix', 'upi', 'pisp-a2a', 'paypal'],
    links: [
      { label: 'Explorer (Wero sample)', href: '/payment/wero' },
    ],
  }),
  g('wero', 'Wero', 'scheme', { en: 'Wero (European Payments Initiative)', fr: 'Wero (European Payments Initiative)' }, {
    en: 'Pan-European A2A overlay sample from EPI. The wallet UX (proxy alias, merchant intent, status) sits on top; settlement still lands on instant rails such as SCT Inst. Same pattern as Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay, TWINT. Debug both the scheme status and the underlying pacs.002.',
    fr: 'Exemple d’overlay A2A paneuropéen (EPI). L’UX wallet (alias proxy, intent commerçant, statut) est au-dessus ; le règlement reste sur des rails instantanés tels que SCT Inst. Même schéma que Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay, TWINT. Déboguez à la fois le statut schéma et le pacs.002 sous-jacent.',
  }, {
    aliases: { en: ['Wero', 'EPI', 'European Payments Initiative', 'EPI wallet'], fr: ['Wero', 'EPI', 'European Payments Initiative', 'portefeuille EPI'] },
    seeAlso: ['a2a-overlay', 'a2a', 'ip', 'sct-inst', 'payconiq', 'epi', 'visa', 'mastercard', 'paypal'],
    links: [
      { label: 'A2A overlay explorer', href: '/payment/wero' },
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
    seeAlso: ['bancontact', 'wero', 'a2a', 'a2a-overlay', 'ip', 'sct-inst'],
    links: [{ label: 'Interop map', href: '/map' }],
  }),
  g('card-scheme', 'Card scheme', 'scheme', { en: 'Card scheme', fr: 'Schéma carte' }, {
    en: 'Network that sets the rules for card payments: PAN BIN ranges, authorisation, clearing and settlement between issuer and acquirer. Four-party schemes (Visa, Mastercard, UnionPay, CB) sit between issuer and acquirer; three-party schemes (Amex, some Discover) are issuer and acquirer of record. Distinct vocabulary from ISO 20022 pacs.',
    fr: 'Réseau qui fixe les règles des paiements par carte : BIN du PAN, autorisation, compensation et règlement entre émetteur et acquéreur. Les schémas à quatre parties (Visa, Mastercard, UnionPay, CB) s’intercalent entre émetteur et acquéreur ; les schémas à trois parties (Amex, parfois Discover) sont émetteur et acquéreur. Vocabulaire distinct des pacs ISO 20022.',
  }, {
    aliases: {
      en: ['card network', 'card brand', 'four-party scheme', 'three-party scheme'],
      fr: ['réseau carte', 'schéma de cartes', 'schéma à quatre parties', 'schéma à trois parties'],
    },
    seeAlso: ['visa', 'mastercard', 'amex', 'cartes-bancaires', 'unionpay', '3ds', 'cbpii', 'pan', 'bin'],
    links: [{ label: 'Card payment', href: '/payment/card-payment' }],
  }),
  g('visa', 'Visa', 'scheme', { en: 'Visa', fr: 'Visa' }, {
    en: 'Global four-party card scheme (credit, debit, prepaid). Authorisation, clearing and settlement run on VisaNet; consumer brands include Visa Debit and historically V PAY in Europe. EMV 3-D Secure is the usual SCA path at checkout. Distinct from A2A schemes such as Wero or SCT Inst.',
    fr: 'Schéma carte mondial à quatre parties (crédit, débit, prepaid). Autorisation, compensation et règlement sur VisaNet ; marques grand public dont Visa Debit et, historiquement, V PAY en Europe. EMV 3-D Secure est le chemin SCA habituel en checkout. Distinct des schémas A2A tels que Wero ou SCT Inst.',
  }, {
    aliases: { en: ['Visa', 'Visa Debit', 'VisaNet', 'V PAY', 'VPAY'], fr: ['Visa', 'Visa Debit', 'VisaNet', 'V PAY'] },
    seeAlso: ['card-scheme', 'mastercard', 'amex', 'cartes-bancaires', '3ds', 'apple-pay'],
    links: [{ label: 'Card payment', href: '/payment/card-payment' }],
  }),
  g('mastercard', 'Mastercard', 'scheme', { en: 'Mastercard', fr: 'Mastercard' }, {
    en: 'Global four-party card scheme (credit, debit, prepaid). Maestro is the historic debit brand in several European markets. Clearing via the Mastercard network; 3-D Secure at e-commerce. Do not confuse the card scheme with Mastercard Open Finance US (Data Connect) in this glossary.',
    fr: 'Schéma carte mondial à quatre parties (crédit, débit, prepaid). Maestro est la marque débit historique dans plusieurs marchés européens. Compensation via le réseau Mastercard ; 3-D Secure en e-commerce. Ne pas confondre le schéma carte avec Mastercard Open Finance US (Data Connect) dans ce glossaire.',
  }, {
    aliases: { en: ['Mastercard', 'MasterCard', 'Maestro', 'Mastercard Debit'], fr: ['Mastercard', 'Maestro', 'Mastercard Debit'] },
    seeAlso: ['card-scheme', 'visa', 'amex', 'cartes-bancaires', '3ds', 'data-connect', 'curve'],
    links: [{ label: 'Card payment', href: '/payment/card-payment' }],
  }),
  g('amex', 'Amex', 'scheme', { en: 'American Express', fr: 'American Express' }, {
    en: 'Mostly three-party card scheme: American Express is typically both issuer and acquirer of record, with a closed network and a merchant-acquiring arm. Cards still use EMV and 3-D Secure; PAN ranges and settlement are not Visa/Mastercard. Often listed separately in PSP checkout because of different fees and acceptance.',
    fr: 'Schéma carte surtout à trois parties : American Express est en général à la fois émetteur et acquéreur, réseau fermé plus une branche acquiring. Les cartes restent EMV et 3-D Secure ; les BIN et le règlement ne sont pas Visa/Mastercard. Souvent une option à part en checkout PSP (frais et acceptation différents).',
  }, {
    aliases: { en: ['American Express', 'Amex', 'AMEX'], fr: ['American Express', 'Amex', 'AMEX'] },
    seeAlso: ['card-scheme', 'visa', 'mastercard', 'discover', '3ds'],
  }),
  g('cartes-bancaires', 'CB', 'scheme', { en: 'Cartes Bancaires', fr: 'Cartes Bancaires' }, {
    en: 'French domestic four-party card scheme (Groupement des Cartes Bancaires CB). Most French debit cards are co-badged CB + Visa or CB + Mastercard: domestic acquiring often prefers the CB rail; cross-border uses the international brand. Interoperates with Paylib for wallet use cases.',
    fr: 'Schéma carte domestique français à quatre parties (Groupement des Cartes Bancaires CB). La plupart des cartes de débit françaises sont co-badgées CB + Visa ou CB + Mastercard : l’acquiring domestique privilégie souvent le rail CB ; le transfrontalier passe par la marque internationale. Interopère avec Paylib côté wallet.',
  }, {
    aliases: {
      en: ['CB', 'Cartes Bancaires', 'Groupement des Cartes Bancaires', 'Paylib'],
      fr: ['CB', 'Cartes Bancaires', 'Groupement des Cartes Bancaires CB', 'carte bleue', 'Paylib'],
    },
    seeAlso: ['visa', 'mastercard', 'card-scheme', '3ds', 'stet'],
  }),
  g('unionpay', 'UnionPay', 'scheme', { en: 'UnionPay', fr: 'UnionPay' }, {
    en: 'Chinese four-party card scheme (China UnionPay), widely accepted in Asia and at many European acquirers for inbound travel spend. Brand also appears as UnionPay QuickPass for contactless.',
    fr: 'Schéma carte chinois à quatre parties (China UnionPay), largement accepté en Asie et chez beaucoup d’acquéreurs européens pour les dépenses de voyage. Marque aussi UnionPay QuickPass en sans contact.',
  }, {
    aliases: { en: ['UnionPay', 'China UnionPay', 'CUP', 'QuickPass'], fr: ['UnionPay', 'China UnionPay', 'CUP', 'QuickPass'] },
    seeAlso: ['card-scheme', 'visa', 'alipay', 'wechat-pay'],
  }),
  g('jcb', 'JCB', 'scheme', { en: 'JCB', fr: 'JCB' }, {
    en: 'Japanese card scheme (Japan Credit Bureau), accepted internationally via alliances with other networks. Common as a checkout brand alongside Visa, Mastercard and Amex for inbound Japanese cards.',
    fr: 'Schéma carte japonais (Japan Credit Bureau), accepté à l’international via des alliances. Marque de checkout fréquente à côté de Visa, Mastercard et Amex pour les cartes japonaises.',
  }, {
    aliases: { en: ['JCB', 'Japan Credit Bureau'], fr: ['JCB', 'Japan Credit Bureau'] },
    seeAlso: ['card-scheme', 'visa', 'amex'],
  }),
  g('discover', 'Discover', 'scheme', { en: 'Discover', fr: 'Discover' }, {
    en: 'US card network (Discover Financial). Diners Club is under the same group for many international acceptance marks. Three-party roots; in Europe often processed through partner networks rather than a local Discover issuing base.',
    fr: 'Réseau carte US (Discover Financial). Diners Club est dans le même groupe pour beaucoup de marques d’acceptation internationales. Racines à trois parties ; en Europe souvent traité via des réseaux partenaires plutôt que par une base d’émission Discover locale.',
  }, {
    aliases: { en: ['Discover', 'Diners Club', 'Diners'], fr: ['Discover', 'Diners Club', 'Diners'] },
    seeAlso: ['card-scheme', 'amex', 'visa'],
  }),
  g('apple-pay', 'Apple Pay', 'scheme', { en: 'Apple Pay', fr: 'Apple Pay' }, {
    en: 'Device wallet: the PAN is tokenised (DPAN) and the token rides an existing card scheme (Visa, Mastercard, Amex, CB…). Not an A2A rail. SCA is typically device biometrics plus the scheme’s 3-D Secure or token cryptogram.',
    fr: 'Wallet appareil : le PAN est tokénisé (DPAN) et le jeton circule sur un schéma carte existant (Visa, Mastercard, Amex, CB…). Pas un rail A2A. La SCA est en général biométrie appareil plus 3-D Secure du schéma ou cryptogramme du jeton.',
  }, {
    aliases: { en: ['Apple Pay', 'ApplePay'], fr: ['Apple Pay', 'ApplePay'] },
    seeAlso: ['google-pay', 'visa', 'mastercard', 'amex', 'cartes-bancaires', '3ds', 'curve', 'paypal', 'a2a-overlay'],
    links: [{ label: 'Digital Wallet explorer', href: '/payment/paypal' }],
  }),
  g('google-pay', 'Google Pay', 'scheme', { en: 'Google Pay', fr: 'Google Pay' }, {
    en: 'Google wallet for cards (and in some markets bank accounts). Like Apple Pay, card credentials are tokenised onto Visa/Mastercard/Amex rails rather than moving as a pacs credit transfer.',
    fr: 'Wallet Google pour cartes (et dans certains marchés des comptes bancaires). Comme Apple Pay, les credentials carte sont tokénisés sur les rails Visa/Mastercard/Amex plutôt que de circuler en virement pacs.',
  }, {
    aliases: { en: ['Google Pay', 'GPay', 'GooglePay'], fr: ['Google Pay', 'GPay', 'GooglePay'] },
    seeAlso: ['apple-pay', 'visa', 'mastercard', 'paypal'],
  }),
  g('paypal', 'PayPal', 'scheme', { en: 'PayPal', fr: 'PayPal' }, {
    en: 'Third-party wallet / PSP: the customer pays from a PayPal balance, a linked card or a bank account. The merchant sees a PSP or a card token — not an A2A overlay. Funding may still hit card schemes or A2A behind the wallet; merchant payout is often a later credit transfer.',
    fr: 'Wallet / PSP tiers : le client paie depuis un solde PayPal, une carte liée ou un compte. Le commerçant voit un PSP ou un jeton carte — pas un overlay A2A. Le funding peut quand même taper schémas carte ou A2A derrière le wallet ; le paiement commerçant est souvent un virement plus tard.',
  }, {
    aliases: { en: ['PayPal', 'Pay Pal'], fr: ['PayPal'] },
    seeAlso: ['visa', 'mastercard', 'wero', 'a2a', 'a2a-overlay', 'emi', 'curve', 'alipay', 'apple-pay'],
    links: [{ label: 'Digital Wallet explorer', href: '/payment/paypal' }],
  }),
  g('curve', 'Curve', 'scheme', { en: 'Curve', fr: 'Curve' }, {
    en: 'Third-party card overlay (card-on-card): Curve issues a Mastercard PAN in front of the payer’s existing cards. The merchant authorizes Curve; Curve then authorizes the selected underlying card. Close to a CBPII / third-party issuer pattern, not an A2A wallet like Wero or PayPal.',
    fr: 'Overlay carte tiers (carte-sur-carte) : Curve émet un PAN Mastercard devant les cartes existantes du payeur. Le commerçant autorise Curve ; Curve autorise ensuite la carte sous-jacente choisie. Proche d’un CBPII / émetteur tiers, pas un wallet A2A comme Wero ou PayPal.',
  }, {
    aliases: { en: ['Curve', 'Curve card', 'card-on-card'], fr: ['Curve', 'carte Curve', 'carte-sur-carte'] },
    seeAlso: ['mastercard', 'card-scheme', 'cbpii', 'third-party-issuer', 'paypal', 'apple-pay'],
    links: [{ label: 'Card Overlay explorer', href: '/payment/curve' }],
  }),
  g('alipay', 'Alipay', 'scheme', { en: 'Alipay', fr: 'Alipay' }, {
    en: 'Ant Group wallet dominant in mainland China (QR, in-app). European acquirers offer it for inbound Chinese spend; settlement to the merchant is usually in local currency via an acquirer, not a SEPA pacs from the consumer.',
    fr: 'Wallet Ant Group dominant en Chine continentale (QR, in-app). Les acquéreurs européens le proposent pour la dépense chinoise inbound ; le règlement commerçant est en général en devise locale via un acquéreur, pas un pacs SEPA depuis le consommateur.',
  }, {
    aliases: { en: ['Alipay', 'Alipay+', 'Ant Group'], fr: ['Alipay', 'Alipay+', 'Ant Group'] },
    seeAlso: ['wechat-pay', 'unionpay', 'paypal'],
  }),
  g('wechat-pay', 'WeChat Pay', 'scheme', { en: 'WeChat Pay', fr: 'WeChat Pay' }, {
    en: 'Tencent wallet inside WeChat (Weixin). Same inbound-travel pattern as Alipay at European merchants: QR or in-app, acquired locally, not SCT.',
    fr: 'Wallet Tencent dans WeChat (Weixin). Même schéma de voyage inbound qu’Alipay chez les commerçants européens : QR ou in-app, acquired localement, pas du SCT.',
  }, {
    aliases: { en: ['WeChat Pay', 'Weixin Pay', 'WeChat'], fr: ['WeChat Pay', 'Weixin Pay', 'WeChat'] },
    seeAlso: ['alipay', 'unionpay', 'paypal'],
  }),
  g('bancontact', 'Bancontact', 'scheme', { en: 'Bancontact', fr: 'Bancontact' }, {
    en: 'Belgian domestic debit scheme (historically Bancontact/Mister Cash). Cards are often co-badged with Maestro or Visa Debit. Payconiq by Bancontact is the QR / mobile A2A brand on top of Belgian accounts.',
    fr: 'Schéma de débit belge (historiquement Bancontact/Mister Cash). Cartes souvent co-badgées Maestro ou Visa Debit. Payconiq by Bancontact est la marque QR / mobile A2A au-dessus des comptes belges.',
  }, {
    aliases: { en: ['Bancontact', 'Mister Cash', 'Bancontact/Mister Cash'], fr: ['Bancontact', 'Mister Cash'] },
    seeAlso: ['payconiq', 'ideal', 'visa', 'mastercard', 'a2a'],
  }),
  g('ideal', 'iDEAL', 'scheme', { en: 'iDEAL', fr: 'iDEAL' }, {
    en: 'Dutch account-to-account checkout scheme: the PSU is redirected to their bank to authorise a credit transfer to the merchant. Now operated in the EPI/Wero orbit for the Netherlands, still the default Dutch e-commerce rail.',
    fr: 'Schéma de checkout compte-à-compte néerlandais : le PSU est redirigé vers sa banque pour autoriser un virement vers le commerçant. Désormais dans l’orbite EPI/Wero pour les Pays-Bas, toujours le rail e-commerce néerlandais par défaut.',
  }, {
    aliases: { en: ['iDEAL', 'iDeal', 'ideal'], fr: ['iDEAL', 'iDeal'] },
    seeAlso: ['wero', 'epi', 'bancontact', 'a2a', 'a2a-overlay', 'sct-inst'],
  }),
  g('twint', 'TWINT', 'scheme', { en: 'TWINT', fr: 'TWINT' }, {
    en: 'Swiss mobile A2A / wallet scheme. P2P and merchant QR; funding from Swiss bank accounts, with settlement in the SIC world rather than SEPA. Dominant domestic alternative to cards in Switzerland.',
    fr: 'Schéma suisse mobile A2A / wallet. P2P et QR commerçant ; funding depuis des comptes suisses, règlement dans le monde SIC plutôt que SEPA. Alternative domestique dominante aux cartes en Suisse.',
  }, {
    aliases: { en: ['TWINT', 'Twint'], fr: ['TWINT', 'Twint'] },
    seeAlso: ['sic', 'sic-ip', 'wero', 'a2a', 'a2a-overlay', 'paypal'],
  }),
  g('swish', 'Swish', 'scheme', { en: 'Swish', fr: 'Swish' }, {
    en: 'Swedish mobile P2P and merchant payments on Bankgirot / instant Swedish rails, addressed by phone number. The Nordic pattern that Vipps MobilePay and Wero also chase: alias + instant A2A.',
    fr: 'Paiements mobiles suédois P2P et commerçant sur Bankgirot / rails instantanés suédois, adressés par numéro de téléphone. Le modèle nordique que Vipps MobilePay et Wero visent aussi : alias + A2A instantané.',
  }, {
    aliases: { en: ['Swish'], fr: ['Swish'] },
    seeAlso: ['vipps-mobilepay', 'wero', 'a2a', 'a2a-overlay', 'ip'],
  }),
  g('vipps-mobilepay', 'Vipps MobilePay', 'scheme', { en: 'Vipps MobilePay', fr: 'Vipps MobilePay' }, {
    en: 'Merged Nordic mobile wallet (Vipps in Norway, MobilePay in Denmark and Finland). P2P and checkout on local instant / account rails, not card schemes.',
    fr: 'Wallet mobile nordique fusionné (Vipps en Norvège, MobilePay au Danemark et en Finlande). P2P et checkout sur rails instantanés / compte locaux, pas sur schémas carte.',
  }, {
    aliases: { en: ['Vipps', 'MobilePay', 'Vipps MobilePay'], fr: ['Vipps', 'MobilePay', 'Vipps MobilePay'] },
    seeAlso: ['swish', 'wero', 'a2a', 'a2a-overlay', 'ip'],
  }),
  g('blik', 'BLIK', 'scheme', { en: 'BLIK', fr: 'BLIK' }, {
    en: 'Polish mobile payments: a short-lived code (or in-app confirm) debits the PSU’s bank account. Standard at Polish e-commerce and ATMs; A2A rather than card.',
    fr: 'Paiements mobiles polonais : un code éphémère (ou une confirmation in-app) débite le compte du PSU. Standard de l’e-commerce et des DAB polonais ; de l’A2A plutôt que de la carte.',
  }, {
    aliases: { en: ['BLIK', 'Blik'], fr: ['BLIK', 'Blik'] },
    seeAlso: ['a2a', 'a2a-overlay', 'ip', 'wero', 'ideal'],
  }),
  g('bizum', 'Bizum', 'scheme', { en: 'Bizum', fr: 'Bizum' }, {
    en: 'Spanish P2P and merchant payments via mobile number, settled between participating banks (instant where the rail allows). The Spanish household name for A2A, analogous to Wero/Payconiq elsewhere.',
    fr: 'Paiements P2P et commerçant espagnols via numéro de mobile, réglés entre banques participantes (instantané selon le rail). Le nom usuel de l’A2A en Espagne, analogue à Wero/Payconiq ailleurs.',
  }, {
    aliases: { en: ['Bizum'], fr: ['Bizum'] },
    seeAlso: ['wero', 'a2a', 'a2a-overlay', 'sct-inst', 'payconiq'],
  }),
  g('pix', 'Pix', 'scheme', { en: 'Pix', fr: 'Pix' }, {
    en: 'Brazilian instant payment scheme run by the central bank (BCB). Alias keys (CPF, phone, email, random) resolve to an account; settlement in seconds, 24/7. The scheme is the retail product — not an overlay on SCT Inst. Sample of Instant A2A alongside UPI.',
    fr: 'Schéma de paiement instantané brésilien opéré par la banque centrale (BCB). Des alias (CPF, téléphone, e-mail, clé aléatoire) résolvent vers un compte ; règlement en secondes, 24/7. Le schéma est le produit retail — pas un overlay sur SCT Inst. Exemple d’A2A instantané avec UPI.',
  }, {
    aliases: { en: ['Pix', 'PIX', 'Pix SPI', 'SPI'], fr: ['Pix', 'PIX', 'Pix SPI', 'SPI'] },
    seeAlso: ['upi', 'ip', 'a2a', 'sct-inst', 'a2a-overlay', 'instant-a2a'],
    links: [{ label: 'Instant A2A explorer', href: '/payment/instant-a2a' }],
  }),
  g('upi', 'UPI', 'scheme', { en: 'Unified Payments Interface', fr: 'Unified Payments Interface' }, {
    en: 'Indian instant A2A scheme (NPCI). VPA aliases (name@bank) and QR via apps such as PhonePe, Google Pay India and Paytm. The scheme is the retail product — not an overlay on SCT Inst. Sample of Instant A2A alongside Pix.',
    fr: 'Schéma A2A instantané indien (NPCI). Alias VPA (nom@banque) et QR via des apps telles que PhonePe, Google Pay India et Paytm. Le schéma est le produit retail — pas un overlay sur SCT Inst. Exemple d’A2A instantané avec Pix.',
  }, {
    aliases: { en: ['UPI', 'Unified Payments Interface', 'NPCI', 'VPA'], fr: ['UPI', 'Unified Payments Interface', 'NPCI', 'VPA'] },
    seeAlso: ['pix', 'google-pay', 'ip', 'a2a', 'a2a-overlay', 'instant-a2a', 'vpa'],
    links: [{ label: 'Instant A2A explorer', href: '/payment/instant-a2a' }],
  }),
  g('instant-a2a', 'Instant A2A', 'scheme', { en: 'Instant A2A scheme', fr: 'Schéma A2A instantané' }, {
    en: 'Domestic instant payment where the scheme is the retail product: alias + 24/7 settlement. Samples: Pix (BR), UPI (IN). Not an overlay on SCT Inst (that pattern is Wero/Bizum).',
    fr: 'Paiement instantané domestique où le schéma est le produit retail : alias + règlement 24/7. Exemples : Pix (BR), UPI (IN). Pas un overlay sur SCT Inst (ce modèle est Wero/Bizum).',
  }, {
    aliases: { en: ['Instant A2A', 'instant A2A scheme'], fr: ['A2A instantané', 'schéma A2A instantané'] },
    seeAlso: ['pix', 'upi', 'a2a', 'ip', 'sct-inst', 'a2a-overlay'],
    links: [{ label: 'Explorer', href: '/payment/instant-a2a' }],
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
    seeAlso: ['pis', 'tpp', 'aspsp', 'aisp', 'cbpii', 'psd2', 'pisp-a2a', 'a2a'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
    links: [{ label: 'PISP A2A explorer', href: '/payment/pisp-a2a' }],
  }),
  g('pisp-a2a', 'PISP A2A', 'concept', { en: 'PISP A2A', fr: 'PISP A2A' }, {
    en: 'Account-to-account checkout initiated by a TPP over XS2A (PSD2 PIS), e.g. TrueLayer-style pay-by-bank. Not a bank-consortium overlay: the PISP does not run a proxy directory or scheme status; the ASPSP still settles SCT or SCT Inst.',
    fr: 'Checkout compte-à-compte initié par un TPP via XS2A (PIS PSD2), ex. pay-by-bank style TrueLayer. Pas un overlay de consortium bancaire : le PISP n’opère pas d’annuaire proxy ni de statut schéma ; l’ASPSP règle toujours en SCT ou SCT Inst.',
  }, {
    aliases: { en: ['PISP A2A', 'pay by bank', 'TrueLayer', 'open banking A2A'], fr: ['PISP A2A', 'paiement bancaire', 'TrueLayer', 'A2A open banking'] },
    seeAlso: ['pisp', 'pis', 'a2a', 'a2a-overlay', 'sct-inst', 'xs2a'],
    links: [{ label: 'Explorer', href: '/payment/pisp-a2a' }],
  }),
  g('cbpii', 'CBPII', 'concept', { en: 'Card Based Payment Instrument Issuer', fr: 'Émetteur d’instrument de paiement fondé sur une carte' }, {
    en: 'PSP that issues card-based instruments which can pull funds from a payment account at another PSP. Uses PIIS / funds confirmation. eIDAS role PSP_IC. Bundesbank calls this a third-party issuer: the card issuer is not the institution that holds the payer’s account.',
    fr: 'PSP qui émet des instruments fondés sur une carte pouvant débiter un compte de paiement chez un autre PSP. Utilise le PIIS / la confirmation de fonds. Rôle eIDAS PSP_IC. La Bundesbank parle d’émetteur tiers : l’émetteur de la carte n’est pas l’établissement qui tient le compte du payeur.',
  }, {
    aliases: {
      en: ['Card Based Payment Instrument Issuer', 'card-based payment instrument issuer', 'third-party issuer'],
      fr: ['émetteur d’instrument de paiement fondé sur une carte', 'CBPII', 'émetteur tiers'],
    },
    seeAlso: ['piis', 'psp', 'tpp', 'caf', 'third-party-issuer', 'curve'],
    sources: ['ukob', 'konsentus', 'bundesbank'],
  }),
  g('third-party-issuer', 'Third-party issuer', 'concept', { en: 'Third-party issuer', fr: 'Émetteur tiers' }, {
    en: 'Bundesbank PSD2 term for a payment-card issuer that does not hold the account to be debited. In XS2A language that is a CBPII, using PIIS / funds confirmation against the ASPSP.',
    fr: 'Terme PSD2 de la Bundesbank pour un émetteur de carte qui ne tient pas le compte à débiter. En langage XS2A, c’est un CBPII, qui utilise le PIIS / la confirmation de fonds auprès de l’ASPSP.',
  }, {
    aliases: { en: ['third party issuer', 'third-party card issuer'], fr: ['émetteur tiers', 'émetteur de carte tiers'] },
    seeAlso: ['cbpii', 'piis', 'tpp', 'aspsp', 'curve'],
    sources: ['bundesbank'],
  }),
  g('aspsp', 'ASPSP', 'concept', { en: 'Account Servicing Payment Service Provider', fr: 'Prestataire de services de paiement gestionnaire de compte' }, {
    en: 'PSP that provides and maintains a payment account for the payer — typically the bank. In Open Banking it publishes Read/Write APIs so TPPs can, with consent, read data and/or initiate payments. Under FiDA it is a Data Holder.',
    fr: 'PSP qui fournit et tient un compte de paiement pour le payeur — en pratique la banque. En Open Banking il publie des API Read/Write pour que les TPP, avec consentement, lisent les données et/ou initient des paiements. Sous FiDA, c’est un Data Holder.',
  }, {
    aliases: { en: ['Account Servicing Payment Service Provider', 'account servicing PSP', 'the bank'], fr: ['PSP gestionnaire de compte', 'ASPSP', 'la banque'] },
    seeAlso: ['psp', 'tpp', 'psu', 'data-holder', 'xs2a', 'credit-institution', 'emi', 'neobank'],
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
    seeAlso: ['psu', 'aspsp', 'tpp', 'emi', 'pi', 'credit-institution', 'psd2'],
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
    aliases: { en: ['open banking', 'Open Banking Ecosystem', 'OB'], fr: ['open banking', 'écosystème Open Banking', 'OB'] },
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
    seeAlso: ['sca', 'cbpii', 'a2a', 'visa', 'mastercard', 'amex', 'cartes-bancaires'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('psd2', 'PSD2', 'regulation', { en: 'Second Payment Services Directive', fr: 'Deuxième directive sur les services de paiement' }, {
    en: 'Directive (EU) 2015/2366: current Open Banking regime — dedicated XS2A interfaces, TPP roles, SCA. UK implemented it via the Payment Services Regulations 2017. Successor stack is PSD3 + EU PSR.',
    fr: 'Directive (UE) 2015/2366 : régime Open Banking actuel — interfaces XS2A dédiées, rôles TPP, SCA. Le Royaume-Uni l’a transposée par les Payment Services Regulations 2017. La pile successeur est PSD3 + PSR UE.',
  }, {
    aliases: { en: ['Revised Payment Services Directive', 'Payment Services Directive 2', 'Payment Services Directive', 'PSD', '2015/2366'], fr: ['DSP2', 'DSP', 'directive services de paiement 2', 'directive services de paiement'] },
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
    en: 'Controls to detect and prevent money laundering: onboarding (KYC/KYB), name and sanctions screening on payments, transaction monitoring, and reporting of suspicions. In the EU this sits with CFT as AML/CFT; in French practice the pair is LCB-FT.',
    fr: 'Dispositifs de détection et de prévention du blanchiment : onboarding (KYC/KYB), criblage nominatif et sanctions sur les paiements, surveillance des transactions, et déclarations de soupçon. En UE on parle d’AML/CFT ; en pratique française, de LCB-FT.',
  }, {
    aliases: {
      en: ['anti-money laundering', 'AML', 'AML framework', 'AML/CFT', 'money laundering', 'laundering'],
      fr: ['AML', 'lutte contre le blanchiment', 'LCB', 'LCB-FT', 'LCBFT', 'blanchiment', 'blanchiment d’argent', 'anti-blanchiment'],
    },
    seeAlso: ['cft', 'kyc', 'cdd', 'sanctions-screening', 'transaction-monitoring', 'str', 'fatf', 'amld', 'amlr'],
    sources: ['konsentus'],
  }),
  g('cft', 'CFT', 'regulation', { en: 'Counter-Financing of Terrorism', fr: 'Lutte contre le financement du terrorisme' }, {
    en: 'Terrorist-financing controls, usually paired with AML in PSP compliance programmes. Screening covers listed persons, entities and, where required, related payment corridors.',
    fr: 'Contrôles du financement du terrorisme, généralement couplés à l’AML dans les programmes de conformité PSP. Le criblage couvre personnes et entités listées et, le cas échéant, les corridors de paiement concernés.',
  }, {
    aliases: {
      en: ['counter-terrorist financing', 'CTF', 'CFT/AML', 'terrorist financing'],
      fr: ['lutte contre le financement du terrorisme', 'LFT', 'FT', 'financement du terrorisme'],
    },
    seeAlso: ['aml', 'kyc', 'sanctions-screening', 'embargo', 'fatf'],
    sources: ['konsentus'],
  }),
  g('kyc', 'KYC', 'concept', { en: 'Know Your Customer / Business', fr: 'Connaissance du client / de l’entreprise' }, {
    en: 'Identity-verification processes for onboarding PSUs and, for KYB, firms (TPP accreditation, directory listings). Often requires LEI for legal entities. Feeds CDD and later name screening on payments.',
    fr: 'Vérification d’identité à l’onboarding des PSU et, pour le KYB, des sociétés (accréditation TPP, annuaires). Souvent un LEI pour les personnes morales. Alimente la vigilance clientèle et le criblage nominatif des paiements.',
  }, {
    aliases: { en: ['Know Your Customer', 'Know Your Business', 'KYB', 'KYC/KYB'], fr: ['connaissance du client', 'KYB', 'KYC'] },
    seeAlso: ['lei', 'aml', 'tpp', 'cdd', 'ubo', 'pep'],
    sources: ['konsentus', 'ravelin'],
  }),
  g('cdd', 'CDD', 'concept', { en: 'Customer Due Diligence', fr: 'Vigilance à l’égard de la clientèle' }, {
    en: 'Ongoing identification and risk assessment of the customer: identity, nature of the relationship, expected activity, and beneficial owners. Higher-risk cases (PEP, high-risk country, correspondent banking) trigger enhanced due diligence (EDD); low-risk cases may use simplified due diligence (SDD).',
    fr: 'Identification et évaluation du risque client en continu : identité, nature de la relation, activité attendue, bénéficiaires effectifs. Les cas à risque élevé (PPE, pays à risque, banque correspondante) déclenchent une vigilance renforcée (EDD) ; le risque faible peut rester en vigilance simplifiée (SDD).',
  }, {
    aliases: {
      en: ['customer due diligence', 'enhanced due diligence', 'EDD', 'simplified due diligence', 'SDD'],
      fr: ['vigilance à l’égard de la clientèle', 'devoir de vigilance', 'vigilance renforcée', 'EDD', 'vigilance simplifiée'],
    },
    seeAlso: ['kyc', 'ubo', 'pep', 'aml', 'correspondent-banking'],
  }),
  g('ubo', 'UBO', 'concept', { en: 'Ultimate Beneficial Owner', fr: 'Bénéficiaire effectif' }, {
    en: 'Natural person who ultimately owns or controls a legal entity (typically ≥25% ownership or control by other means). KYB/CDD must identify UBOs; EU member states keep beneficial-ownership registers used in AML checks.',
    fr: 'Personne physique qui possède ou contrôle in fine une personne morale (souvent ≥25 % du capital ou contrôle par d’autres moyens). Le KYB/CDD doit identifier les bénéficiaires effectifs ; les États membres tiennent des registres exploités dans les contrôles LCB-FT.',
  }, {
    aliases: {
      en: ['ultimate beneficial owner', 'beneficial owner', 'BO'],
      fr: ['bénéficiaire effectif', 'BE', 'bénéficiaire ultime', 'registre des bénéficiaires effectifs'],
    },
    seeAlso: ['kyc', 'cdd', 'aml', 'lei'],
  }),
  g('pep', 'PEP', 'concept', { en: 'Politically Exposed Person', fr: 'Personne politiquement exposée' }, {
    en: 'Individual entrusted with a prominent public function, plus often family members and close associates. PEP status is not a ban: it raises residual risk and typically requires EDD, senior approval and closer transaction monitoring.',
    fr: 'Personne exerçant une fonction publique importante, plus souvent les membres de la famille et les proches. Le statut PPE n’est pas une interdiction : il relève le risque résiduel et impose en général une vigilance renforcée, un visa hiérarchique et une surveillance plus serrée des flux.',
  }, {
    aliases: {
      en: ['politically exposed person', 'PEP list', 'RCA', 'close associate'],
      fr: ['personne politiquement exposée', 'PPE', 'liste PPE', 'proche d’une PPE'],
    },
    seeAlso: ['cdd', 'name-screening', 'watchlist', 'aml', 'transaction-monitoring'],
  }),
  g('sanctions-screening', 'Sanctions screening', 'concept', { en: 'Sanctions screening', fr: 'Criblage sanctions' }, {
    en: 'Real-time or batch check of parties and payment messages (SWIFT MT/MX, pacs, names, BICs, countries) against sanctions, embargo and internal lists before the payment is released. A hit typically holds the message for compliance review (four-eyes release or reject). False positives are expected; never auto-retry a regulatory reject (e.g. RR04).',
    fr: 'Contrôle temps réel ou par lot des parties et des messages de paiement (SWIFT MT/MX, pacs, noms, BIC, pays) contre les listes de sanctions, d’embargo et internes, avant libération du paiement. Un hit met en général le message en attente pour revue conformité (libération en double contrôle ou rejet). Les faux positifs sont attendus ; ne jamais relancer automatiquement un rejet réglementaire (ex. RR04).',
  }, {
    aliases: {
      en: [
        'sanctions filtering',
        'payment filtering',
        'message filtering',
        'AML filtering',
        'watchlist screening',
        'list screening',
      ],
      fr: [
        'filtrage sanctions',
        'filtrage des paiements',
        'filtrage des messages',
        'criblage LCB-FT',
        'filtrage AML',
        'criblage listes',
      ],
    },
    seeAlso: ['watchlist', 'name-screening', 'embargo', 'ofac', 'aml', 'cft', 'pep', 'rr04'],
  }),
  g('watchlist', 'Watchlist', 'concept', { en: 'Watchlist', fr: 'Liste de surveillance' }, {
    en: 'Curated lists used by screening engines: UN, EU, OFAC and other national sanctions, PEP and adverse-media lists, plus the institution’s own blacklist/whitelist. Quality of list updates and fuzzy-match thresholds drive hit volume.',
    fr: 'Listes alimentant les moteurs de criblage : ONU, UE, OFAC et autres sanctions nationales, listes PPE et de presse négative, plus listes noires/blanches internes. La fraîcheur des mises à jour et les seuils de rapprochement flou déterminent le volume de hits.',
  }, {
    aliases: {
      en: ['watch list', 'sanctions list', 'blacklist', 'whitelist', 'denied party list'],
      fr: ['liste de surveillance', 'liste de sanctions', 'liste noire', 'liste blanche', 'parties interdites'],
    },
    seeAlso: ['sanctions-screening', 'name-screening', 'pep', 'ofac', 'embargo'],
  }),
  g('name-screening', 'Name screening', 'concept', { en: 'Name screening', fr: 'Criblage nominatif' }, {
    en: 'Matching customer and payment-party names (and often addresses, dates of birth, BIC) against watchlists. Uses exact and fuzzy algorithms; alert queues are triaged as true hit, false positive or needs investigation. Distinct from VoP, which only checks name vs IBAN holder.',
    fr: 'Appariement des noms clients et des parties au paiement (et souvent adresses, dates de naissance, BIC) contre les watchlists. Algorithmes exacts et flous ; les files d’alertes sont tranchées en hit avéré, faux positif ou à investiguer. Distinct de la VoP, qui ne compare que le nom au titulaire de l’IBAN.',
  }, {
    aliases: {
      en: ['name matching', 'fuzzy matching', 'customer screening', 'party screening'],
      fr: ['criblage de noms', 'rapprochement flou', 'criblage client', 'criblage des parties'],
    },
    seeAlso: ['sanctions-screening', 'watchlist', 'pep', 'vop', 'aml'],
  }),
  g('transaction-monitoring', 'Transaction monitoring', 'concept', { en: 'Transaction monitoring', fr: 'Surveillance des transactions' }, {
    en: 'Rules and models that look at payment behaviour after onboarding: unusual amounts, structuring, high-risk corridors, rapid in-and-out, deviation from the expected KYC profile. Alerts feed investigation and, if needed, a suspicious-transaction report. Complements pre-release sanctions filtering.',
    fr: 'Règles et modèles qui observent le comportement des paiements après l’onboarding : montants atypiques, fractionnement, corridors à risque, allers-retours rapides, écart au profil KYC. Les alertes alimentent l’investigation puis, si besoin, une déclaration de soupçon. Complète le filtrage sanctions avant libération.',
  }, {
    aliases: {
      en: ['TM', 'AML monitoring', 'behavioural monitoring', 'transaction surveillance'],
      fr: ['surveillance des opérations', 'monitoring AML', 'monitoring transactionnel', 'surveillance comportementale'],
    },
    seeAlso: ['kyt', 'aml', 'str', 'kyc', 'sanctions-screening'],
  }),
  g('kyt', 'KYT', 'concept', { en: 'Know Your Transaction', fr: 'Connaissance de la transaction' }, {
    en: 'Understanding a payment in context — parties, purpose, corridor, correspondent chain — not only the customer file. Used in screening and monitoring so a technically valid pacs.008 can still be held if the pattern or a nested correspondent looks wrong.',
    fr: 'Comprendre un paiement dans son contexte — parties, motif, corridor, chaîne de correspondants — pas seulement le dossier client. Sert au criblage et à la surveillance : un pacs.008 techniquement valide peut rester bloqué si le schéma ou un correspondant imbriqué cloche.',
  }, {
    aliases: {
      en: ['Know Your Transaction', 'know-your-transaction'],
      fr: ['connaissance de la transaction', 'KYT'],
    },
    seeAlso: ['transaction-monitoring', 'sanctions-screening', 'correspondent-banking', 'aml'],
  }),
  g('str', 'STR', 'concept', { en: 'Suspicious Transaction Report', fr: 'Déclaration de soupçon' }, {
    en: 'Confidential report to the national financial intelligence unit when a payment or relationship looks like money laundering or terrorist financing. Known as SAR in some jurisdictions. Do not tip off the customer; do not retry the payment to “clear” the alert.',
    fr: 'Déclaration confidentielle à la cellule de renseignement financier lorsqu’un paiement ou une relation ressemble à du blanchiment ou du financement du terrorisme (DOS en France, vers Tracfin). Pas de tipping-off au client ; ne pas relancer le paiement pour « éteindre » l’alerte.',
  }, {
    aliases: {
      en: ['suspicious transaction report', 'suspicious activity report', 'SAR', 'SMR'],
      fr: ['déclaration de soupçon', 'DOS', 'déclaration de transactions suspectes'],
    },
    seeAlso: ['fiu', 'aml', 'cft', 'transaction-monitoring'],
  }),
  g('fiu', 'FIU', 'concept', { en: 'Financial Intelligence Unit', fr: 'Cellule de renseignement financier' }, {
    en: 'National body that receives STRs/SARs and disseminates financial-intelligence to law enforcement. In France this is Tracfin.',
    fr: 'Organisme national qui reçoit les déclarations de soupçon et diffuse le renseignement financier aux autorités. En France : Tracfin.',
  }, {
    aliases: {
      en: ['financial intelligence unit', 'FIU.net'],
      fr: ['cellule de renseignement financier', 'CRF', 'Tracfin'],
    },
    seeAlso: ['str', 'aml', 'fatf'],
  }),
  g('embargo', 'Embargo', 'regulation', { en: 'Embargo', fr: 'Embargo' }, {
    en: 'Country, sector or goods restriction that can block a payment even when no named person hits a list — e.g. dual-use goods, territorial sanctions, or a corridor that is simply not permitted. Screening engines apply country and purpose codes as well as names.',
    fr: 'Restriction pays, secteur ou marchandises qui peut bloquer un paiement même sans hit nominatif — ex. biens à double usage, sanctions territoriales, ou corridor tout simplement interdit. Les moteurs de criblage appliquent aussi codes pays et motifs, pas seulement les noms.',
  }, {
    aliases: {
      en: ['trade embargo', 'country sanctions', 'sectoral sanctions', 'dual-use'],
      fr: ['embargo commercial', 'sanctions pays', 'sanctions sectorielles', 'biens à double usage'],
    },
    seeAlso: ['sanctions-screening', 'ofac', 'cft', 'aml'],
  }),
  g('ofac', 'OFAC', 'regulation', { en: 'Office of Foreign Assets Control', fr: 'Office of Foreign Assets Control' }, {
    en: 'US Treasury office that publishes SDN and other sanctions programmes. Extra-territorial in practice for any USD or US-touching payment: correspondent banks will screen OFAC even on a euro pacs if a US dollar nostro or a US entity sits in the chain.',
    fr: 'Bureau du Trésor US qui publie la liste SDN et d’autres programmes de sanctions. Extraterritorial en pratique pour tout paiement en USD ou touchant les US : les correspondants criblent l’OFAC même sur un pacs en euro si un nostro dollar ou une entité US est dans la chaîne.',
  }, {
    aliases: {
      en: ['Office of Foreign Assets Control', 'SDN', 'OFAC SDN'],
      fr: ['OFAC', 'liste SDN', 'sanctions OFAC'],
    },
    seeAlso: ['sanctions-screening', 'watchlist', 'embargo', 'nostro', 'correspondent-banking'],
  }),
  g('fatf', 'FATF', 'regulation', { en: 'Financial Action Task Force', fr: 'GAFI' }, {
    en: 'Inter-governmental standard-setter for AML/CFT (40 Recommendations). Grey/black lists drive country risk in CDD; correspondent banks expect FATF-aligned screening and monitoring from respondents.',
    fr: 'Instance intergouvernementale qui fixe les standards LCB-FT (40 recommandations). Les listes grise/noire pèsent sur le risque pays en CDD ; les correspondants attendent des répondants un criblage et une surveillance alignés GAFI.',
  }, {
    aliases: {
      en: ['Financial Action Task Force', 'FATF Recommendations', 'grey list', 'black list'],
      fr: ['GAFI', 'Groupe d’action financière', 'liste grise', 'liste noire GAFI'],
    },
    seeAlso: ['aml', 'cft', 'amld', 'correspondent-banking', 'fiu'],
  }),
  g('amld', 'AMLD', 'regulation', { en: 'Anti-Money Laundering Directive', fr: 'Directive anti-blanchiment' }, {
    en: 'EU directives on AML/CFT (now the sixth, Directive (EU) 2024/1640) that member states transpose: CDD, UBO registers, FIU cooperation, and obligations on PSPs and crypto-asset service providers. Read together with the directly applicable AMLR.',
    fr: 'Directives UE LCB-FT (aujourd’hui la sixième, directive (UE) 2024/1640) transposées par les États membres : vigilance clientèle, registres des bénéficiaires effectifs, coopération des CRF, obligations des PSP et des prestataires crypto. À lire avec le règlement AMLR d’application directe.',
  }, {
    aliases: {
      en: ['AMLD6', '6AMLD', '6th AML Directive', 'Directive (EU) 2024/1640', 'AML directive'],
      fr: ['6e directive anti-blanchiment', 'AMLD6', 'directive (UE) 2024/1640', 'directive LCB-FT'],
    },
    seeAlso: ['amlr', 'aml', 'cdd', 'ubo', 'fiu'],
  }),
  g('amlr', 'AMLR', 'regulation', { en: 'Anti-Money Laundering Regulation', fr: 'Règlement anti-blanchiment' }, {
    en: 'Regulation (EU) 2024/1624: directly applicable EU AML/CFT rulebook (CDD, PEP, UBO, correspondent banking, internal controls). Sits beside AMLD6 and the new EU AML Authority (AMLA).',
    fr: 'Règlement (UE) 2024/1624 : corpus LCB-FT d’application directe (vigilance, PPE, bénéficiaires effectifs, banque correspondante, contrôles internes). S’articule avec AMLD6 et la nouvelle autorité européenne AMLA.',
  }, {
    aliases: {
      en: ['AML Regulation', 'Regulation (EU) 2024/1624', 'AMLA'],
      fr: ['règlement LCB-FT', 'règlement (UE) 2024/1624', 'AMLA'],
    },
    seeAlso: ['amld', 'aml', 'cdd', 'pep', 'correspondent-banking'],
  }),
  g('correspondent-banking', 'Correspondent banking', 'concept', { en: 'Correspondent banking', fr: 'Banque correspondante' }, {
    en: 'One bank (correspondent) holds accounts and executes payments for another (respondent), typically cross-border. Nested correspondent chains and cover payments are AML/CFT high-risk: you must know who sits behind the respondent and screen the whole party set, not only the next BIC.',
    fr: 'Une banque (correspondant) tient des comptes et exécute des paiements pour une autre (répondant), surtout à l’international. Les chaînes imbriquées et les cover payments sont à risque LCB-FT élevé : il faut savoir qui se trouve derrière le répondant et cribler toutes les parties, pas seulement le BIC suivant.',
  }, {
    aliases: {
      en: ['correspondent bank', 'respondent bank', 'nested correspondent', 'cover payment'],
      fr: ['banque correspondante', 'banque répondante', 'correspondant imbriqué', 'cover payment', 'paiement de couverture'],
    },
    seeAlso: ['nostro', 'vostro', 'cbpr-plus', 'swift', 'aml', 'kyt', 'sanctions-screening'],
  }),
  g('nostro', 'Nostro', 'concept', { en: 'Nostro account', fr: 'Compte nostro' }, {
    en: '“Our” account: a bank’s account held with a correspondent, in the correspondent’s books, usually in foreign currency. Used to settle cross-border credits and debits (nostro reconciliation against camt.053/054 and the correspondent’s statements). The other side of the same relationship is a vostro.',
    fr: 'Compte « nôtre » : compte d’une banque tenu chez un correspondant, dans les livres de celui-ci, souvent en devise. Sert à régler les crédits et débits transfrontières (rapprochement nostro contre camt.053/054 et relevés du correspondant). L’autre face de la même relation est un vostro.',
  }, {
    aliases: {
      en: ['nostro account', 'nostro', 'our account', 'nostro reconciliation'],
      fr: ['compte nostro', 'nostro', 'compte chez le correspondant', 'rapprochement nostro'],
    },
    seeAlso: ['vostro', 'correspondent-banking', 'cbpr-plus', 'camt-053', 'camt-054', 'ofac'],
  }),
  g('vostro', 'Vostro', 'concept', { en: 'Vostro account', fr: 'Compte vostro' }, {
    en: '“Your” account: a correspondent account you hold on your books for a respondent bank. The same account is a nostro from the respondent’s point of view. Vostro ledgers are where incoming correspondent credits land before on-payment.',
    fr: 'Compte « vôtre » : compte de correspondant que vous tenez dans vos livres pour une banque répondante. Le même compte est un nostro du point de vue du répondant. Les écritures vostro reçoivent les crédits correspondants avant réacheminement.',
  }, {
    aliases: {
      en: ['vostro account', 'vostro', 'loro', 'your account'],
      fr: ['compte vostro', 'vostro', 'loro', 'compte du correspondant'],
    },
    seeAlso: ['nostro', 'correspondent-banking', 'cbpr-plus'],
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
    en: 'Methodology and XML/JSON financial messaging standard (often shortened to ISO in this catalog). Clearing uses business areas pain, pacs, camt, acmt. ISO and SWIFT publish successive XSD revisions of the same message (pacs.008.001.08 → .10 → .13); each market pins one via a usage guideline (EPC SEPA, CBPR+, Swiss SPS…). The Document xmlns must match that XSD. On SWIFT the ISO 20022 payloads are called MX (vs legacy MT).',
    fr: 'Méthodologie et standard de messagerie financière XML/JSON (souvent abrégé ISO dans ce catalogue). La compensation utilise les domaines pain, pacs, camt, acmt. L’ISO et SWIFT publient des révisions XSD successives du même message (pacs.008.001.08 → .10 → .13) ; chaque marché en fige une via un guide d’usage (EPC SEPA, CBPR+, SPS suisse…). Le xmlns Document doit correspondre à ce XSD. Sur SWIFT les payloads ISO 20022 s’appellent MX (vs MT historiques).',
  }, {
    aliases: { en: ['ISO', 'ISO20022', 'MX messages', 'ISO standard'], fr: ['ISO', 'ISO20022', 'messages MX', 'norme ISO'] },
    seeAlso: ['pain', 'pacs', 'camt', 'acmt', 'sct', 'swift', 'mx', 'mt', 'xsd', 'ig', 'cbpr-plus'],
    sources: ['konsentus'],
    links: [
      { label: 'pacs.008 versions', href: '/messages/pacs.008' },
      { label: 'ISO 20022 message definitions (XSD)', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
      { label: 'SWIFT ISO 20022', href: 'https://www.swift.com/standards/iso-20022' },
    ],
  }),
  g('xsd', 'XSD', 'concept', { en: 'XML Schema Definition', fr: 'Définition de schéma XML' }, {
    en: 'The formal schema for an ISO 20022 message revision. Catalogue ids such as pacs.008.001.08 or camt.053.001.08 map 1:1 to an XSD and to the Document xmlns (`urn:iso:std:iso:20022:tech:xsd:…`). Banks validate against that schema; a wrong version number is a structural reject, not a business one. Download XSDs from the ISO catalogue; CBPR+ and national IGs may ship a constrained copy on top.',
    fr: 'Le schéma formel d’une révision de message ISO 20022. Les ids catalogue (pacs.008.001.08, camt.053.001.08…) correspondent 1:1 à un XSD et au xmlns Document (`urn:iso:std:iso:20022:tech:xsd:…`). Les banques valident contre ce schéma ; un mauvais numéro de version est un rejet structurel, pas métier. Téléchargez les XSD sur le catalogue ISO ; CBPR+ et les IG nationaux peuvent en publier une copie contrainte par-dessus.',
  }, {
    aliases: {
      en: ['XML Schema', 'XML Schema Definition', 'schema', 'xmlns'],
      fr: ['schéma XML', 'XML Schema Definition', 'schéma', 'xmlns'],
    },
    seeAlso: ['iso-20022', 'ig', 'pacs', 'camt', 'mx', 'swift'],
    links: [
      { label: 'ISO catalogue (schemas)', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
      { label: 'ISO message archive (older XSDs)', href: 'https://www.iso20022.org/catalogue-messages/iso-20022-messages-archive' },
    ],
  }),
  g('ig', 'IG', 'concept', { en: 'Usage guideline', fr: 'Guide d’usage' }, {
    en: 'Market practice layer on top of an ISO XSD: which fields are mandatory, which codes are allowed, which schema revision is in force. EPC SEPA IGs, SWIFT CBPR+, Swiss SPS and HVPS each pin a version (and sometimes a country suffix like .ch.02). The ISO catalogue alone is not enough — your CSM’s IG decides which pacs/camt XSD you must send.',
    fr: 'Couche de pratique de marché au-dessus d’un XSD ISO : champs obligatoires, codes autorisés, révision de schéma en vigueur. Les IG EPC SEPA, SWIFT CBPR+, SPS suisse et HVPS figent chacun une version (parfois un suffixe pays comme .ch.02). Le catalogue ISO seul ne suffit pas — c’est l’IG de votre CSM qui décide quel XSD pacs/camt envoyer.',
  }, {
    aliases: {
      en: ['usage guideline', 'implementation guideline', 'MUG', 'message usage guideline', 'CGI'],
      fr: ['guide d’usage', 'ligne directrice', 'IG', 'MUG', 'guide d’implémentation'],
    },
    seeAlso: ['xsd', 'iso-20022', 'epc', 'cbpr-plus', 'sps', 'pacs', 'camt'],
    links: [
      { label: 'CBPR+', href: '/glossary?id=cbpr-plus' },
      { label: 'SWIFT ISO standards / CBPR+', href: 'https://www.swift.com/standards/iso-20022/iso-20022-standards' },
    ],
  }),
  g('swift', 'SWIFT', 'scheme', { en: 'SWIFT', fr: 'SWIFT' }, {
    en: 'Cooperative that runs the interbank messaging network and, with ISO, the ISO 20022 catalogue process. Cross-border FI-to-FI payments and reporting on SWIFT use MX (ISO 20022) under CBPR+ usage guidelines — not the same schema baselines as SEPA. Version migrations (pacs.008.001.08 → .10 → .13, matching camt reporting packages) follow SWIFT Standards Releases / CBPR+ windows. Legacy FIN messages are MT.',
    fr: 'Coopérative qui opère le réseau de messagerie interbancaire et, avec l’ISO, le processus catalogue ISO 20022. Les paiements et le reporting FI-to-FI transfrontaliers sur SWIFT utilisent du MX (ISO 20022) sous guides CBPR+ — pas les mêmes baselines de schéma que le SEPA. Les migrations de version (pacs.008.001.08 → .10 → .13, packages camt associés) suivent les Standards Releases SWIFT / fenêtres CBPR+. Les messages FIN historiques sont des MT.',
  }, {
    aliases: {
      en: ['S.W.I.F.T.', 'Society for Worldwide Interbank Financial Telecommunication', 'Swift network', 'SWIFTNet'],
      fr: ['S.W.I.F.T.', 'réseau SWIFT', 'Swift', 'SWIFTNet'],
    },
    seeAlso: ['cbpr-plus', 'mx', 'mt', 'iso-20022', 'xsd', 'ig', 'pacs', 'camt', 'correspondent-banking', 'hvps', 'bic'],
    links: [
      { label: 'SWIFT / CBPR+ explorer', href: '/payment/swift-credit-transfer' },
      { label: 'SWIFT ISO 20022', href: 'https://www.swift.com/standards/iso-20022' },
      { label: 'ISO message definitions (XSD)', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
    ],
  }),
  g('mx', 'MX', 'message', { en: 'MX (ISO 20022 on SWIFT)', fr: 'MX (ISO 20022 sur SWIFT)' }, {
    en: 'SWIFT name for ISO 20022 XML messages on the network (FINplus), as opposed to legacy MT. Same business areas as everywhere else — pain, pacs, camt — but the mandated XSD revision and field rules come from CBPR+ (or the market IG), not from the EPC SEPA IG. Pair related messages on compatible catalogue versions (pacs.008 with its pacs.002 / camt.054).',
    fr: 'Nom SWIFT des messages XML ISO 20022 sur le réseau (FINplus), par opposition aux MT historiques. Mêmes domaines métier qu’ailleurs — pain, pacs, camt — mais la révision XSD et les règles de champs viennent de CBPR+ (ou de l’IG du marché), pas de l’IG EPC SEPA. Alignez les messages liés sur des versions catalogue compatibles (pacs.008 avec son pacs.002 / camt.054).',
  }, {
    aliases: { en: ['MX message', 'ISO 20022 MX', 'FINplus'], fr: ['message MX', 'ISO 20022 MX', 'FINplus'] },
    seeAlso: ['mt', 'swift', 'cbpr-plus', 'iso-20022', 'pacs', 'camt', 'xsd'],
    links: [
      { label: 'CBPR+', href: '/glossary?id=cbpr-plus' },
      { label: 'pacs.008 versions', href: '/messages/pacs.008' },
      { label: 'ISO catalogue (XSD)', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
    ],
  }),
  g('mt', 'MT', 'message', { en: 'MT (SWIFT FIN)', fr: 'MT (SWIFT FIN)' }, {
    en: 'Legacy SWIFT FIN message types (MT103 customer transfer, MT202 cover, MT940 statement…). Being replaced on cross-border FI-to-FI payment instructions by MX equivalents under CBPR+ (e.g. MT103 → pacs.008, MT202 → pacs.009, MT940 → camt.053). Do not confuse MT status codes with ISO TxSts on pacs.002.',
    fr: 'Types de messages SWIFT FIN historiques (MT103 virement client, MT202 cover, MT940 relevé…). Remplacés sur les instructions de paiement FI-to-FI transfrontalières par les équivalents MX sous CBPR+ (ex. MT103 → pacs.008, MT202 → pacs.009, MT940 → camt.053). Ne pas confondre les codes statut MT avec le TxSts ISO du pacs.002.',
  }, {
    aliases: { en: ['FIN message', 'MT103', 'MT202', 'SWIFT MT'], fr: ['message FIN', 'MT103', 'MT202', 'SWIFT MT'] },
    seeAlso: ['mx', 'swift', 'cbpr-plus', 'pacs-008', 'pacs-009', 'camt-053'],
    links: [
      { label: 'SWIFT ISO 20022', href: 'https://www.swift.com/standards/iso-20022' },
      { label: 'SWIFT credit transfer', href: '/payment/swift-credit-transfer' },
    ],
  }),
  g('pain', 'pain', 'message', { en: 'Payments Initiation (pain)', fr: 'Initiation des paiements (pain)' }, {
    en: 'ISO 20022 business area for customer-to-bank instructions: pain.001 credit, pain.008 direct debit, pain.013 request-to-pay. Same versioning model as pacs/camt — the xmlns quotes a specific XSD revision.',
    fr: 'Domaine ISO 20022 des instructions client-banque : pain.001 virement, pain.008 prélèvement, pain.013 request-to-pay. Même modèle de versionnement que pacs/camt — le xmlns cite une révision XSD précise.',
  }, {
    aliases: { en: ['Payments Initiation', 'pain.001'], fr: ['initiation des paiements', 'pain'] },
    seeAlso: ['pacs', 'iso-20022', 'camt', 'acmt', 'pain-001', 'pain-008', 'pain-013', 'xsd'],
    links: [{ label: 'pain.001', href: '/messages/pain.001' }],
  }),
  g('pacs', 'pacs', 'message', { en: 'Payments Clearing & Settlement (pacs)', fr: 'Compensation et règlement (pacs)' }, {
    en: 'ISO 20022 interbank clearing area. pacs.008 is the customer credit transfer; pacs.002 is the status/ack. Each id is versioned (pacs.008.001.08 vs .10 / .13) and bound to an XSD; SEPA, CBPR+ and national rails pin different revisions via their IGs — do not mix them.',
    fr: 'Domaine ISO 20022 de compensation interbancaire. pacs.008 est le virement client ; pacs.002 le statut/ack. Chaque id est versionné (pacs.008.001.08 vs .10 / .13) et lié à un XSD ; SEPA, CBPR+ et les rails nationaux figent des révisions différentes via leurs IG — ne pas les mélanger.',
  }, {
    aliases: { en: ['Payments Clearing and Settlement'], fr: ['compensation et règlement'] },
    seeAlso: ['pain', 'camt', 'csm', 'iso-20022', 'xsd', 'ig', 'pacs-008', 'pacs-002', 'swift'],
    links: [
      { label: 'pacs.008 versions', href: '/messages/pacs.008' },
      { label: 'ISO pacs schemas', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
    ],
  }),
  g('camt', 'camt', 'message', { en: 'Cash Management (camt)', fr: 'Gestion de trésorerie (camt)' }, {
    en: 'ISO 20022 cash-management area: statements (camt.053), notifications (camt.054), recalls (camt.056) and investigations. Versioned like pacs — camt.053.001.08 is a different XSD from a later .10/.13 package; CBPR+ reporting migrations track the same SWIFT windows as the related pacs.',
    fr: 'Domaine ISO 20022 de cash management : relevés (camt.053), notifications (camt.054), rappels (camt.056) et investigations. Versionné comme pacs — camt.053.001.08 est un autre XSD qu’un package .10/.13 ultérieur ; les migrations de reporting CBPR+ suivent les mêmes fenêtres SWIFT que les pacs associés.',
  }, {
    aliases: { en: ['Cash Management'], fr: ['gestion de trésorerie'] },
    seeAlso: ['pacs', 'iso-20022', 'pain', 'xsd', 'ig', 'swift', 'camt-053', 'camt-054', 'camt-056'],
    links: [
      { label: 'camt.054', href: '/messages/camt.054' },
      { label: 'ISO camt schemas', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
    ],
  }),
  g('acmt', 'acmt', 'message', { en: 'Account Management (acmt)', fr: 'Gestion de compte (acmt)' }, {
    en: 'ISO 20022 account-management area. VoP uses acmt.023 (request) and acmt.024 (report).',
    fr: 'Domaine ISO 20022 de gestion de compte. La VoP utilise acmt.023 (demande) et acmt.024 (rapport).',
  }, {
    aliases: { en: ['Account Management'], fr: ['gestion de compte'] },
    seeAlso: ['vop', 'acmt-023', 'acmt-024'],
  }),
  g('csm', 'CSM', 'concept', { en: 'Clearing and Settlement Mechanism', fr: 'Mécanisme de compensation et de règlement' }, {
    en: 'The rail that actually clears and settles between banks: TIPS, RT1, STEP2, SIC, euroSIC. Distinct from the payment scheme (SCT / SCT Inst rules) and from the XS2A API the TPP talks to. Regular SCT usually lands on a batch CSM; SCT Inst on an instant CSM.',
    fr: 'Le rail qui compense et règle vraiment entre banques : TIPS, RT1, STEP2, SIC, euroSIC. Distinct du schéma de paiement (règles SCT / SCT Inst) et de l’API XS2A à laquelle parle le TPP. Le SCT classique aboutit en général sur un CSM de lots ; le SCT Inst sur un CSM instantané.',
  }, {
    aliases: {
      en: ['clearing and settlement mechanism', 'clearing system', 'the rail', 'SCM'],
      fr: ['mécanisme de compensation', 'CSM', 'le rail', 'SCM'],
    },
    seeAlso: ['tips', 'rt1', 'step2', 'sic', 'sct', 'sct-inst', 'pacs', 'debtor', 'creditor'],
    links: [{ label: 'Home overview', href: '/' }],
  }),
  g('debtor', 'Debtor', 'concept', { en: 'Debtor (Dbtr)', fr: 'Débiteur (Dbtr)' }, {
    en: 'ISO 20022 party whose account is debited. On a credit transfer the debtor is the payer / originator. On a direct debit the debtor is still the payer, but the creditor starts the collection.',
    fr: 'Partie ISO 20022 dont le compte est débité. Sur un virement le débiteur est le payeur / originator. Sur un prélèvement le débiteur reste le payeur, mais c’est le créancier qui démarre la collecte.',
  }, {
    aliases: { en: ['Dbtr', 'debtor account', 'payer account'], fr: ['Dbtr', 'compte débiteur', 'payeur'] },
    seeAlso: ['creditor', 'originator', 'beneficiary', 'sct', 'sdd'],
  }),
  g('creditor', 'Creditor', 'concept', { en: 'Creditor (Cdtr)', fr: 'Créancier (Cdtr)' }, {
    en: 'ISO 20022 party whose account is credited. On SCT / SCT Inst that is the beneficiary. On SDD the creditor is also the originator of the collection.',
    fr: 'Partie ISO 20022 dont le compte est crédité. Sur SCT / SCT Inst c’est le bénéficiaire. Sur SDD le créancier est aussi l’originator du prélèvement.',
  }, {
    aliases: { en: ['Cdtr', 'creditor account', 'payee'], fr: ['Cdtr', 'compte créancier', 'bénéficiaire'] },
    seeAlso: ['debtor', 'originator', 'beneficiary', 'sct', 'sdd'],
  }),
  g('originator', 'Originator', 'concept', { en: 'Originator (Orig)', fr: 'Originator (Orig)' }, {
    en: 'Party that starts the payment instruction. For credit transfers that is the debtor/payer; for direct debits it is the creditor. Not a synonym of Creditor — only of “who kicks off the message”.',
    fr: 'Partie qui démarre l’instruction de paiement. Pour un virement c’est le débiteur/payeur ; pour un prélèvement c’est le créancier. Pas un synonyme de Créancier — seulement de « qui lance le message ».',
  }, {
    aliases: { en: ['Orig', 'originating party', 'instructing party'], fr: ['Orig', 'partie initiatrice'] },
    seeAlso: ['beneficiary', 'debtor', 'creditor', 'sct', 'sdd'],
  }),
  g('beneficiary', 'Beneficiary', 'concept', { en: 'Beneficiary (Bene)', fr: 'Bénéficiaire (Bene)' }, {
    en: 'Everyday / ops name for the party that receives a credit transfer — usually the ISO Creditor. Prefer Debtor/Creditor when reading pacs XML; Bene is fine in customer language.',
    fr: 'Nom courant / ops pour la partie qui reçoit un virement — en général le Créancier ISO. Préférez Débiteur/Créancier en lisant le XML pacs ; Bene convient en langage client.',
  }, {
    aliases: { en: ['Bene', 'payee', 'beneficiary account'], fr: ['Bene', 'bénéficiaire', 'compte bénéficiaire'] },
    seeAlso: ['creditor', 'originator', 'debtor', 'sct', 'vop'],
  }),
  g('sic', 'SIC', 'scheme', { en: 'Swiss Interbank Clearing', fr: 'Swiss Interbank Clearing' }, {
    en: 'SIX CHF high-value and retail clearing in central bank money (RTGS). Fully ISO 20022 under Swiss Payment Standards. The current platform is SIC5; instant CHF is SIC IP, not SCT Inst.',
    fr: 'Compensation SIX en CHF, gros montants et retail, en monnaie banque centrale (RTGS). Entièrement ISO 20022 sous Swiss Payment Standards. La plateforme actuelle est SIC5 ; l’instantané CHF est SIC IP, pas SCT Inst.',
  }, {
    aliases: { en: ['Swiss Interbank Clearing', 'SIC CHF', 'SIC5'], fr: ['Swiss Interbank Clearing', 'SIC CHF', 'SIC5'] },
    seeAlso: ['eurosic', 'sic-ip', 'six', 'snb', 'sps', 'rtgs', 'csm', 'qr-bill'],
    links: [
      { label: 'Swiss SPS / SIC', href: '/standards/swiss-sps' },
      { label: 'Swiss credit transfer', href: '/payment/swiss-credit-transfer' },
    ],
  }),
  g('eurosic', 'euroSIC', 'scheme', { en: 'euroSIC', fr: 'euroSIC' }, {
    en: 'SIX EUR clearing for Swiss participants. EUR legs of Swiss traffic often settle here rather than in SEPA STEP2.',
    fr: 'Compensation SIX en EUR pour les participants suisses. Les jambes EUR du trafic suisse y sont souvent réglées plutôt que dans STEP2 SEPA.',
  }, {
    aliases: { en: ['euroSIC'], fr: ['euroSIC'] },
    seeAlso: ['sic', 'sepa', 'csm', 'six', 'rtgs'],
  }),
  g('sic-ip', 'SIC IP', 'scheme', { en: 'SIC Instant Payments', fr: 'SIC Instant Payments' }, {
    en: 'SIX CHF instant rail, ~10 seconds in central bank money. Treat timeouts like SCT Inst (pacs.028), not like batch SIC.',
    fr: 'Rail instantané CHF de SIX, ~10 secondes en monnaie banque centrale. Traitez les timeouts comme du SCT Inst (pacs.028), pas comme du SIC de lot.',
  }, {
    aliases: { en: ['SIC Instant Payment', 'SIC Instant', 'SIC5 Instant', 'SIP'], fr: ['SIC Instant', 'paiements instantanés SIC', 'SIC5 Instant', 'SIP'] },
    seeAlso: ['sic', 'ip', 'sct-inst', 'six', 'snb', 'rtgs'],
    links: [{ label: 'SIC IP flow', href: '/flows/sic-ip-instant' }],
  }),
  g('target2', 'T2', 'scheme', { en: 'TARGET2 / T2', fr: 'TARGET2 / T2' }, {
    en: 'ECB real-time gross settlement for the euro. TIPS is the instant service in the same TARGET family; high-value non-instant still goes T2.',
    fr: 'Règlement brut en temps réel de la BCE pour l’euro. TIPS est le service instantané de la même famille TARGET ; le gros montant non instantané reste en T2.',
  }, {
    aliases: { en: ['TARGET2', 'T2', 'TARGET'], fr: ['TARGET2', 'T2'] },
    seeAlso: ['tips', 'ecb', 'csm', 'rtgs', 'hvps'],
  }),
  g('cbpr-plus', 'CBPR+', 'scheme', { en: 'CBPR+', fr: 'CBPR+' }, {
    en: 'SWIFT Cross-Border Payments and Reporting Plus — ISO 20022 usage guidelines for correspondent banking on the SWIFT network. Schema versions (pacs.008.001.08 vs .10 / .13) follow CBPR+ migration windows, not SEPA IGs.',
    fr: 'SWIFT Cross-Border Payments and Reporting Plus — lignes directrices ISO 20022 pour la banque correspondante sur le réseau SWIFT. Les versions de schéma (pacs.008.001.08 vs .10 / .13) suivent les fenêtres CBPR+, pas les IG SEPA.',
  }, {
    aliases: {
      en: ['CBPR+', 'CBPR', 'Cross-Border Payments and Reporting Plus', 'Cross-Border Payments and Reporting'],
      fr: ['CBPR+', 'CBPR', 'Cross-Border Payments and Reporting Plus'],
    },
    seeAlso: ['swift', 'iso-20022', 'mx', 'pacs', 'camt', 'correspondent-banking', 'nostro', 'hvps', 'ig', 'xsd'],
    links: [
      { label: 'SWIFT credit transfer', href: '/payment/swift-credit-transfer' },
      { label: 'SWIFT CBPR+ / ISO standards', href: 'https://www.swift.com/standards/iso-20022/iso-20022-standards' },
      { label: 'ISO message definitions (XSD)', href: 'https://www.iso20022.org/iso-20022-message-definitions' },
    ],
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
    seeAlso: ['oauth2', 'oidc', 'mtls', 'directory', 'par', 'pkce', 'jws'],
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
    en: 'Firm authorised to issue e-money and related payment services. Many AISPs/PISPs are licensed as EMI or PI rather than as a bank. An EMI that holds payment accounts is still an ASPSP under PSD2.',
    fr: 'Établissement agréé pour émettre de la monnaie électronique et des services de paiement liés. Beaucoup d’AISP/PISP sont agréés EMI ou PI plutôt que banque. Un EMI qui tient des comptes de paiement reste un ASPSP sous PSD2.',
  }, {
    aliases: { en: ['Electronic Money Institution', 'e-money institution'], fr: ['établissement de monnaie électronique', 'EME'] },
    seeAlso: ['psp', 'tpp', 'pi', 'credit-institution', 'aspsp', 'neobank'],
    sources: ['konsentus'],
  }),
  g('pi', 'PI', 'concept', { en: 'Payment Institution', fr: 'Établissement de paiement' }, {
    en: 'Firm authorised under PSD2 to provide payment services (transfers, acquiring, remittance, etc.) without a full banking licence and without issuing e-money. Distinct from an EMI and from a credit institution. May be an AISP/PISP and, if it holds payment accounts, an ASPSP.',
    fr: 'Établissement agréé PSD2 pour fournir des services de paiement (virements, acquiring, remises, etc.) sans licence bancaire complète et sans émettre de monnaie électronique. Distinct d’un EMI et d’un établissement de crédit. Peut être AISP/PISP et, s’il tient des comptes de paiement, ASPSP.',
  }, {
    aliases: {
      en: ['Payment Institution', 'payment institution'],
      fr: ['établissement de paiement', 'EP'],
    },
    seeAlso: ['emi', 'credit-institution', 'psp', 'aspsp', 'tpp', 'psd2', 'neobank'],
    sources: ['konsentus'],
  }),
  g('credit-institution', 'Credit institution', 'concept', { en: 'Credit institution', fr: 'Établissement de crédit' }, {
    en: 'Full bank under the Capital Requirements / CRD stack: takes deposits, can lend, and sits under deposit-guarantee and prudential rules. In Open Banking it is typically the ASPSP. Online banks (Boursorama, N26) are credit institutions; “neobank” alone does not mean this licence.',
    fr: 'Banque au sens CRD / exigences de fonds propres : reçoit des dépôts, peut prêter, et relève de la garantie des dépôts et des règles prudentielles. En Open Banking c’est en général l’ASPSP. Les banques en ligne (Boursorama, N26) sont des établissements de crédit ; « néobanque » seul ne désigne pas cette licence.',
  }, {
    aliases: {
      en: ['credit institution', 'bank', 'licensed bank', 'full bank'],
      fr: ['établissement de crédit', 'banque', 'banque agréée'],
    },
    seeAlso: ['aspsp', 'emi', 'pi', 'psp', 'neobank', 'nca'],
  }),
  g('neobank', 'Neobank', 'concept', { en: 'Neobank', fr: 'Néobanque' }, {
    en: 'Marketing label for a digital-first retail bank or bank-like app (Revolut, N26, Boursorama…). Not a PSD2 licence type. Map the brand to its legal entity: credit institution, EMI or PI — and, for Open Banking, whether it is an ASPSP holding the payment account. Groups often mix entities by country.',
    fr: 'Label marketing pour une banque ou une app « bank-like » digital-first (Revolut, N26, Boursorama…). Ce n’est pas un type d’agrément PSD2. Rattachez la marque à l’entité légale : établissement de crédit, EMI ou PI — et, pour l’Open Banking, si elle est ASPSP teneur de compte. Les groupes mélangent souvent les entités selon le pays.',
  }, {
    aliases: {
      en: ['neobank', 'neo-bank', 'digital bank', 'virtual bank', 'challenger bank', 'online bank'],
      fr: ['néobanque', 'banque en ligne', 'banque digitale', 'banque virtuelle', 'challenger bank'],
    },
    seeAlso: ['credit-institution', 'emi', 'pi', 'aspsp', 'psp', 'passporting'],
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
  g('agi', 'AGI', 'concept', { en: 'Access Gateway Interface', fr: 'Interface passerelle d’accès' }, {
    en: 'Security and connectivity gateway interfacing external network rails (SWIFT, TIPS, RT1, STEP2) with internal bank systems. Handles mTLS, QWAC/QSealC verification, message schema validation, and protocol conversion.',
    fr: 'Passerelle de sécurité et de connectivité assurant l’interface entre les réseaux externes (SWIFT, TIPS, RT1, STEP2) et le SI bancaire interne. Gère le mTLS, la vérification QWAC/QSealC, la validation de schéma et la conversion de protocole.',
  }, {
    aliases: { en: ['Access Gateway Interface', 'AGI gateway', 'payment gateway'], fr: ['passerelle AGI', 'passerelle de paiement', 'gateway'] },
    seeAlso: ['payment-hub', 'csm', 'mtls', 'qwac', 'swift'],
    links: [
      { label: 'Flow: IP via Hub & ILM', href: '/flows/hub-ip-transaction-flow' },
      { label: 'Flow: Batch via Hub & ILM', href: '/flows/hub-non-ip-transaction-flow' },
    ],
  }),
  g('sub-participant', 'Sub participant', 'concept', { en: 'Sub participant / Indirect participant', fr: 'Sous-participant / Participant indirect' }, {
    en: 'Payment service provider or financial institution that accesses a clearing and settlement system (CSM / RTGS) through a direct participant bank instead of maintaining a direct central bank account or clearing membership.',
    fr: 'Prestataire de services de paiement ou établissement financier qui accède à un système de compensation et de règlement (CSM / RTGS) via une banque participante directe plutôt qu’en direct.',
  }, {
    aliases: { en: ['sub participant', 'indirect participant', 'sub-member', 'nested participant'], fr: ['sous-participant', 'participant indirect', 'sous-membre'] },
    seeAlso: ['csm', 'aspsp', 'correspondent-banking', 'sct-inst', 'rtgs'],
  }),
  g('settlement', 'Settlement', 'concept', { en: 'Settlement', fr: 'Règlement' }, {
    en: 'The irrevocable and final discharge of a payment obligation through the transfer of funds or value between payment service providers, often in central bank money via a clearing and settlement mechanism (CSM).',
    fr: 'Le dénouement irrévocable et définitif d’une obligation de paiement par transfert de fonds ou de valeur entre prestataires de services de paiement, souvent en monnaie banque centrale via un mécanisme de compensation et de règlement (CSM).',
  }, {
    aliases: { en: ['settlement', 'final settlement', 'settlement engine'], fr: ['règlement', 'règlement définitif', 'dénouement'] },
    seeAlso: ['csm', 'target2', 'tips', 'core-banking'],
  }),
  g('core-banking', 'Core Banking', 'concept', { en: 'Core Banking System / System of Record', fr: 'Système de Core Banking / System of Record' }, {
    en: 'Central back-office ledger and banking engine (such as Temenos T24, FIS, Sopra, or SAP) that maintains master account records, customer balances, debit/credit postings, and interest calculation.',
    fr: 'Système comptable central et moteur bancaire back-office (tel que Temenos T24, FIS, Sopra ou SAP) qui gère le référentiel des comptes, les soldes clients, l’imputation comptable et le calcul des intérêts.',
  }, {
    aliases: { en: ['Core Banking System', 'CBS', 'System of Record', 'SoR', 'T24', 'Temenos T24'], fr: ['Core Banking', 'système bancaire central', 'System of Record', 'SoR', 'T24'] },
    seeAlso: ['fund-reservation', 'settlement', 'aspsp'],
    links: [
      { label: 'Flow: IP via Hub & ILM', href: '/flows/hub-ip-transaction-flow' },
    ],
  }),
  g('fund-reservation', 'Fund reservation', 'concept', { en: 'Fund Reservation / Earmarking', fr: 'Réservation de fonds / Blocage' }, {
    en: 'Temporary hold or earmarking placed on a customer account balance prior to final settlement or clearing execution, preventing double spending while a payment order is being processed.',
    fr: 'Saisie conservatoire ou blocage temporaire appliqué sur le solde d’un compte client avant le règlement définitif, évitant la double dépense pendant le traitement de l’ordre de paiement.',
  }, {
    aliases: { en: ['fund reservation', 'hold', 'earmarking', 'balance hold', 'funds block'], fr: ['réservation de fonds', 'blocage de solde', 'réserve de fonds', 'hold'] },
    seeAlso: ['core-banking', 'sct-inst', 'ilm'],
  }),
  g('leg', 'Leg', 'concept', { en: 'Payment Leg', fr: 'Jambe de paiement' }, {
    en: 'Distinct segment or stage of an end-to-end payment transaction, such as the customer initiation leg (pain.001), interbank clearing leg (pacs.008), or internal ledger posting leg.',
    fr: 'Segment ou étape distincte d’une transaction de paiement de bout en bout, telle que la jambe d’initiation client (pain.001), la jambe de compensation interbancaire (pacs.008) ou la jambe comptable interne.',
  }, {
    aliases: { en: ['payment leg', 'transaction leg', 'clearing leg', 'settlement leg'], fr: ['jambe de paiement', 'jambe de compensation', 'tronçon de paiement'] },
    seeAlso: ['pacs-008', 'pain-001', 'sct-inst'],
  }),
  g('ilm', 'ILM', 'concept', { en: 'Intraday Liquidity Management', fr: 'Gestion de la liquidité intraday' }, {
    en: 'System and operational control framework monitoring and managing real-time intraday liquidity positions, central bank reserve accounts, and credit limits during operating hours.',
    fr: 'Système et dispositif de contrôle surveillant et gérant en temps réel les positions de liquidité intraday, les comptes de réserve en banque centrale et les lignes de crédit au cours de la journée opératoire.',
  }, {
    aliases: { en: ['Intraday Liquidity Management', 'ILM system', 'intraday liquidity'], fr: ['gestion de la liquidité intraday', 'ILM', 'liquidité intraday'] },
    seeAlso: ['payment-hub', 'settlement', 'csm', 'target2'],
    links: [
      { label: 'Flow: IP via Hub & ILM', href: '/flows/hub-ip-transaction-flow' },
      { label: 'Flow: Batch via Hub & ILM', href: '/flows/hub-non-ip-transaction-flow' },
    ],
  }),
  g('payment-hub', 'Payment Hub', 'concept', { en: 'Payment Hub', fr: 'Hub de paiement' }, {
    en: 'Centralised enterprise orchestration engine for payment routing, message transformation, limit checking, and clearing system dispatch. Commercial vendor engines include Finastra, Volante, FIS, Sopra Steria, or custom in-house ("maison") solutions.',
    fr: 'Moteur centralisé d’orchestration d’entreprise assurant le routage des paiements, la transformation de messages, le contrôle des limites et la distribution vers les CSM. Solutions éditeurs incluant Finastra, Volante, FIS, Sopra Steria ou développements internes (« maison »).',
  }, {
    aliases: { en: ['Payment Hub', 'Payment Orchestration Engine', 'Finastra', 'Volante', 'FIS', 'Sopra', 'maison'], fr: ['Hub de paiement', 'orchestrateur de paiement', 'Finastra', 'Volante', 'FIS', 'Sopra', 'maison'] },
    seeAlso: ['agi', 'ilm', 'core-banking', 'csm'],
    links: [
      { label: 'Flow: IP via Hub & ILM', href: '/flows/hub-ip-transaction-flow' },
      { label: 'Flow: Batch via Hub & ILM', href: '/flows/hub-non-ip-transaction-flow' },
    ],
  }),
  g('epi-company', 'EPI Company SE', 'scheme', { en: 'EPI Company SE', fr: 'EPI Company SE' }, {
    en: 'European Payments Initiative corporate entity (Societas Europaea) established by major European banks and payment acquirers to own, govern, and operate the Wero account-to-account retail payment scheme.',
    fr: 'Entité commerciale (Societas Europaea) de l’European Payments Initiative créée par les grandes banques et acquéreurs européens pour détenir, gouverner et opérer le schéma de paiement retail Wero.',
  }, {
    aliases: { en: ['EPI Company SE', 'EPI Company', 'EPI SE'], fr: ['EPI Company SE', 'EPI Company'] },
    seeAlso: ['epi', 'wero', 'a2a', 'a2a-overlay', 'sct-inst'],
    links: [
      { label: 'Standard: Wero', href: '/standards/wero' },
      { label: 'Flow: Wero A2A', href: '/flows/wero-a2a-payment' },
    ],
  }),
  g('rtgs', 'RTGS', 'concept', { en: 'Real-Time Gross Settlement', fr: 'Règlement brut en temps réel' }, {
    en: 'Settlement of each payment individually and immediately in central bank money, with no netting delay. TARGET2/T2, SIC and euroSIC are RTGS rails; retail batch CSMs (STEP2) and instant CSMs (TIPS, RT1, SIC IP) are different settlement models.',
    fr: 'Règlement de chaque paiement individuellement et immédiatement en monnaie banque centrale, sans compensation nette différée. TARGET2/T2, SIC et euroSIC sont des rails RTGS ; les CSM de lots (STEP2) et instantanés (TIPS, RT1, SIC IP) sont d’autres modèles de règlement.',
  }, {
    aliases: {
      en: ['Real-Time Gross Settlement', 'real-time gross settlement', 'RTGS system'],
      fr: ['règlement brut en temps réel', 'système RTGS', 'RTGS'],
    },
    seeAlso: ['target2', 'sic', 'eurosic', 'csm', 'settlement', 'hvps', 'tips'],
  }),
  g('hvps', 'HVPS', 'scheme', { en: 'High-Value Payment System', fr: 'Système de paiement de gros montants' }, {
    en: 'Wholesale / high-value payment system, usually RTGS in central bank money (T2, SIC, Fedwire-class systems). CBPR+ and regional HVPS publish the ISO 20022 revision banks must use — not the raw ISO catalogue alone.',
    fr: 'Système de paiement de gros montants, en général RTGS en monnaie banque centrale (T2, SIC, systèmes de type Fedwire). CBPR+ et les HVPS régionaux publient la révision ISO 20022 imposée — pas le catalogue ISO seul.',
  }, {
    aliases: {
      en: ['High-Value Payment System', 'high-value payment system', 'wholesale RTGS'],
      fr: ['système de paiement de gros montants', 'HVPS', 'RTGS de gros'],
    },
    seeAlso: ['rtgs', 'target2', 'sic', 'cbpr-plus', 'swift'],
  }),
  g('six', 'SIX', 'scheme', { en: 'SIX Group', fr: 'SIX Group' }, {
    en: 'Swiss financial-market infrastructure group. Operates Swiss Interbank Clearing (SIC / euroSIC), Swiss Payment Standards and related securities services; SIC settles in SNB central bank money.',
    fr: 'Groupe d’infrastructures de marché financier suisse. Opère Swiss Interbank Clearing (SIC / euroSIC), les Swiss Payment Standards et des services titres ; SIC règle en monnaie BNS.',
  }, {
    aliases: {
      en: ['SIX Group', 'SIX Interbank Clearing', 'SIX SIC'],
      fr: ['SIX Group', 'SIX Interbank Clearing', 'SIC SIX'],
    },
    seeAlso: ['sic', 'eurosic', 'sic-ip', 'sps', 'snb', 'qr-bill'],
    links: [{ label: 'Swiss SPS / SIC', href: '/standards/swiss-sps' }],
  }),
  g('snb', 'SNB', 'regulation', { en: 'Swiss National Bank', fr: 'Banque nationale suisse' }, {
    en: 'Switzerland’s central bank. SIC and SIC IP settle in SNB central bank money (CHF); euroSIC settles euro legs for Swiss participants.',
    fr: 'Banque centrale de la Suisse. SIC et SIC IP règlent en monnaie BNS (CHF) ; euroSIC règle les jambes euro des participants suisses.',
  }, {
    aliases: {
      en: ['Swiss National Bank', 'SNB', 'BNS'],
      fr: ['Banque nationale suisse', 'BNS', 'SNB'],
    },
    seeAlso: ['sic', 'sic-ip', 'eurosic', 'six', 'rtgs'],
  }),
  g('sps', 'SPS', 'scheme', { en: 'Swiss Payment Standards', fr: 'Swiss Payment Standards' }, {
    en: 'SIX customer-to-bank and interbank ISO 20022 usage guidelines for Switzerland (pain/pacs/camt with Swiss xmlns and CHF rules). QR-bill remittance (QRR/SCOR) lives here; do not send SEPA service-level codes on a SIC CHF payment.',
    fr: 'Lignes directrices ISO 20022 client-banque et interbancaires SIX pour la Suisse (pain/pacs/camt avec xmlns suisse et règles CHF). La remittance QR-facture (QRR/SCOR) y vit ; n’envoyez pas de codes service-level SEPA sur un paiement SIC CHF.',
  }, {
    aliases: {
      en: ['Swiss Payment Standards', 'SPS 2026', 'Swiss SPS'],
      fr: ['Swiss Payment Standards', 'SPS 2026', 'SPS suisse'],
    },
    seeAlso: ['sic', 'six', 'qr-bill', 'ig', 'iso-20022'],
    links: [{ label: 'Swiss SPS standard', href: '/standards/swiss-sps' }],
  }),
  g('qr-bill', 'QR-bill', 'concept', { en: 'Swiss QR-bill', fr: 'QR-facture suisse' }, {
    en: 'Swiss retail credit-transfer remittance form: a QR code plus structured creditor reference (QRR) or SCOR. Under Swiss Payment Standards it replaced DTA; pain.001 for SIC CHF often carries QR-bill data.',
    fr: 'Forme de remittance retail suisse pour virement : un QR code plus référence créancier structurée (QRR) ou SCOR. Sous Swiss Payment Standards elle a remplacé le DTA ; le pain.001 SIC CHF porte souvent des données QR-facture.',
  }, {
    aliases: {
      en: ['QR-bill', 'Swiss QR-bill', 'QR bill', 'QRR', 'SCOR', 'QR'],
      fr: ['QR-facture', 'QR-bill', 'facture QR', 'QRR', 'SCOR', 'QR'],
    },
    seeAlso: ['sps', 'sic', 'pain', 'iban'],
  }),
  g('ebics', 'EBICS', 'concept', {
    en: 'Electronic Banking Internet Communication Standard',
    fr: 'Electronic Banking Internet Communication Standard',
  }, {
    en: 'Bank-to-corporate file-transfer protocol widely used in DE/FR/CH for exchanging pain/camt (and legacy formats) over the internet. German DK / DFÜ-Abkommen ISO flavours are still common on EBICS contracts.',
    fr: 'Protocole de transfert de fichiers banque-entreprise très utilisé en DE/FR/CH pour échanger pain/camt (et formats historiques) sur Internet. Les flavours ISO DK / DFÜ-Abkommen allemands restent courants sur les contrats EBICS.',
  }, {
    aliases: {
      en: ['Electronic Banking Internet Communication Standard', 'EBICS protocol'],
      fr: ['Electronic Banking Internet Communication Standard', 'protocole EBICS'],
    },
    seeAlso: ['pain', 'camt', 'iso-20022', 'stet'],
  }),
  g('sla', 'SLA', 'concept', { en: 'Service Level Agreement / Scheme SLA', fr: 'Engagement de service / SLA du schéma' }, {
    en: 'Time and quality target a scheme or rail imposes. SCT Inst / IPR: funds available end-to-end in ≤10 seconds; SIC IP and TIPS have their own hop clocks. Missing the scheme SLA is a compliance failure, not just slow UX.',
    fr: 'Objectif de délai et de qualité imposé par un schéma ou un rail. SCT Inst / IPR : fonds disponibles de bout en bout en ≤10 secondes ; SIC IP et TIPS ont leurs propres horloges de hop. Manquer le SLA du schéma est un écart de conformité, pas seulement une UX lente.',
  }, {
    aliases: {
      en: ['Service Level Agreement', 'scheme SLA', 'service level', 'E2E SLA'],
      fr: ['accord de niveau de service', 'SLA du schéma', 'niveau de service', 'SLA E2E'],
    },
    seeAlso: ['sct-inst', 'ipr', 'ip', 'tips', 'sic-ip'],
  }),
  g('p2p', 'P2P', 'concept', { en: 'Peer-to-peer payment', fr: 'Paiement de pair à pair' }, {
    en: 'Person-to-person transfer (send/receive), often via phone or alias rather than typing an IBAN. Life scenes and A2A overlays (Wero, Bizum, Twint…) productise P2P on top of instant rails.',
    fr: 'Virement de particulier à particulier (envoi/réception), souvent via téléphone ou alias plutôt qu’un IBAN saisi. Les scènes de vie et overlays A2A (Wero, Bizum, Twint…) industrialisent le P2P au-dessus de rails instantanés.',
  }, {
    aliases: {
      en: ['peer-to-peer', 'person-to-person', 'P2P payment'],
      fr: ['pair à pair', 'personne à personne', 'paiement P2P'],
    },
    seeAlso: ['a2a', 'a2a-overlay', 'wero', 'ip'],
  }),
  g('pan', 'PAN', 'concept', { en: 'Primary Account Number', fr: 'Numéro de compte primaire (PAN)' }, {
    en: 'Card number printed or tokenised on the payment instrument. BIN (first digits) identifies the issuer/scheme range. Card overlays (e.g. Curve) present an overlay PAN to the merchant while funding from an underlying card.',
    fr: 'Numéro de carte imprimé ou tokenisé sur l’instrument. Le BIN (premiers chiffres) identifie la plage émetteur/schéma. Les overlays carte (ex. Curve) présentent un PAN d’overlay au commerçant tout en finançant depuis une carte sous-jacente.',
  }, {
    aliases: {
      en: ['Primary Account Number', 'card number', 'card PAN'],
      fr: ['numéro de carte', 'PAN carte', 'Primary Account Number'],
    },
    seeAlso: ['bin', 'card-scheme', 'curve', '3ds'],
  }),
  g('bin', 'BIN', 'concept', { en: 'Bank Identification Number', fr: 'Bank Identification Number (BIN)' }, {
    en: 'Leading digits of a card PAN that identify the issuer and scheme range for routing authorisations. Overlay issuers (Curve, Privacy.com) use their own BIN in front of the cardholder’s underlying cards.',
    fr: 'Premiers chiffres d’un PAN carte qui identifient la plage émetteur et schéma pour le routage d’autorisation. Les émetteurs d’overlay (Curve, Privacy.com) utilisent leur propre BIN devant les cartes sous-jacentes du porteur.',
  }, {
    aliases: {
      en: ['Bank Identification Number', 'IIN', 'Issuer Identification Number', 'BIN range'],
      fr: ['Bank Identification Number', 'IIN', 'plage BIN'],
    },
    seeAlso: ['pan', 'card-scheme', 'curve'],
  }),
  g('jws', 'JWS', 'concept', { en: 'JSON Web Signature', fr: 'JSON Web Signature' }, {
    en: 'Detached or attached signature over a JSON HTTP body (RFC 7515). UK Open Banking writes require a detached JWS in `x-jws-signature` with b64=false and OB header claims; consent and payment Initiation blocks must be byte-identical.',
    fr: 'Signature détachée ou attachée sur un corps HTTP JSON (RFC 7515). Les écritures Open Banking UK exigent un JWS détaché dans `x-jws-signature` avec b64=false et claims OB en en-tête ; les blocs Initiation du consentement et du paiement doivent être octet-identiques.',
  }, {
    aliases: {
      en: ['JSON Web Signature', 'detached JWS', 'x-jws-signature'],
      fr: ['JSON Web Signature', 'JWS détaché', 'x-jws-signature'],
    },
    seeAlso: ['fapi', 'oauth2', 'open-banking', 'mtls'],
  }),
  g('pkce', 'PKCE', 'concept', {
    en: 'Proof Key for Code Exchange',
    fr: 'Proof Key for Code Exchange',
  }, {
    en: 'OAuth 2.0 extension (RFC 7636) that binds the authorisation code to the client via a code_verifier / code_challenge, mitigating interception on public clients. Required in FAPI / UK Open Banking alongside PAR.',
    fr: 'Extension OAuth 2.0 (RFC 7636) qui lie le code d’autorisation au client via code_verifier / code_challenge, limitant l’interception sur clients publics. Exigée en FAPI / Open Banking UK avec PAR.',
  }, {
    aliases: {
      en: ['Proof Key for Code Exchange', 'PKCE', 'code_challenge'],
      fr: ['Proof Key for Code Exchange', 'PKCE', 'code_challenge'],
    },
    seeAlso: ['oauth2', 'fapi', 'par', 'oidc'],
  }),
  g('par', 'PAR', 'concept', { en: 'Pushed Authorization Request', fr: 'Pushed Authorization Request' }, {
    en: 'OAuth 2.0 / FAPI pattern where the client POSTs the authorisation request parameters to the AS and receives a request_uri, instead of putting them on the front-channel redirect. UK Open Banking pairs PAR with PKCE and a signed request object.',
    fr: 'Modèle OAuth 2.0 / FAPI où le client POST les paramètres d’autorisation à l’AS et reçoit un request_uri, au lieu de les mettre sur la redirection front-channel. L’Open Banking UK associe PAR à PKCE et à un request object signé.',
  }, {
    aliases: {
      en: ['Pushed Authorization Request', 'PAR', 'request_uri'],
      fr: ['Pushed Authorization Request', 'PAR', 'request_uri'],
    },
    seeAlso: ['oauth2', 'fapi', 'pkce', 'oidc'],
  }),
  g('eea', 'EEA', 'regulation', { en: 'European Economic Area', fr: 'Espace économique européen' }, {
    en: 'EU member states plus Iceland, Liechtenstein and Norway. PSD2 passporting, AdSense consent (Funding Choices) and many Open Banking reachability rules refer to the EEA rather than the EU alone.',
    fr: 'États membres de l’UE plus Islande, Liechtenstein et Norvège. Le passeport PSD2, le consentement AdSense (Funding Choices) et de nombreuses règles de joignabilité Open Banking parlent d’EEE plutôt que de la seule UE.',
  }, {
    aliases: {
      en: ['European Economic Area', 'EEA', 'E.E.A.'],
      fr: ['Espace économique européen', 'EEE', 'EEA'],
    },
    seeAlso: ['psd2', 'passporting', 'sepa'],
  }),
  g('b2b', 'B2B', 'concept', { en: 'Business-to-business', fr: 'Business-to-business' }, {
    en: 'Business-to-business payments or mandates. In SEPA, SDD B2B is the corporate direct-debit scheme (no unconditional refund right like SDD Core). Also used loosely for any corporate A2A credit.',
    fr: 'Paiements ou mandats entre entreprises. En SEPA, le SDD B2B est le schéma de prélèvement entreprises (sans droit de remboursement inconditionnel du SDD Core). Aussi utilisé au sens large pour tout virement A2A corporate.',
  }, {
    aliases: {
      en: ['business-to-business', 'B2B', 'business to business'],
      fr: ['business-to-business', 'B2B', 'interentreprises'],
    },
    seeAlso: ['sdd', 'sct', 'a2a'],
  }),
  g('eod', 'EOD', 'concept', { en: 'End of day', fr: 'Fin de journée' }, {
    en: 'Cut-off or batch window at the end of a clearing day. Regular RTGS and batch CSMs (STEP2, SIC non-instant) organise cycles around EOD; instant rails (TIPS, SCT Inst, SIC IP) have no EOD — they run 24/7.',
    fr: 'Cut-off ou fenêtre de lot en fin de journée de compensation. Les RTGS classiques et CSM de lots (STEP2, SIC non instantané) s’organisent autour de l’EOD ; les rails instantanés (TIPS, SCT Inst, SIC IP) n’ont pas d’EOD — ils tournent 24/7.',
  }, {
    aliases: {
      en: ['end of day', 'end-of-day', 'EOD cut-off', 'day cut-off'],
      fr: ['fin de journée', 'cut-off EOD', 'clôture journalière'],
    },
    seeAlso: ['rtgs', 'csm', 'step2', 'sic', 'ip'],
  }),
  g('vpa', 'VPA', 'concept', { en: 'Virtual Payment Address', fr: 'Virtual Payment Address' }, {
    en: 'UPI alias of the form name@bank (or similar) that resolves to a payment account without exposing the underlying account number. Analogous to Pix keys or phone proxies on European A2A overlays.',
    fr: 'Alias UPI de la forme nom@banque (ou similaire) qui résout vers un compte de paiement sans exposer le numéro sous-jacent. Analogue aux clés Pix ou aux proxies téléphone des overlays A2A européens.',
  }, {
    aliases: {
      en: ['Virtual Payment Address', 'VPA', 'UPI ID'],
      fr: ['Virtual Payment Address', 'VPA', 'identifiant UPI'],
    },
    seeAlso: ['upi', 'pix', 'a2a-overlay'],
  }),
];
