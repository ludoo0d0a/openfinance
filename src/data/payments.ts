import type {
  CountryId,
  InitiationChannel,
  LocalizedText,
  Payment,
  PaymentActorId,
  PaymentHop,
  PaymentOutcome,
  SourceRef,
} from '@/types';

const L = (en: string, fr: string): LocalizedText => ({ en, fr });

const SRC_EPC: SourceRef = {
  name: 'European Payments Council',
  url: 'https://www.europeanpaymentscouncil.eu/',
  lastUpdated: '2026-08-16',
};

const SRC_ECB: SourceRef = {
  name: 'European Central Bank',
  url: 'https://www.ecb.europa.eu/paym/html/index.en.html',
  lastUpdated: '2026-08-16',
};

const SRC_EPI: SourceRef = {
  name: 'EPI / Wero',
  url: 'https://wero-wallet.eu/',
  lastUpdated: '2026-08-16',
};

const SRC_PAYPAL: SourceRef = {
  name: 'PayPal',
  url: 'https://www.paypal.com/us/digital-wallet/how-paypal-works',
  lastUpdated: '2026-08-18',
};

const SRC_CURVE: SourceRef = {
  name: 'Curve',
  url: 'https://www.curve.com/en-gb/how-it-works',
  lastUpdated: '2026-08-18',
};

const SRC_PIX: SourceRef = {
  name: 'Banco Central do Brasil — Pix',
  url: 'https://www.bcb.gov.br/en/financialstability/pix',
  lastUpdated: '2026-08-20',
};

const SRC_UPI: SourceRef = {
  name: 'NPCI — UPI',
  url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
  lastUpdated: '2026-08-20',
};

const SRC_TRUELAYER: SourceRef = {
  name: 'TrueLayer',
  url: 'https://truelayer.com/',
  lastUpdated: '2026-08-20',
};

const SRC_SIX: SourceRef = {
  name: 'SIX Interbank Clearing',
  url: 'https://www.six-group.com/en/products-services/banking-services/interbank-clearing/sic.html',
  lastUpdated: '2026-08-16',
};

const DISCLAIMER = L(
  'Teaching model of a typical path — not the EPC rulebook or a particular CSM implementation.',
  'Modèle pédagogique d’un parcours typique — pas le rulebook EPC ni l’implémentation d’un CSM particulier.',
);

function hop(
  id: string,
  from: PaymentActorId,
  to: PaymentActorId,
  opts: {
    messageShort?: string;
    simple: LocalizedText;
    expert: LocalizedText;
    tOffset?: LocalizedText;
    sla?: LocalizedText;
    flowId?: string;
    step?: number;
    sampleId?: string;
    outcomes?: PaymentOutcome[];
    rails?: string[];
    initiation?: InitiationChannel[];
    countries?: CountryId[];
  },
): PaymentHop {
  return {
    id,
    from,
    to,
    messageShort: opts.messageShort,
    simpleText: opts.simple,
    expertLabel: opts.expert,
    tOffset: opts.tOffset,
    sla: opts.sla,
    flowId: opts.flowId,
    step: opts.step,
    sampleId: opts.sampleId,
    outcomes: opts.outcomes ?? ['happy', 'reject'],
    rails: opts.rails,
    initiation: opts.initiation,
    countries: opts.countries,
  };
}

const sctHops: PaymentHop[] = [
  hop('sct-init-bank', 'payer', 'bankA', {
    messageShort: 'pain.001',
    simple: L(
      'The payer asks their bank to send €100 to the beneficiary.',
      'Le payeur demande à sa banque d’envoyer 100 € au bénéficiaire.',
    ),
    expert: L('pain.001 customer credit transfer initiation', 'pain.001 initiation de virement client'),
    tOffset: L('Day D, before cut-off', 'Jour J, avant cut-off'),
    sla: L('Next TARGET business day', 'Prochain jour TARGET'),
    flowId: 'clearing-sct-happy-path',
    step: 1,
    sampleId: 'pain-001-sct',
    initiation: ['bank'],
    outcomes: ['happy', 'reject', 'recall'],
  }),
  hop('sct-init-pisp', 'payer', 'bankA', {
    messageShort: 'pain.001',
    simple: L(
      'A payment provider initiates the transfer at the payer’s bank (open banking).',
      'Un prestataire initie le virement auprès de la banque du payeur (open banking).',
    ),
    expert: L('PISP XS2A payment initiation → pain.001 at the ASPSP', 'Initiation PISP XS2A → pain.001 chez l’ASPSP'),
    tOffset: L('Day D, before cut-off', 'Jour J, avant cut-off'),
    flowId: 'bg-pis-sepa-redirect',
    step: 2,
    sampleId: 'pain-001-sct',
    initiation: ['pisp'],
    outcomes: ['happy', 'reject', 'recall'],
  }),
  hop('sct-008-out', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L(
      'The payer’s bank sends the payment into SEPA clearing.',
      'La banque du payeur envoie le paiement dans la compensation SEPA.',
    ),
    expert: L('pacs.008 to STEP2 (SttlmMtd=CLRG, not INST)', 'pacs.008 vers STEP2 (SttlmMtd=CLRG, pas INST)'),
    tOffset: L('After cut-off batch', 'Après le cycle de cut-off'),
    flowId: 'clearing-sct-happy-path',
    step: 2,
    sampleId: 'pacs-008-sct',
    outcomes: ['happy', 'reject', 'recall'],
  }),
  hop('sct-008-in', 'csm', 'bankB', {
    messageShort: 'pacs.008',
    simple: L(
      'Clearing forwards the payment to the beneficiary’s bank.',
      'La compensation transmet le paiement à la banque du bénéficiaire.',
    ),
    expert: L('pacs.008 delivered to creditor PSP', 'pacs.008 livré au PSP créancier'),
    flowId: 'clearing-sct-happy-path',
    step: 3,
    sampleId: 'pacs-008-sct',
    outcomes: ['happy', 'reject', 'recall'],
  }),
  hop('sct-002', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('The beneficiary’s bank confirms the credit.', 'La banque du bénéficiaire confirme le crédit.'),
    expert: L('pacs.002 TxSts=ACSC', 'pacs.002 TxSts=ACSC'),
    sla: L('Scheme cycle', 'Cycle du schéma'),
    flowId: 'clearing-sct-happy-path',
    step: 4,
    sampleId: 'pacs-002-accepted',
    outcomes: ['happy', 'recall'],
  }),
  hop('sct-credit', 'bankB', 'beneficiary', {
    messageShort: 'camt.054',
    simple: L('€100 is available on the beneficiary’s account.', '100 € sont disponibles sur le compte du bénéficiaire.'),
    expert: L('camt.054 credit notification', 'camt.054 notification de crédit'),
    tOffset: L('Settlement day', 'Jour de règlement'),
    flowId: 'clearing-sct-happy-path',
    step: 6,
    sampleId: 'camt-054-credit',
    outcomes: ['happy', 'recall'],
  }),
  hop('sct-002-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L(
      'The beneficiary’s bank refuses the transfer. The money is not credited.',
      'La banque du bénéficiaire refuse le virement. L’argent n’est pas crédité.',
    ),
    expert: L('pacs.002 TxSts=RJCT + reason code', 'pacs.002 TxSts=RJCT + motif'),
    flowId: 'clearing-reject',
    step: 2,
    sampleId: 'pacs-002-rejected',
    outcomes: ['reject'],
  }),
  hop('sct-reject-back', 'csm', 'bankA', {
    messageShort: 'pacs.002',
    simple: L(
      'The payer’s bank is told it failed and releases any reservation.',
      'La banque du payeur est informée de l’échec et libère toute réserve.',
    ),
    expert: L('pacs.002 RJCT relayed to debtor PSP', 'pacs.002 RJCT relayé au PSP débiteur'),
    flowId: 'clearing-reject',
    step: 3,
    outcomes: ['reject'],
  }),
  hop('sct-056', 'bankA', 'csm', {
    messageShort: 'camt.056',
    simple: L(
      'After settlement, the payer’s bank asks to get the money back (duplicate, fraud, or customer request).',
      'Après règlement, la banque du payeur demande le retour des fonds (doublon, fraude ou demande client).',
    ),
    expert: L('camt.056 cancellation request (DUPL / TECH / FRAD / CUST)', 'camt.056 demande d’annulation (DUPL / TECH / FRAD / CUST)'),
    flowId: 'clearing-recall',
    step: 1,
    sampleId: 'camt-056-recall',
    outcomes: ['recall'],
  }),
  hop('sct-056-in', 'csm', 'bankB', {
    messageShort: 'camt.056',
    simple: L(
      'Clearing forwards the recall to the beneficiary’s bank. A recall is a request, not an order.',
      'La compensation transmet le rappel à la banque du bénéficiaire. Un rappel est une demande, pas un ordre.',
    ),
    expert: L('camt.056 delivered to creditor PSP', 'camt.056 livré au PSP créancier'),
    flowId: 'clearing-recall',
    step: 2,
    outcomes: ['recall'],
  }),
  hop('sct-029', 'bankB', 'csm', {
    messageShort: 'camt.029',
    simple: L(
      'The beneficiary’s bank accepts or refuses the recall.',
      'La banque du bénéficiaire accepte ou refuse le rappel.',
    ),
    expert: L('camt.029 resolution (ACCR or ARDT / NOAS / LEGL)', 'camt.029 résolution (ACCR ou ARDT / NOAS / LEGL)'),
    flowId: 'clearing-recall',
    step: 3,
    sampleId: 'camt-029-resolution',
    outcomes: ['recall'],
  }),
  hop('sct-004', 'bankB', 'csm', {
    messageShort: 'pacs.004',
    simple: L(
      'If accepted, the banks send the money back.',
      'Si le rappel est accepté, les banques renvoient l’argent.',
    ),
    expert: L('pacs.004 payment return (FOCR)', 'pacs.004 retour de paiement (FOCR)'),
    flowId: 'clearing-recall',
    step: 4,
    sampleId: 'pacs-004-return',
    outcomes: ['recall'],
  }),
];

const instHops: PaymentHop[] = [
  hop('inst-init-bank', 'payer', 'bankA', {
    messageShort: 'pain.001',
    simple: L('The payer chooses an instant euro transfer of €100.', 'Le payeur choisit un virement euro instantané de 100 €.'),
    expert: L('Customer instant instruction (pain.001 / bank channel)', 'Instruction instantanée client (pain.001 / canal banque)'),
    tOffset: L('t+0', 't+0'),
    sla: L('≤10 seconds end-to-end', '≤10 secondes de bout en bout'),
    flowId: 'sct-inst-happy-path',
    step: 1,
    initiation: ['bank'],
    outcomes: ['happy', 'reject', 'timeout', 'recall'],
  }),
  hop('inst-init-pisp', 'payer', 'bankA', {
    messageShort: 'pain.001',
    simple: L(
      'A payment provider starts an instant transfer at the payer’s bank.',
      'Un prestataire démarre un virement instantané chez la banque du payeur.',
    ),
    expert: L('POST …/instant-sepa-credit-transfers then pain.001/INST at ASPSP', 'POST …/instant-sepa-credit-transfers puis pain.001/INST chez l’ASPSP'),
    tOffset: L('t+0', 't+0'),
    flowId: 'sct-inst-happy-path',
    step: 2,
    sampleId: 'bg-instant-payment-request',
    initiation: ['pisp'],
    outcomes: ['happy', 'reject', 'timeout', 'recall'],
  }),
  hop('inst-vop', 'bankA', 'bankB', {
    messageShort: 'acmt.023',
    simple: L(
      'The payer’s bank checks that the name matches the beneficiary IBAN (Verification of Payee).',
      'La banque du payeur vérifie que le nom correspond à l’IBAN du bénéficiaire (Verification of Payee).',
    ),
    expert: L('VoP acmt.023 request → acmt.024 MTCH/CMTC/NMTC', 'VoP acmt.023 → acmt.024 MTCH/CMTC/NMTC'),
    tOffset: L('before authorisation', 'avant autorisation'),
    flowId: 'sct-inst-vop',
    step: 2,
    sampleId: 'acmt-023-vop',
    outcomes: ['happy', 'reject', 'timeout', 'recall'],
  }),
  hop('inst-008-out', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L(
      'The payer’s bank sends the instant payment into TIPS or RT1.',
      'La banque du payeur envoie le paiement instantané dans TIPS ou RT1.',
    ),
    expert: L('pacs.008 LclInstrm=INST, ClrSys=TIPS|RT1', 'pacs.008 LclInstrm=INST, ClrSys=TIPS|RT1'),
    tOffset: L('seconds', 'quelques secondes'),
    sla: L('Scheme clock running', 'Horloge du schéma en cours'),
    flowId: 'sct-inst-happy-path',
    step: 4,
    sampleId: 'pacs-008-sct-inst',
    outcomes: ['happy', 'reject', 'timeout', 'recall'],
  }),
  hop('inst-008-in', 'csm', 'bankB', {
    messageShort: 'pacs.008',
    simple: L(
      'The instant rail delivers the payment to the beneficiary’s bank.',
      'Le rail instantané livre le paiement à la banque du bénéficiaire.',
    ),
    expert: L('pacs.008 forwarded to creditor PSP', 'pacs.008 transmis au PSP créancier'),
    flowId: 'sct-inst-happy-path',
    step: 5,
    sampleId: 'pacs-008-sct-inst',
    outcomes: ['happy', 'reject', 'timeout', 'recall'],
  }),
  hop('inst-002-ok', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('The beneficiary’s bank accepts; €100 is available at once.', 'La banque du bénéficiaire accepte ; 100 € sont disponibles tout de suite.'),
    expert: L('pacs.002 TxSts=ACSC (only ACSC ends the happy path)', 'pacs.002 TxSts=ACSC (seul ACSC clôt le happy path)'),
    sla: L('Inside the 10-second window', 'Dans la fenêtre de 10 secondes'),
    flowId: 'sct-inst-happy-path',
    step: 6,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['happy', 'recall'],
  }),
  hop('inst-002-back', 'csm', 'bankA', {
    messageShort: 'pacs.002',
    simple: L('The payer’s bank is told the transfer settled.', 'La banque du payeur est informée que le virement est réglé.'),
    expert: L('pacs.002 ACSC to debtor PSP', 'pacs.002 ACSC vers PSP débiteur'),
    flowId: 'sct-inst-happy-path',
    step: 7,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['happy', 'recall'],
  }),
  hop('inst-credit', 'bankB', 'beneficiary', {
    messageShort: 'camt.054',
    simple: L('The beneficiary sees the credit immediately.', 'Le bénéficiaire voit le crédit immédiatement.'),
    expert: L('camt.054 credit notification', 'camt.054 notification de crédit'),
    tOffset: L('≤10s', '≤10s'),
    flowId: 'sct-inst-happy-path',
    step: 8,
    sampleId: 'camt-054-credit',
    outcomes: ['happy', 'recall'],
  }),
  hop('inst-056', 'bankA', 'csm', {
    messageShort: 'camt.056',
    simple: L(
      'After the instant credit, the payer’s bank asks to get the money back (fraud or duplicate).',
      'Après le crédit instantané, la banque du payeur demande le retour des fonds (fraude ou doublon).',
    ),
    expert: L('camt.056 recall (FRAD / DUPL / TECH)', 'camt.056 rappel (FRAD / DUPL / TECH)'),
    flowId: 'sct-inst-recall',
    step: 1,
    sampleId: 'camt-056-recall',
    outcomes: ['recall'],
  }),
  hop('inst-056-in', 'csm', 'bankB', {
    messageShort: 'camt.056',
    simple: L(
      'The instant rail forwards the recall. Funds may already have been withdrawn.',
      'Le rail instantané transmet le rappel. Les fonds peuvent déjà avoir été retirés.',
    ),
    expert: L('camt.056 to creditor PSP', 'camt.056 vers PSP créancier'),
    flowId: 'sct-inst-recall',
    step: 2,
    outcomes: ['recall'],
  }),
  hop('inst-029', 'bankB', 'csm', {
    messageShort: 'camt.029',
    simple: L(
      'The beneficiary’s bank accepts or refuses. Instant does not mean irreversible, but a no is common.',
      'La banque du bénéficiaire accepte ou refuse. Instantané ne veut pas dire irréversible, mais un refus est fréquent.',
    ),
    expert: L('camt.029 resolution (ACCR or NOAS / ARDT / LEGL)', 'camt.029 résolution (ACCR ou NOAS / ARDT / LEGL)'),
    flowId: 'sct-inst-recall',
    step: 3,
    sampleId: 'camt-029-resolution',
    outcomes: ['recall'],
  }),
  hop('inst-004', 'bankB', 'csm', {
    messageShort: 'pacs.004',
    simple: L(
      'If accepted, the money comes back as a return.',
      'Si le rappel est accepté, l’argent revient en retour.',
    ),
    expert: L('pacs.004 return (FOCR)', 'pacs.004 retour (FOCR)'),
    flowId: 'sct-inst-recall',
    step: 4,
    sampleId: 'pacs-004-return',
    outcomes: ['recall'],
  }),
  hop('inst-002-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L(
      'The beneficiary’s bank refuses inside the 10-second window. The money never leaves the reservation.',
      'La banque du bénéficiaire refuse dans la fenêtre de 10 secondes. L’argent ne quitte pas la réservation.',
    ),
    expert: L('pacs.002 TxSts=RJCT + reason code', 'pacs.002 TxSts=RJCT + motif'),
    sla: L('Still inside the scheme SLA', 'Toujours dans le SLA du schéma'),
    flowId: 'sct-inst-reject',
    step: 2,
    sampleId: 'pacs-002-sct-inst-reject',
    outcomes: ['reject'],
  }),
  hop('inst-reverse', 'csm', 'bankA', {
    messageShort: 'pacs.002',
    simple: L('The payer’s bank releases the hold and tells the payer it failed.', 'La banque du payeur libère la réserve et informe le payeur de l’échec.'),
    expert: L('RJCT returned to debtor PSP; API status maps to rejected', 'RJCT renvoyé au PSP débiteur ; le statut API devient rejected'),
    flowId: 'sct-inst-reject',
    step: 3,
    outcomes: ['reject'],
  }),
  hop('inst-timeout', 'csm', 'bankA', {
    simple: L(
      'No answer comes back in time. The money is reserved; nobody yet knows if it settled.',
      'Aucune réponse n’arrive à temps. L’argent est réservé ; personne ne sait encore s’il est réglé.',
    ),
    expert: L('No pacs.002 inside the SLA — hold the reservation, do not re-initiate', 'Pas de pacs.002 dans le SLA — garder la réserve, ne pas réémettre'),
    sla: L('Window expired', 'Fenêtre expirée'),
    flowId: 'sepa-instant-timeout',
    step: 2,
    outcomes: ['timeout'],
  }),
  hop('inst-028', 'bankA', 'csm', {
    messageShort: 'pacs.028',
    simple: L(
      'The payer’s bank asks the rail what happened (status request).',
      'La banque du payeur demande au rail ce qui s’est passé (demande de statut).',
    ),
    expert: L('pacs.028 investigation quoting TxId / EndToEndId', 'pacs.028 investigation citant TxId / EndToEndId'),
    flowId: 'sepa-instant-timeout',
    step: 3,
    sampleId: 'pacs-028-sct-inst',
    outcomes: ['timeout'],
  }),
  hop('inst-timeout-late', 'bankB', 'bankA', {
    messageShort: 'pacs.002',
    simple: L(
      'A late acknowledgement arrives — settled or refused. Until then, do not tell the payer it failed.',
      'Un accusé tardif arrive — réglé ou refusé. D’ici là, ne dites pas au payeur que ça a échoué.',
    ),
    expert: L('Late pacs.002 ACSC or RJCT after pacs.028', 'pacs.002 tardif ACSC ou RJCT après pacs.028'),
    flowId: 'sepa-instant-timeout',
    step: 4,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['timeout'],
  }),
];

const weroHops: PaymentHop[] = [
  hop('wero-intent', 'payer', 'scheme', {
    simple: L(
      'The payer starts an A2A overlay payment (e.g. Wero checkout or P2P).',
      'Le payeur démarre un paiement overlay A2A (ex. checkout ou P2P Wero).',
    ),
    expert: L(
      'Overlay payment intent (amount, payee alias, return URLs) — Wero sample',
      'Intention overlay (montant, alias, URLs de retour) — exemple Wero',
    ),
    tOffset: L('t+0', 't+0'),
    flowId: 'wero-a2a-payment',
    step: 1,
    sampleId: 'wero-payment-create',
  }),
  hop('wero-proxy', 'scheme', 'scheme', {
    simple: L(
      'The overlay resolves the phone or email to an IBAN (Wero directory; Bizum/Swish do the same with a mobile number).',
      'L’overlay résout le téléphone ou l’e-mail en IBAN (annuaire Wero ; Bizum/Swish font de même avec un mobile).',
    ),
    expert: L('Proxy directory lookup; still run VoP where required', 'Annuaire proxy ; VoP toujours si la régulation l’exige'),
    flowId: 'wero-a2a-payment',
    step: 2,
    sampleId: 'wero-proxy-resolve',
  }),
  hop('wero-auth', 'payer', 'bankA', {
    simple: L(
      'The payer confirms in the bank or overlay app (e.g. Wero).',
      'Le payeur confirme dans l’app banque ou overlay (ex. Wero).',
    ),
    expert: L('ASPSP authentication / SCA when required', 'Authentification ASPSP / SCA si requise'),
    flowId: 'wero-a2a-payment',
    step: 3,
  }),
  hop('wero-008-out', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L(
      'The bank settles on the instant rail (SEPA Instant on TIPS or RT1 for Wero).',
      'La banque règle sur le rail instantané (SEPA Instant sur TIPS ou RT1 pour Wero).',
    ),
    expert: L('Underlying SCT Inst pacs.008 INST', 'pacs.008 INST SCT Inst sous-jacent'),
    sla: L('≤10 seconds', '≤10 secondes'),
    flowId: 'wero-a2a-payment',
    step: 4,
    sampleId: 'pacs-008-sct-inst',
  }),
  hop('wero-008-in', 'csm', 'bankB', {
    messageShort: 'pacs.008',
    simple: L('Instant rail delivers the credit to the beneficiary’s bank.', 'Le rail instantané livre le crédit à la banque du bénéficiaire.'),
    expert: L('pacs.008 to creditor PSP', 'pacs.008 vers PSP créancier'),
    flowId: 'wero-a2a-payment',
    step: 4,
    sampleId: 'pacs-008-sct-inst',
  }),
  hop('wero-002', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Settlement completes; the overlay tracks the same outcome.', 'Le règlement se termine ; l’overlay suit le même résultat.'),
    expert: L('pacs.002 ACSC; scheme status tracks clearing', 'pacs.002 ACSC ; le statut schéma suit la compensation'),
    flowId: 'wero-a2a-payment',
    step: 5,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['happy'],
  }),
  hop('wero-done', 'scheme', 'beneficiary', {
    simple: L('The beneficiary (or merchant) is paid.', 'Le bénéficiaire (ou le commerçant) est payé.'),
    expert: L('Overlay completion + SCT Inst credit', 'Fin overlay + crédit SCT Inst'),
    flowId: 'wero-a2a-payment',
    step: 5,
    outcomes: ['happy'],
  }),
  hop('wero-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Instant settlement is refused; the overlay marks the intent failed.', 'Le règlement instantané est refusé ; l’overlay marque l’intention en échec.'),
    expert: L('pacs.002 RJCT; scheme status failed', 'pacs.002 RJCT ; statut schéma failed'),
    flowId: 'sct-inst-reject',
    step: 2,
    sampleId: 'pacs-002-sct-inst-reject',
    outcomes: ['reject'],
  }),
];

const paypalHops: PaymentHop[] = [
  hop('paypal-choose', 'payer', 'merchant', {
    simple: L(
      'The payer chooses a digital wallet (e.g. PayPal, Apple Pay, Google Pay) at checkout for €100.',
      'Le payeur choisit un wallet numérique (ex. PayPal, Apple Pay, Google Pay) au checkout pour 100 €.',
    ),
    expert: L(
      'Wallet checkout — merchant has not seen a card PAN yet',
      'Checkout wallet — le commerçant n’a pas encore vu de PAN carte',
    ),
    tOffset: L('t+0', 't+0'),
    initiation: ['merchant'],
  }),
  hop('paypal-auth', 'payer', 'scheme', {
    simple: L(
      'The payer authenticates at the wallet provider (SCA) and confirms.',
      'Le payeur s’identifie chez le fournisseur de wallet (SCA) et confirme.',
    ),
    expert: L('Wallet customer authentication / SCA (e.g. PayPal, Apple Pay)', 'Authentification client wallet / SCA (ex. PayPal, Apple Pay)'),
  }),
  hop('paypal-fund', 'scheme', 'bankA', {
    simple: L(
      'The wallet takes €100 from a linked card, bank account, or internal balance (e.g. PayPal balance).',
      'Le wallet prélève 100 € sur la carte liée, le compte bancaire ou le solde interne (ex. solde PayPal).',
    ),
    expert: L(
      'Funding: card-scheme auth on linked PAN, SEPA direct debit, or e-money ledger',
      'Funding : auth schéma carte sur PAN lié, prélèvement SEPA, ou ledger de monnaie électronique',
    ),
    outcomes: ['happy', 'reject'],
  }),
  hop('paypal-notify', 'scheme', 'merchant', {
    simple: L(
      'The wallet tells the merchant the order is paid. The merchant never sees the card.',
      'Le wallet informe le commerçant que la commande est payée. Le commerçant ne voit pas la carte.',
    ),
    expert: L(
      'Capture / webhook notification — wallet provider is acquirer of record',
      'Capture / notification webhook — le fournisseur de wallet est l’acquéreur de record',
    ),
    outcomes: ['happy'],
  }),
  hop('paypal-payout', 'scheme', 'bankB', {
    messageShort: 'pacs.008',
    simple: L(
      'Later, the wallet provider pays the merchant — often via SEPA credit transfer.',
      'Plus tard, le fournisseur de wallet paie le commerçant — souvent par virement SEPA.',
    ),
    expert: L(
      'Merchant settlement; often SCT pacs.008 from wallet provider bank',
      'Règlement commerçant ; souvent un pacs.008 SCT depuis la banque du wallet',
    ),
    tOffset: L('D+1 or batch', 'J+1 ou lot'),
    sampleId: 'pacs-008-sct',
    outcomes: ['happy'],
  }),
  hop('paypal-rjct', 'bankA', 'scheme', {
    simple: L(
      'The linked card or bank refuses. The wallet does not capture; the merchant is not paid.',
      'La carte liée ou la banque refuse. Le wallet ne capture pas ; le commerçant n’est pas payé.',
    ),
    expert: L('Funding decline — no merchant capture', 'Refus du funding — pas de capture commerçant'),
    outcomes: ['reject'],
  }),
];

const curveHops: PaymentHop[] = [
  hop('curve-tap', 'payer', 'merchant', {
    simple: L(
      'The payer pays with a card overlay (e.g. Curve card) — a Mastercard in front of real cards.',
      'Le payeur paie avec un overlay carte (ex. carte Curve) — une Mastercard devant ses vraies cartes.',
    ),
    expert: L(
      'Card present / e-com with overlay PAN (e.g. Curve Mastercard BIN)',
      'Carte présente / e-com avec PAN overlay (ex. BIN Mastercard Curve)',
    ),
    tOffset: L('t+0', 't+0'),
    initiation: ['merchant'],
  }),
  hop('curve-acq', 'merchant', 'acquirer', {
    simple: L(
      'The merchant’s acquirer forwards authorization — seeing the overlay card, not underlying bank card.',
      'L’acquéreur du commerçant relaie l’autorisation — il voit la carte d’overlay, pas la carte bancaire.',
    ),
    expert: L('Acquirer auth on overlay PAN', 'Auth acquéreur sur le PAN overlay'),
  }),
  hop('curve-route', 'acquirer', 'scheme', {
    simple: L(
      'Card scheme routes to the overlay provider (e.g. Curve) as issuer of that PAN.',
      'Le schéma carte route vers l’émetteur d’overlay (ex. Curve), émetteur de ce PAN.',
    ),
    expert: L('Scheme switch to overlay BIN / issuer (e.g. Curve)', 'Commutateur schéma vers BIN / émetteur overlay (ex. Curve)'),
  }),
  hop('curve-pull', 'scheme', 'bankA', {
    simple: L(
      'Curve asks the selected underlying card’s issuer to hold €100.',
      'Curve demande à l’émetteur de la carte sous-jacente de réserver 100 €.',
    ),
    expert: L(
      'Second authorization: Curve on the funding card (card-on-card)',
      'Seconde autorisation : Curve sur la carte de funding (carte-sur-carte)',
    ),
    outcomes: ['happy', 'reject'],
  }),
  hop('curve-ok', 'bankA', 'scheme', {
    simple: L(
      'The underlying issuer approves. Curve then approves the merchant authorization.',
      'L’émetteur sous-jacent approuve. Curve approuve alors l’autorisation commerçant.',
    ),
    expert: L(
      'Dual-auth complete: funding-card hold + Curve issuer approve',
      'Double auth : réserve carte de funding + approbation émetteur Curve',
    ),
    outcomes: ['happy'],
  }),
  hop('curve-clear', 'acquirer', 'scheme', {
    simple: L(
      'Later, two clearings move: merchant vs Curve, and Curve vs the underlying card.',
      'Plus tard, deux compensations : commerçant vs Curve, et Curve vs la carte sous-jacente.',
    ),
    expert: L(
      'Two card clearing files (not ISO 20022 pacs)',
      'Deux fichiers de clearing carte (pas des pacs ISO 20022)',
    ),
    tOffset: L('D or D+1', 'J ou J+1'),
    outcomes: ['happy'],
  }),
  hop('curve-settle', 'scheme', 'bankB', {
    simple: L(
      'Settlement credits the merchant. Curve settles separately with the payer’s bank.',
      'Le règlement crédite le commerçant. Curve règle à part avec la banque du payeur.',
    ),
    expert: L(
      'Scheme settlement to acquirer; Curve vs issuer is a second settlement',
      'Règlement schéma vers acquéreur ; Curve vs émetteur est un second règlement',
    ),
    outcomes: ['happy'],
  }),
  hop('curve-rjct', 'bankA', 'scheme', {
    simple: L(
      'The underlying card is declined. Curve declines the merchant auth — one refusal, two schemes.',
      'La carte sous-jacente est refusée. Curve refuse l’auth commerçant — un refus, deux schémas.',
    ),
    expert: L(
      'Funding-card decline mapped to Curve issuer decline',
      'Refus de la carte de funding reporté en refus émetteur Curve',
    ),
    outcomes: ['reject'],
  }),
];

const sddHops: PaymentHop[] = [
  hop('sdd-pain', 'beneficiary', 'bankB', {
    messageShort: 'pain.008',
    simple: L('The creditor sends a €100 collection instruction with the mandate reference.', 'Le créancier envoie une instruction de prélèvement de 100 € avec la référence de mandat.'),
    expert: L('pain.008 SDD Core / B2B with MndtId and SeqTp', 'pain.008 SDD Core / B2B avec MndtId et SeqTp'),
    tOffset: L('Before collection date', 'Avant la date de prélèvement'),
    sampleId: 'pain-008-sdd',
    initiation: ['creditor'],
  }),
  hop('sdd-out', 'bankB', 'csm', {
    messageShort: 'pain.008',
    simple: L('The creditor’s bank submits the collection into SEPA clearing (STEP2).', 'La banque du créancier soumet le prélèvement dans la compensation SEPA (STEP2).'),
    expert: L('CSM collection batch (STEP2 SDD)', 'Lot de prélèvement CSM (STEP2 SDD)'),
    sla: L('Scheme collection cycle', 'Cycle de prélèvement du schéma'),
  }),
  hop('sdd-in', 'csm', 'bankA', {
    simple: L('Clearing presents the debit to the payer’s bank.', 'La compensation présente le débit à la banque du payeur.'),
    expert: L('Debtor PSP receives collection', 'Le PSP débiteur reçoit le prélèvement'),
  }),
  hop('sdd-debit', 'bankA', 'payer', {
    simple: L('€100 leaves the payer’s account under the mandate.', '100 € quittent le compte du payeur sous le mandat.'),
    expert: L('Account debit; camt.054 debit notification may follow', 'Débit compte ; camt.054 débit peut suivre'),
    sampleId: 'camt-054-credit',
    outcomes: ['happy'],
  }),
  hop('sdd-return', 'bankA', 'csm', {
    messageShort: 'pacs.004',
    simple: L('The payer’s bank returns the collection (R-transaction).', 'La banque du payeur retourne le prélèvement (R-transaction).'),
    expert: L('pacs.004 return / reverse with reason code', 'pacs.004 retour / reverse avec motif'),
    sampleId: 'pacs-002-rejected',
    outcomes: ['reject'],
  }),
];

const cardHops: PaymentHop[] = [
  hop('card-auth', 'payer', 'merchant', {
    simple: L('The payer presents a card at checkout for €100.', 'Le payeur présente une carte au checkout pour 100 €.'),
    expert: L('Card present / e-com authorization request', 'Demande d’autorisation carte présente / e-com'),
    tOffset: L('t+0', 't+0'),
    initiation: ['merchant'],
  }),
  hop('card-acq', 'merchant', 'acquirer', {
    simple: L('The merchant’s acquirer forwards the authorization.', 'L’acquéreur du commerçant relaie l’autorisation.'),
    expert: L('Acquirer → scheme authorization', 'Acquéreur → autorisation schéma'),
  }),
  hop('card-scheme', 'acquirer', 'scheme', {
    simple: L('The card scheme routes to the issuer bank.', 'Le schéma carte route vers la banque émettrice.'),
    expert: L('Scheme switch / network authorization', 'Commutateur schéma / autorisation réseau'),
  }),
  hop('card-issuer', 'scheme', 'bankA', {
    simple: L('The issuer approves and holds €100.', 'L’émetteur approuve et réserve 100 €.'),
    expert: L('Issuer auth response (approve / decline)', 'Réponse auth émetteur (approuvé / refusé)'),
    outcomes: ['happy', 'reject'],
  }),
  hop('card-clear', 'acquirer', 'scheme', {
    simple: L('Later, clearing files move the transaction for settlement.', 'Plus tard, les fichiers de compensation préparent le règlement.'),
    expert: L('Clearing batch (not ISO 20022 pacs)', 'Lot de clearing (pas des pacs ISO 20022)'),
    tOffset: L('D or D+1', 'J ou J+1'),
    outcomes: ['happy'],
  }),
  hop('card-settle', 'scheme', 'bankB', {
    simple: L('Settlement credits the merchant side.', 'Le règlement crédite le côté commerçant.'),
    expert: L('Scheme settlement to acquirer / merchant bank', 'Règlement schéma vers acquéreur / banque commerçant'),
    outcomes: ['happy'],
  }),
];

const swiftHops: PaymentHop[] = [
  hop('swift-init', 'payer', 'bankA', {
    messageShort: 'pain.001',
    simple: L('The payer instructs a cross-border credit transfer.', 'Le payeur donne instruction d’un virement transfrontalier.'),
    expert: L('Customer initiation (pain.001 or bank channel)', 'Initiation client (pain.001 ou canal banque)'),
    initiation: ['bank'],
  }),
  hop('swift-008', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L('The payer’s bank sends an ISO 20022 credit transfer over SWIFT CBPR+.', 'La banque du payeur envoie un virement ISO 20022 sur SWIFT CBPR+.'),
    expert: L('pacs.008 CBPR+ (often .001.10 / .001.13 — not SEPA .08)', 'pacs.008 CBPR+ (souvent .001.10 / .001.13 — pas le SEPA .08)'),
    sampleId: 'pacs-008-sct',
    sla: L('Correspondent / HVPS windows', 'Fenêtres correspondant / HVPS'),
  }),
  hop('swift-mid', 'csm', 'bankB', {
    messageShort: 'pacs.008',
    simple: L('Correspondents or the market infrastructure deliver to the beneficiary’s bank.', 'Correspondants ou infrastructure de marché livrent à la banque du bénéficiaire.'),
    expert: L('FI-to-FI path; cover may use pacs.009', 'Chemin FI-to-FI ; cover possible via pacs.009'),
  }),
  hop('swift-002', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Status comes back — settled or rejected.', 'Le statut revient — réglé ou rejeté.'),
    expert: L('pacs.002; pair schema version with the pacs.008', 'pacs.002 ; aligner la version de schéma sur le pacs.008'),
    sampleId: 'pacs-002-accepted',
    outcomes: ['happy'],
  }),
  hop('swift-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('The transfer is rejected with a reason code.', 'Le virement est rejeté avec un motif.'),
    expert: L('pacs.002 RJCT + reason', 'pacs.002 RJCT + motif'),
    sampleId: 'pacs-002-rejected',
    outcomes: ['reject'],
  }),
];

const instantA2aHops: PaymentHop[] = [
  hop('ia2a-alias', 'payer', 'scheme', {
    simple: L(
      'The payer addresses the payee with a scheme alias (Pix key, UPI VPA) — not an overlay on SCT Inst.',
      'Le payeur adresse le bénéficiaire avec un alias du schéma (clé Pix, VPA UPI) — pas un overlay sur SCT Inst.',
    ),
    expert: L('Alias directory is the scheme itself (Pix / UPI)', 'L’annuaire d’alias est le schéma (Pix / UPI)'),
    tOffset: L('t+0', 't+0'),
    initiation: ['merchant'],
  }),
  hop('ia2a-auth', 'payer', 'bankA', {
    simple: L(
      'The payer confirms in a participating app (bank, PhonePe, Google Pay India, …).',
      'Le payeur confirme dans une app participante (banque, PhonePe, Google Pay India, …).',
    ),
    expert: L('In-scheme SCA / device auth', 'SCA / auth appareil dans le schéma'),
  }),
  hop('ia2a-out', 'bankA', 'csm', {
    simple: L(
      'The domestic instant rail settles in seconds, 24/7 (Pix SPI, UPI).',
      'Le rail instantané domestique règle en secondes, 24/7 (Pix SPI, UPI).',
    ),
    expert: L('National instant CSM — not TIPS/RT1', 'CSM instantané national — pas TIPS/RT1'),
    sla: L('Seconds, 24/7', 'Secondes, 24/7'),
    outcomes: ['happy', 'reject'],
  }),
  hop('ia2a-in', 'csm', 'bankB', {
    simple: L('The payee’s account is credited immediately.', 'Le compte du bénéficiaire est crédité immédiatement.'),
    expert: L('Immediate funds availability on the scheme clock', 'Disponibilité immédiate des fonds sur l’horloge du schéma'),
    outcomes: ['happy'],
  }),
  hop('ia2a-done', 'scheme', 'beneficiary', {
    simple: L('The scheme shows paid. There is no separate wallet status vs clearing status.', 'Le schéma affiche payé. Pas de statut wallet distinct du clearing.'),
    expert: L('Retail product = instant scheme', 'Produit retail = schéma instantané'),
    outcomes: ['happy'],
  }),
  hop('ia2a-rjct', 'bankB', 'csm', {
    simple: L('The instant credit is refused; the scheme marks the payment failed.', 'Le crédit instantané est refusé ; le schéma marque l’échec.'),
    expert: L('Scheme-level reject, not an overlay intent fail on SCT Inst', 'Rejet schéma, pas un échec d’intent overlay sur SCT Inst'),
    outcomes: ['reject'],
  }),
];

const pispA2aHops: PaymentHop[] = [
  hop('pisp-choose', 'payer', 'merchant', {
    simple: L(
      'The payer chooses pay-by-bank at checkout (e.g. TrueLayer). A TPP — not a bank consortium overlay.',
      'Le payeur choisit le paiement bancaire au checkout (ex. TrueLayer). Un TPP — pas un overlay de consortium bancaire.',
    ),
    expert: L('Merchant checkout → PISP (XS2A), not Wero/Bizum proxy', 'Checkout commerçant → PISP (XS2A), pas de proxy Wero/Bizum'),
    tOffset: L('t+0', 't+0'),
    initiation: ['pisp'],
  }),
  hop('pisp-xs2a', 'scheme', 'bankA', {
    messageShort: 'pain.001',
    simple: L(
      'The PISP initiates the transfer at the payer’s bank over open banking (Berlin Group / STET).',
      'Le PISP initie le virement chez la banque du payeur via l’open banking (Berlin Group / STET).',
    ),
    expert: L('PISP XS2A payment initiation → pain.001 at the ASPSP', 'Initiation PISP XS2A → pain.001 chez l’ASPSP'),
    flowId: 'bg-pis-sepa-redirect',
    step: 1,
    sampleId: 'pain-001-sct',
    initiation: ['pisp'],
  }),
  hop('pisp-sca', 'payer', 'bankA', {
    simple: L('The payer authenticates at their bank (SCA), not in a scheme wallet.', 'Le payeur s’authentifie chez sa banque (SCA), pas dans un wallet schéma.'),
    expert: L('ASPSP SCA (redirect or decoupled)', 'SCA ASPSP (redirect ou découplée)'),
    flowId: 'bg-pis-sepa-redirect',
    step: 4,
  }),
  hop('pisp-008', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L('The ASPSP sends SCT Inst (or SCT) into clearing — same rail as a bank-channel transfer.', 'L’ASPSP envoie du SCT Inst (ou SCT) en compensation — même rail qu’un virement canal banque.'),
    expert: L('pacs.008 INST on TIPS/RT1 when instant', 'pacs.008 INST sur TIPS/RT1 si instantané'),
    sla: L('≤10 seconds if SCT Inst', '≤10 secondes si SCT Inst'),
    flowId: 'sct-inst-happy-path',
    step: 4,
    sampleId: 'pacs-008-sct-inst',
  }),
  hop('pisp-002', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Settlement completes. The PISP polls payment status; it does not run the CSM.', 'Le règlement se termine. Le PISP interroge le statut ; il n’opère pas le CSM.'),
    expert: L('pacs.002 ACSC; TPP GET /status is not clearing', 'pacs.002 ACSC ; le GET /status TPP n’est pas la compensation'),
    flowId: 'sct-inst-happy-path',
    step: 6,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['happy'],
  }),
  hop('pisp-done', 'scheme', 'merchant', {
    simple: L('The PISP tells the merchant the payment succeeded.', 'Le PISP informe le commerçant que le paiement a réussi.'),
    expert: L('PISP webhook / status to merchant', 'Webhook / statut PISP vers le commerçant'),
    outcomes: ['happy'],
  }),
  hop('pisp-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Clearing refuses; the PISP surfaces the bank/ISO reason, not a wallet undo.', 'La compensation refuse ; le PISP remonte le motif banque/ISO, pas un undo wallet.'),
    expert: L('pacs.002 RJCT → PISP payment RJCT', 'pacs.002 RJCT → paiement PISP RJCT'),
    flowId: 'sct-inst-reject',
    step: 2,
    sampleId: 'pacs-002-sct-inst-reject',
    outcomes: ['reject'],
  }),
];

export const PAYMENTS: Payment[] = [
  {
    id: 'sepa-credit-transfer',
    kind: 'credit-transfer',
    name: L('SEPA Credit Transfer', 'Virement SEPA'),
    shortName: 'SCT',
    summary: L(
      'A non-urgent euro credit transfer: the payer’s bank, STEP2 (or TARGET2 T2 RTGS), the beneficiary’s bank.',
      'Un virement euro non urgent : banque du payeur, STEP2 (ou TARGET2 T2 RTGS), banque du bénéficiaire.',
    ),
    schemeId: 'sct',
    infrastructureIds: ['step2', 'tips', 'eurosic'],
    defaultRailId: 'step2',
    messageShorts: ['pain.001', 'pacs.008', 'pacs.002', 'camt.054', 'camt.056', 'camt.029', 'pacs.004'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: sctHops,
    relatedFlowIds: ['clearing-sct-happy-path', 'bg-pis-sepa-redirect', 'clearing-reject', 'clearing-recall', 'target2-regular-payment'],
    initiationChannels: ['bank', 'pisp'],
    comparePaymentId: 'sepa-instant',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 travel from France to Germany on SCT?',
        'Comment 100 € voyagent-ils de la France vers l’Allemagne en SCT ?',
      ),
    },
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_EPC],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'sepa-instant',
    kind: 'instant',
    name: L('SEPA Instant', 'SEPA Instant'),
    shortName: 'SCT Inst',
    summary: L(
      'SCT Inst checkout: the rail itself (TIPS or RT1), no proxy/wallet overlay. A €100 instant euro transfer France → Germany: Verification of Payee, funds in ≤10 seconds.',
      'Checkout SCT Inst : le rail lui-même (TIPS ou RT1), pas d’overlay proxy/wallet. Un virement euro instantané de 100 € France → Allemagne : Verification of Payee, fonds en ≤10 secondes.',
    ),
    schemeId: 'sct-inst',
    infrastructureIds: ['tips', 'rt1'],
    defaultRailId: 'tips',
    messageShorts: ['pain.001', 'acmt.023', 'acmt.024', 'pacs.008', 'pacs.002', 'pacs.028', 'camt.054', 'camt.056', 'camt.029', 'pacs.004'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: instHops,
    relatedFlowIds: [
      'sct-inst-happy-path',
      'sct-inst-vop',
      'sct-inst-reject',
      'sepa-instant-timeout',
      'sct-inst-recall',
    ],
    initiationChannels: ['bank', 'pisp'],
    comparePaymentId: 'sepa-credit-transfer',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 travel from France to Germany?',
        'Comment 100 € voyagent-ils de la France vers l’Allemagne ?',
      ),
      body: [
        L(
          'SEPA Instant Credit Transfer (SCT Inst) is the scheme rulebook for euro credit transfers that must settle in seconds, not on the next TARGET clearing cycle. The payer’s bank (or a PISP initiating on their behalf) builds a pacs.008 with Local Instrument INST and submits it to an instant CSM such as TIPS or RT1. The creditor PSP must accept or reject inside the scheme SLA — typically within a few seconds — so the debtor can be told the money has arrived.',
          'Le SCT Inst (SEPA Instant Credit Transfer) est le rulebook des virements euro qui doivent se régler en secondes, pas au prochain cycle TARGET. La banque du payeur (ou un PISP) construit un pacs.008 avec Local Instrument INST et le soumet à un CSM instantané (TIPS ou RT1). Le PSP créancier doit accepter ou rejeter dans le SLA du schéma — en pratique quelques secondes — pour que le débiteur sache que les fonds sont arrivés.',
        ),
        L(
          'Before the pacs.008 leaves, many corridors now run Verification of Payee (VoP / Confirmation of Payee): the debtor name is checked against the creditor IBAN so a mistyped beneficiary is caught early. After settlement, both sides may see camt.054 notifications; recalls use camt.056 and may end in pacs.004. OpenFinance walks that path hop by hop with sample ISO 20022 payloads — educational only, not a live rail.',
          'Avant le départ du pacs.008, beaucoup de corridors enchaînent une Verification of Payee (VoP) : le nom du débiteur est contrôlé contre l’IBAN créancier pour éviter un mauvais bénéficiaire. Après règlement, les deux côtés peuvent recevoir des camt.054 ; les rappels passent par camt.056 et peuvent finir en pacs.004. OpenFinance déroule ce chemin hop par hop avec des payloads ISO 20022 d’exemple — purement pédagogique, pas un rail réel.',
        ),
      ],
    },
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_EPC, SRC_ECB],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'wero',
    kind: 'wallet',
    name: L('A2A Overlay', 'Overlay A2A'),
    summary: L(
      'Retail A2A overlay: intent and proxy on the scheme, settlement on an instant rail. Samples: Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Not Pix/UPI, not SCT Inst checkout, not PISP A2A, not PayPal/Alipay/Apple Pay.',
      'Overlay A2A retail : intention et proxy côté schéma, règlement sur un rail instantané. Exemples : Wero (FR/DE), Bizum (ES), Payconiq (BE/LU), iDEAL (NL), BLIK (PL), Swish (SE), Vipps MobilePay (NO/DK/FI), TWINT (CH). Pas Pix/UPI, pas le checkout SCT Inst, pas le PISP A2A, pas PayPal/Alipay/Apple Pay.',
    ),
    schemeId: 'wero',
    infrastructureIds: ['wero-platform', 'tips', 'rt1'],
    defaultRailId: 'tips',
    messageShorts: ['pacs.008', 'pacs.002'],
    actors: ['payer', 'scheme', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: weroHops,
    relatedFlowIds: ['wero-a2a-payment', 'sct-inst-happy-path'],
    initiationChannels: ['wero'],
    comparePaymentId: 'sepa-instant',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 move on an A2A overlay (e.g. Wero) from France to Germany?',
        'Comment 100 € circulent-ils sur un overlay A2A (ex. Wero) de la France vers l’Allemagne ?',
      ),
      body: [
        L(
          'An account-to-account overlay such as Wero (EPI), Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay or TWINT sits in front of an instant settlement rail. The consumer experience is a proxy or wallet intent — phone number, alias, or in-app confirmation — while the interbank money movement remains a SCT Inst-style pacs.008 (or the local instant equivalent) between debtor and creditor PSPs.',
          'Un overlay compte-à-compte comme Wero (EPI), Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay ou TWINT se place devant un rail de règlement instantané. L’expérience utilisateur est une intention proxy / wallet — téléphone, alias, confirmation in-app — tandis que le mouvement interbancaire reste un pacs.008 style SCT Inst (ou l’équivalent local) entre PSP débiteur et créancier.',
        ),
        L(
          'That is different from paying with SCT Inst at a merchant checkout with no overlay, from a PISP initiating over XS2A (TrueLayer-style), and from digital wallets or card overlays that never look like A2A to the merchant. Use this explorer to see which hops belong to the scheme platform versus the CSM, and open the related Wero flow for the full sequence.',
          'Ce n’est ni un checkout SCT Inst commerçant sans overlay, ni un PISP sur XS2A (style TrueLayer), ni un wallet / overlay carte que le commerçant ne voit pas comme de l’A2A. Cet explorateur montre quels hops appartiennent à la plateforme de schéma versus le CSM ; le flux Wero détaille la séquence complète.',
        ),
      ],
    },
    countryIds: ['FR', 'DE'],
    defaultCountryId: 'FR',
    sources: [SRC_EPI, SRC_EPC],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'instant-a2a',
    kind: 'instant',
    name: L('Instant A2A scheme', 'Schéma A2A instantané'),
    summary: L(
      'The instant scheme is the retail product (alias + 24/7), not an overlay on SCT Inst. Samples: Pix (BR), UPI (IN).',
      'Le schéma instantané est le produit retail (alias + 24/7), pas un overlay sur SCT Inst. Exemples : Pix (BR), UPI (IN).',
    ),
    schemeId: 'instant-a2a',
    infrastructureIds: ['domestic-instant'],
    defaultRailId: 'domestic-instant',
    messageShorts: [],
    actors: ['payer', 'scheme', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: instantA2aHops,
    relatedFlowIds: [],
    initiationChannels: ['merchant'],
    comparePaymentId: 'wero',
    sources: [SRC_PIX, SRC_UPI],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'pisp-a2a',
    kind: 'instant',
    name: L('PISP A2A', 'PISP A2A'),
    summary: L(
      'TPP on XS2A (TrueLayer-style pay-by-bank): not a bank-consortium overlay. The PISP initiates; the ASPSP still settles SCT Inst (or SCT).',
      'TPP sur XS2A (pay-by-bank style TrueLayer) : pas un overlay de consortium bancaire. Le PISP initie ; l’ASPSP règle toujours en SCT Inst (ou SCT).',
    ),
    schemeId: 'pisp-a2a',
    infrastructureIds: ['tips', 'rt1'],
    defaultRailId: 'tips',
    messageShorts: ['pain.001', 'pacs.008', 'pacs.002'],
    actors: ['payer', 'merchant', 'scheme', 'bankA', 'csm', 'bankB'],
    hops: pispA2aHops,
    relatedFlowIds: ['bg-pis-sepa-redirect', 'sct-inst-happy-path'],
    initiationChannels: ['pisp'],
    comparePaymentId: 'wero',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 go through a PISP (e.g. TrueLayer) from France to Germany?',
        'Comment 100 € passent-ils par un PISP (ex. TrueLayer) de la France vers l’Allemagne ?',
      ),
    },
    countryIds: ['FR', 'DE'],
    defaultCountryId: 'FR',
    sources: [SRC_TRUELAYER, SRC_EPC],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'paypal',
    kind: 'wallet',
    name: L('Digital Wallet', 'Portefeuille numérique (Wallet)'),
    summary: L(
      'A €100 third party digital wallet checkout (PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay): the merchant sees a PSP or a card token — not an A2A overlay. Funding may hit a card scheme, bank account, or wallet balance; the merchant is paid later by transfer.',
      'Un checkout wallet numérique tiers de 100 € (PayPal, Alipay, Apple Pay, Google Pay, WeChat Pay) : le commerçant voit un PSP ou un jeton carte — pas un overlay A2A. Le funding peut taper un schéma carte, un compte ou le solde wallet ; le commerçant est payé plus tard par virement.',
    ),
    schemeId: 'paypal',
    infrastructureIds: ['card-schemes'],
    defaultRailId: 'card-schemes',
    messageShorts: ['pacs.008'],
    actors: ['payer', 'merchant', 'scheme', 'bankA', 'bankB'],
    hops: paypalHops,
    relatedFlowIds: [],
    initiationChannels: ['merchant'],
    comparePaymentId: 'card-payment',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 go through a digital wallet (e.g. PayPal, Apple Pay) from France to a German merchant?',
        'Comment 100 € passent-ils par un wallet numérique (ex. PayPal, Apple Pay) de la France vers un commerçant allemand ?',
      ),
    },
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_PAYPAL],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'curve',
    kind: 'card',
    name: L('Card Overlay', 'Overlay carte'),
    summary: L(
      'A €100 third party card overlay (e.g. Curve, Privacy.com): the merchant sees a primary card PAN (e.g. Mastercard). The overlay provider then authorizes the payer’s real underlying card — two schemes, one checkout.',
      'Un overlay carte tiers de 100 € (ex. Curve, Privacy.com) : le commerçant voit un PAN carte primaire (ex. Mastercard). L’overlay autorise ensuite la vraie carte sous-jacente du payeur — deux schémas, un checkout.',
    ),
    schemeId: 'curve',
    infrastructureIds: ['card-schemes'],
    defaultRailId: 'card-schemes',
    messageShorts: [],
    actors: ['payer', 'merchant', 'acquirer', 'scheme', 'bankA', 'bankB'],
    hops: curveHops,
    relatedFlowIds: [],
    initiationChannels: ['merchant'],
    comparePaymentId: 'card-payment',
    story: {
      amountLabel: L('€100', '100 €'),
      fromCountry: 'FR',
      toCountry: 'DE',
      headline: L(
        'How does €100 travel when using a card overlay (e.g. Curve)?',
        'Comment 100 € voyagent-ils lors de l’utilisation d’un overlay carte (ex. Curve) ?',
      ),
    },
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_CURVE],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'sepa-direct-debit',
    kind: 'direct-debit',
    name: L('SEPA Direct Debit', 'Prélèvement SEPA'),
    shortName: 'SDD',
    summary: L(
      'A €100 euro direct debit: creditor mandate, pain.008 collection, STEP2, debit on the payer.',
      'Un prélèvement euro de 100 € : mandat créancier, collecte pain.008, STEP2, débit chez le payeur.',
    ),
    schemeId: 'sdd',
    infrastructureIds: ['step2'],
    defaultRailId: 'step2',
    messageShorts: ['pain.008', 'pacs.004'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: sddHops,
    relatedFlowIds: [],
    initiationChannels: ['creditor'],
    countryIds: ['FR', 'DE'],
    defaultCountryId: 'FR',
    sources: [SRC_EPC],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'card-payment',
    kind: 'card',
    name: L('Card payment', 'Paiement par carte'),
    summary: L(
      'A €100 card payment (e.g. Visa, Mastercard, Cartes Bancaires, American Express): authorization through the scheme, then clearing and settlement — not pacs rails.',
      'Un paiement carte de 100 € (ex. Visa, Mastercard, Cartes Bancaires, American Express) : autorisation via le schéma, puis compensation et règlement — pas des rails pacs.',
    ),
    schemeId: 'card',
    infrastructureIds: ['card-schemes'],
    defaultRailId: 'card-schemes',
    messageShorts: [],
    actors: ['payer', 'merchant', 'acquirer', 'scheme', 'bankA', 'bankB'],
    hops: cardHops,
    relatedFlowIds: [],
    initiationChannels: ['merchant'],
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_ECB],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'swift-credit-transfer',
    kind: 'cross-border',
    name: L('SWIFT / CBPR+', 'SWIFT / CBPR+'),
    summary: L(
      'A cross-border credit transfer on SWIFT ISO 20022 — watch the pacs.008 version (.10 / .13 vs SEPA .08).',
      'Un virement transfrontalier sur SWIFT ISO 20022 — attention à la version pacs.008 (.10 / .13 vs SEPA .08).',
    ),
    schemeId: 'cbpr-plus',
    infrastructureIds: ['swift-cbpr'],
    defaultRailId: 'swift-cbpr',
    messageShorts: ['pain.001', 'pacs.008', 'pacs.002', 'pacs.009'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: swiftHops,
    relatedFlowIds: ['clearing-sct-happy-path'],
    initiationChannels: ['bank'],
    comparePaymentId: 'sepa-credit-transfer',
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [
      {
        name: 'SWIFT',
        url: 'https://www.swift.com/standards/iso-20022',
        lastUpdated: '2026-08-16',
      },
    ],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'swiss-credit-transfer',
    kind: 'credit-transfer',
    name: L('Swiss Credit Transfer (SIC / SIC IP)', 'Virement suisse (SIC / SIC IP)'),
    summary: L(
      'Domestic Swiss franc transfer on SIX Interbank Clearing: instant payment (<10s on SIC5 platform) or regular RTGS credit transfer under Swiss Payment Standards (SPS 2026).',
      'Virement domestique en francs suisses sur SIX Interbank Clearing : paiement instantané (<10s sur la plateforme SIC5) ou virement régulier RTGS sous Swiss Payment Standards (SPS 2026).',
    ),
    schemeId: 'sic-ch',
    infrastructureIds: ['sic', 'eurosic'],
    defaultRailId: 'sic',
    messageShorts: ['pain.001', 'pain.002', 'pacs.008', 'pacs.002', 'pacs.028', 'camt.054'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: [
      hop('sic-init', 'payer', 'bankA', {
        messageShort: 'pain.001',
        simple: L('The payer initiates a Swiss franc credit transfer (with QR-bill).', 'Le payeur initie un virement en francs suisses (avec QR-facture).'),
        expert: L('pain.001.001.09.ch.03 initiation', 'pain.001.001.09.ch.03 initiation'),
        tOffset: L('t+0', 't+0'),
        flowId: 'sic-chf-credit',
        step: 1,
        sampleId: 'pain-001-sic-chf',
        initiation: ['bank'],
        outcomes: ['happy', 'reject'],
      }),
      hop('sic-008-out', 'bankA', 'csm', {
        messageShort: 'pacs.008',
        simple: L('The bank submits the transfer into SIX SIC5 (IP or RTGS).', 'La banque soumet le virement dans SIX SIC5 (IP ou RTGS).'),
        expert: L('pacs.008.001.08.ch.02 with ClrSys=SIC', 'pacs.008.001.08.ch.02 avec ClrSys=SIC'),
        tOffset: L('<10s for IP or EOD batch', '<10s pour IP ou lot EOD'),
        flowId: 'sic-ip-instant',
        step: 1,
        sampleId: 'pacs-008-sic-ip',
        outcomes: ['happy', 'reject'],
      }),
      hop('sic-008-in', 'csm', 'bankB', {
        messageShort: 'pacs.008',
        simple: L('SIC delivers the credit transfer to the creditor bank.', 'SIC livre le virement à la banque créancière.'),
        expert: L('pacs.008 delivered to creditor participant', 'pacs.008 livré au participant créancier'),
        flowId: 'sic-ip-instant',
        step: 2,
        outcomes: ['happy', 'reject'],
      }),
      hop('sic-002', 'bankB', 'csm', {
        messageShort: 'pacs.002',
        simple: L('The receiving bank accepts and credits the account.', 'La banque réceptrice accepte et crédite le compte.'),
        expert: L('pacs.002 ACSC confirmation', 'pacs.002 confirmation ACSC'),
        flowId: 'sic-ip-instant',
        step: 3,
        sampleId: 'pacs-002-sic-ip',
        outcomes: ['happy'],
      }),
      hop('sic-002-rjct', 'bankB', 'csm', {
        messageShort: 'pacs.002',
        simple: L('The receiving bank rejects the transfer.', 'La banque réceptrice rejette le virement.'),
        expert: L('pacs.002 RJCT', 'pacs.002 RJCT'),
        flowId: 'sic-ip-instant',
        step: 3,
        sampleId: 'pacs-002-sic-ip',
        outcomes: ['reject'],
      }),
      hop('sic-credit', 'bankB', 'beneficiary', {
        messageShort: 'camt.054',
        simple: L('Funds are credited to the beneficiary in central bank money.', 'Les fonds sont crédités au bénéficiaire en monnaie de banque centrale.'),
        expert: L('camt.054 credit notification', 'camt.054 notification de crédit'),
        flowId: 'sic-chf-credit',
        step: 5,
        outcomes: ['happy'],
      }),
    ],
    relatedFlowIds: ['sic-chf-credit', 'sic-ip-instant', 'sic-ip-timeout', 'eurosic-eur-credit'],
    initiationChannels: ['bank'],
    countryIds: ['CH', 'DE', 'FR'],
    defaultCountryId: 'CH',
    sources: [SRC_SIX],
    disclaimer: DISCLAIMER,
  },
];

export const paymentById = (id: string) => PAYMENTS.find((p) => p.id === id);
