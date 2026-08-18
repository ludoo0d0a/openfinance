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
    simple: L('The payer starts a Wero payment (checkout or P2P).', 'Le payeur démarre un paiement Wero (checkout ou P2P).'),
    expert: L('Wero payment intent (amount, payee alias, return URLs)', 'Intention de paiement Wero (montant, alias, URLs de retour)'),
    tOffset: L('t+0', 't+0'),
    flowId: 'wero-a2a-payment',
    step: 1,
    sampleId: 'wero-payment-create',
  }),
  hop('wero-proxy', 'scheme', 'scheme', {
    simple: L('Wero resolves the phone or email to an IBAN.', 'Wero résout le téléphone ou l’e-mail en IBAN.'),
    expert: L('Proxy directory lookup; still run VoP where required', 'Annuaire proxy ; VoP toujours si la régulation l’exige'),
    flowId: 'wero-a2a-payment',
    step: 2,
    sampleId: 'wero-proxy-resolve',
  }),
  hop('wero-auth', 'payer', 'bankA', {
    simple: L('The payer confirms in the bank or Wero app.', 'Le payeur confirme dans l’app banque ou Wero.'),
    expert: L('ASPSP authentication / SCA when required', 'Authentification ASPSP / SCA si requise'),
    flowId: 'wero-a2a-payment',
    step: 3,
  }),
  hop('wero-008-out', 'bankA', 'csm', {
    messageShort: 'pacs.008',
    simple: L('The bank settles on SEPA Instant (TIPS or RT1).', 'La banque règle en SEPA Instant (TIPS ou RT1).'),
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
    simple: L('Settlement completes; Wero tracks the same outcome.', 'Le règlement se termine ; Wero suit le même résultat.'),
    expert: L('pacs.002 ACSC; scheme status tracks clearing', 'pacs.002 ACSC ; le statut schéma suit la compensation'),
    flowId: 'wero-a2a-payment',
    step: 5,
    sampleId: 'pacs-002-sct-inst',
    outcomes: ['happy'],
  }),
  hop('wero-done', 'scheme', 'beneficiary', {
    simple: L('The beneficiary (or merchant) is paid.', 'Le bénéficiaire (ou le commerçant) est payé.'),
    expert: L('Wero completion + SCT Inst credit', 'Fin Wero + crédit SCT Inst'),
    flowId: 'wero-a2a-payment',
    step: 5,
    outcomes: ['happy'],
  }),
  hop('wero-rjct', 'bankB', 'csm', {
    messageShort: 'pacs.002',
    simple: L('Instant settlement is refused; Wero marks the intent failed.', 'Le règlement instantané est refusé ; Wero marque l’intention en échec.'),
    expert: L('pacs.002 RJCT; scheme status failed', 'pacs.002 RJCT ; statut schéma failed'),
    flowId: 'sct-inst-reject',
    step: 2,
    sampleId: 'pacs-002-sct-inst-reject',
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

export const PAYMENTS: Payment[] = [
  {
    id: 'sepa-credit-transfer',
    kind: 'credit-transfer',
    name: L('SEPA Credit Transfer', 'Virement SEPA'),
    summary: L(
      'A non-urgent euro credit transfer: the payer’s bank, STEP2 (or equivalent), the beneficiary’s bank.',
      'Un virement euro non urgent : banque du payeur, STEP2 (ou équivalent), banque du bénéficiaire.',
    ),
    schemeId: 'sct',
    infrastructureIds: ['step2', 'eurosic'],
    defaultRailId: 'step2',
    messageShorts: ['pain.001', 'pacs.008', 'pacs.002', 'camt.054', 'camt.056', 'camt.029', 'pacs.004'],
    actors: ['payer', 'bankA', 'csm', 'bankB', 'beneficiary'],
    hops: sctHops,
    relatedFlowIds: ['clearing-sct-happy-path', 'bg-pis-sepa-redirect', 'clearing-reject', 'clearing-recall'],
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
    summary: L(
      'A €100 instant euro transfer France → Germany: Verification of Payee, then TIPS or RT1, funds in ≤10 seconds.',
      'Un virement euro instantané de 100 € France → Allemagne : Verification of Payee, puis TIPS ou RT1, fonds en ≤10 secondes.',
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
    },
    countryIds: ['FR', 'DE', 'CH'],
    defaultCountryId: 'FR',
    sources: [SRC_EPC, SRC_ECB],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'wero',
    kind: 'wallet',
    name: L('Wero', 'Wero'),
    summary: L(
      'Account-to-account via Wero: intent and proxy on the scheme, settlement as SEPA Instant.',
      'Compte-à-compte via Wero : intention et proxy côté schéma, règlement en SEPA Instant.',
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
    countryIds: ['FR', 'DE'],
    defaultCountryId: 'FR',
    sources: [SRC_EPI, SRC_EPC],
    disclaimer: DISCLAIMER,
  },
  {
    id: 'sepa-direct-debit',
    kind: 'direct-debit',
    name: L('SEPA Direct Debit', 'Prélèvement SEPA'),
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
      'A €100 card payment: authorization through the scheme, then clearing and settlement — not pacs rails.',
      'Un paiement carte de 100 € : autorisation via le schéma, puis compensation et règlement — pas des rails pacs.',
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
];

export const paymentById = (id: string) => PAYMENTS.find((p) => p.id === id);
