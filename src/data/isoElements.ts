import type { Locale } from '@/types';

/** Short bilingual tip for an ISO 20022 local element or attribute name. */
export type IsoElementTip = { en: string; fr: string };

/**
 * Dictionary of ISO 20022 local names that appear in app payloads.
 * Prefer path-mapped Try form defs when available; this covers everything else.
 */
export const ISO_ELEMENTS: Record<string, IsoElementTip> = {
  AccptncDtTm: {
    en: 'Acceptance date-time — when the agent accepted the instruction (ISO-8601).',
    fr: 'Date-heure d’acceptation — moment où l’agent a accepté l’instruction (ISO-8601).',
  },
  Acct: {
    en: 'Account — identification of a cash account (often wraps IBAN).',
    fr: 'Compte — identification d’un compte de paiement (souvent autour de l’IBAN).',
  },
  AddtlInf: {
    en: 'Additional information — free-text complement to a status or reason.',
    fr: 'Information complémentaire — texte libre associé à un statut ou motif.',
  },
  Agt: {
    en: 'Agent — financial institution acting in the chain (BIC under FinInstnId).',
    fr: 'Agent — établissement financier dans la chaîne (BIC sous FinInstnId).',
  },
  Amt: {
    en: 'Amount — monetary value (currency usually on Ccy attribute).',
    fr: 'Montant — valeur monétaire (devise souvent en attribut Ccy).',
  },
  AnyBIC: {
    en: 'AnyBIC — BIC identifying an organisation (non-FI context).',
    fr: 'AnyBIC — BIC identifiant une organisation (hors contexte FI).',
  },
  Assgne: {
    en: 'Assignee — party to whom the case / investigation is assigned.',
    fr: 'Assigné — partie destinataire du dossier / de l’investigation.',
  },
  Assgnmt: {
    en: 'Assignment — case assignment block (id, assigner, assignee).',
    fr: 'Assignation — bloc d’affectation du dossier (id, assignor, assigné).',
  },
  Assgnr: {
    en: 'Assigner — party that opens or forwards the case.',
    fr: 'Assignor — partie qui ouvre ou transmet le dossier.',
  },
  BICFI: {
    en: 'BICFI — Business Identifier Code of a financial institution.',
    fr: 'BICFI — code BIC d’un établissement financier.',
  },
  Bal: {
    en: 'Balance — account balance entry on a statement or report.',
    fr: 'Solde — entrée de solde sur un relevé ou rapport.',
  },
  BkToCstmrAcctRpt: {
    en: 'camt.052 — bank-to-customer account report root.',
    fr: 'camt.052 — racine du rapport de compte banque→client.',
  },
  BkToCstmrDbtCdtNtfctn: {
    en: 'camt.054 — bank-to-customer debit/credit notification root.',
    fr: 'camt.054 — racine de la notification débit/crédit banque→client.',
  },
  BkToCstmrStmt: {
    en: 'camt.053 — bank-to-customer statement root.',
    fr: 'camt.053 — racine du relevé de compte banque→client.',
  },
  BkTxCd: {
    en: 'Bank transaction code — domain / family / sub-family classification.',
    fr: 'Code opération bancaire — classification domaine / famille / sous-famille.',
  },
  BookgDt: {
    en: 'Booking date — date the entry is booked on the account.',
    fr: 'Date de comptabilisation — date d’enregistrement sur le compte.',
  },
  BtchBookg: {
    en: 'Batch booking — whether transactions are booked as a batch.',
    fr: 'Comptabilisation par lot — transactions regroupées ou non.',
  },
  Case: {
    en: 'Case — investigation / exception case identification.',
    fr: 'Dossier — identification du cas d’investigation / d’exception.',
  },
  Ccy: {
    en: 'Currency — ISO 4217 currency code (often an attribute on an amount).',
    fr: 'Devise — code ISO 4217 (souvent un attribut sur un montant).',
  },
  Cd: {
    en: 'Code — coded value from an ISO external code set.',
    fr: 'Code — valeur codée d’un jeu de codes externes ISO.',
  },
  CdOrPrtry: {
    en: 'Code or proprietary — either a standard Cd or a proprietary string.',
    fr: 'Code ou propriétaire — soit un Cd standard, soit une valeur propriétaire.',
  },
  CdtDbtInd: {
    en: 'Credit/debit indicator — CRDT or DBIT for the entry.',
    fr: 'Indicateur crédit/débit — CRDT ou DBIT pour l’écriture.',
  },
  CdtTrfTx: {
    en: 'Credit transfer transaction — single credit-transfer leg (pain/pacs).',
    fr: 'Transaction de virement — une jambe de virement (pain/pacs).',
  },
  CdtTrfTxInf: {
    en: 'Credit transfer transaction information — per-tx block in pacs.008.',
    fr: 'Information de transaction de virement — bloc par transaction dans pacs.008.',
  },
  Cdtr: {
    en: 'Creditor — party whose account is credited.',
    fr: 'Créancier — partie dont le compte est crédité.',
  },
  CdtrAcct: {
    en: 'Creditor account — account to be credited (IBAN under Id).',
    fr: 'Compte créancier — compte à créditer (IBAN sous Id).',
  },
  CdtrAgt: {
    en: 'Creditor agent — bank of the creditor (receiving FI).',
    fr: 'Agent du créancier — banque du créancier (établissement destinataire).',
  },
  CdtrPmtActvtnReq: {
    en: 'pain.013 — creditor payment activation request root.',
    fr: 'pain.013 — racine de la demande d’activation de paiement créancier.',
  },
  CdtrPmtActvtnReqStsRpt: {
    en: 'pain.014 — status report for a creditor payment activation request.',
    fr: 'pain.014 — rapport de statut d’une demande d’activation créancier.',
  },
  CdtrSchmeId: {
    en: 'Creditor scheme identification — SEPA creditor identifier for SDD.',
    fr: 'Identifiant de schéma créancier — ICS SEPA pour le SDD.',
  },
  ChrgBr: {
    en: 'Charge bearer — who pays fees (SLEV, DEBT, CRED, SHAR).',
    fr: 'Support des frais — qui paie les frais (SLEV, DEBT, CRED, SHAR).',
  },
  ClrSys: {
    en: 'Clearing system — CSM / rail identifier (TIPS, RT1, STEP2, SIC…).',
    fr: 'Système de compensation — identifiant CSM / rail (TIPS, RT1, STEP2, SIC…).',
  },
  Conf: {
    en: 'Confirmation — outcome confirmation of a case or investigation.',
    fr: 'Confirmation — résultat de confirmation d’un dossier ou d’une investigation.',
  },
  CreDtTm: {
    en: 'Creation date-time — when this message was created (ISO-8601).',
    fr: 'Date-heure de création — moment de création du message (ISO-8601).',
  },
  Cretr: {
    en: 'Creator — party that created the case or report.',
    fr: 'Créateur — partie qui a créé le dossier ou le rapport.',
  },
  CstmrCdtTrfInitn: {
    en: 'pain.001 — customer credit transfer initiation root.',
    fr: 'pain.001 — racine d’initiation de virement client.',
  },
  CstmrDrctDbtInitn: {
    en: 'pain.008 — customer direct debit initiation root.',
    fr: 'pain.008 — racine d’initiation de prélèvement client.',
  },
  CstmrPmtCxlReq: {
    en: 'camt.055 — customer payment cancellation request root.',
    fr: 'camt.055 — racine de demande d’annulation de paiement client.',
  },
  CstmrPmtStsRpt: {
    en: 'pain.002 — customer payment status report root.',
    fr: 'pain.002 — racine du rapport de statut de paiement client.',
  },
  CtrlSum: {
    en: 'Control sum — total of instructed amounts for integrity check.',
    fr: 'Somme de contrôle — total des montants instruits pour contrôle d’intégrité.',
  },
  CxlDtls: {
    en: 'Cancellation details — reasons and references for a cancel request.',
    fr: 'Détails d’annulation — motifs et références d’une demande d’annulation.',
  },
  CxlId: {
    en: 'Cancellation identification — id of this cancellation request.',
    fr: 'Identifiant d’annulation — id de cette demande d’annulation.',
  },
  CxlRsnInf: {
    en: 'Cancellation reason information — coded / free-text cancel reason.',
    fr: 'Information de motif d’annulation — motif codé / texte libre.',
  },
  CxlStsId: {
    en: 'Cancellation status identification — id of a cancellation status report.',
    fr: 'Identifiant de statut d’annulation — id d’un rapport de statut d’annulation.',
  },
  Dbtr: {
    en: 'Debtor — party whose account is debited.',
    fr: 'Débiteur — partie dont le compte est débité.',
  },
  DbtrAcct: {
    en: 'Debtor account — account to be debited (IBAN under Id).',
    fr: 'Compte débiteur — compte à débiter (IBAN sous Id).',
  },
  DbtrAgt: {
    en: 'Debtor agent — bank of the debtor (sending FI).',
    fr: 'Agent du débiteur — banque du débiteur (établissement émetteur).',
  },
  Document: {
    en: 'Document — ISO 20022 XML root wrapping the message payload.',
    fr: 'Document — racine XML ISO 20022 enveloppant le message.',
  },
  Domn: {
    en: 'Domain — top-level bank transaction code domain.',
    fr: 'Domaine — domaine de premier niveau du code opération bancaire.',
  },
  DrctDbtTx: {
    en: 'Direct debit transaction — SDD transaction details.',
    fr: 'Transaction de prélèvement — détails de transaction SDD.',
  },
  DrctDbtTxInf: {
    en: 'Direct debit transaction information — per-tx block in pain.008 / pacs.003.',
    fr: 'Information de transaction de prélèvement — bloc par transaction.',
  },
  Dt: {
    en: 'Date — calendar date (YYYY-MM-DD).',
    fr: 'Date — date calendaire (AAAA-MM-JJ).',
  },
  DtOfSgntr: {
    en: 'Date of signature — mandate or authority signature date.',
    fr: 'Date de signature — date de signature du mandat ou de l’autorité.',
  },
  DtTm: {
    en: 'Date-time — timestamp (ISO-8601).',
    fr: 'Date-heure — horodatage (ISO-8601).',
  },
  EndToEndId: {
    en: 'End-to-end identification — reference kept across the payment chain.',
    fr: 'Identifiant de bout en bout — référence conservée dans toute la chaîne.',
  },
  FICdtTrf: {
    en: 'pacs.009 — FI credit transfer root (bank-to-bank).',
    fr: 'pacs.009 — racine du virement interbancaire (banque→banque).',
  },
  FIToFICstmrCdtTrf: {
    en: 'pacs.008 — FI-to-FI customer credit transfer root.',
    fr: 'pacs.008 — racine du virement client interbancaire.',
  },
  FIToFIPmtCxlReq: {
    en: 'camt.056 — FI-to-FI payment cancellation request root.',
    fr: 'camt.056 — racine de demande d’annulation de paiement interbancaire.',
  },
  FIToFIPmtStsReq: {
    en: 'pacs.028 — FI-to-FI payment status request root.',
    fr: 'pacs.028 — racine de demande de statut de paiement interbancaire.',
  },
  FIToFIPmtStsRpt: {
    en: 'pacs.002 — FI-to-FI payment status report root.',
    fr: 'pacs.002 — racine du rapport de statut de paiement interbancaire.',
  },
  FinInstnId: {
    en: 'Financial institution identification — usually wraps BICFI.',
    fr: 'Identification d’établissement financier — enveloppe souvent BICFI.',
  },
  Fmly: {
    en: 'Family — bank transaction code family within a domain.',
    fr: 'Famille — famille de code opération bancaire dans un domaine.',
  },
  GrpHdr: {
    en: 'Group header — message-level header (MsgId, CreDtTm, counts, agents).',
    fr: 'En-tête de groupe — en-tête message (MsgId, CreDtTm, totaux, agents).',
  },
  GrpSts: {
    en: 'Group status — overall status for the original group of transactions.',
    fr: 'Statut de groupe — statut global du groupe de transactions d’origine.',
  },
  IBAN: {
    en: 'IBAN — International Bank Account Number.',
    fr: 'IBAN — numéro de compte bancaire international.',
  },
  Id: {
    en: 'Identification — generic id wrapper (account, party, case…).',
    fr: 'Identification — enveloppe d’id générique (compte, partie, dossier…).',
  },
  IdVrfctnReq: {
    en: 'acmt.023 — identification verification request (VoP) root.',
    fr: 'acmt.023 — racine de demande de vérification d’identité (VoP).',
  },
  IdVrfctnRpt: {
    en: 'acmt.024 — identification verification report (VoP) root.',
    fr: 'acmt.024 — racine du rapport de vérification d’identité (VoP).',
  },
  InitgPty: {
    en: 'Initiating party — party that initiates the payment instruction.',
    fr: 'Partie initiatrice — partie qui initie l’instruction de paiement.',
  },
  InstdAgt: {
    en: 'Instructed agent — FI that receives the instruction.',
    fr: 'Agent instruit — établissement qui reçoit l’instruction.',
  },
  InstdAmt: {
    en: 'Instructed amount — amount instructed by the ordering party.',
    fr: 'Montant instruit — montant demandé par le donneur d’ordre.',
  },
  InstgAgt: {
    en: 'Instructing agent — FI that sends the instruction.',
    fr: 'Agent instructeur — établissement qui envoie l’instruction.',
  },
  InstrId: {
    en: 'Instruction identification — id assigned by the instructing party.',
    fr: 'Identifiant d’instruction — id attribué par la partie instructrice.',
  },
  IntrBk: {
    en: 'Interbank — interbank-related amount or indicator block.',
    fr: 'Interbancaire — bloc montant ou indicateur interbancaire.',
  },
  IntrBkSttlmAmt: {
    en: 'Interbank settlement amount — amount settled between banks.',
    fr: 'Montant de règlement interbancaire — montant réglé entre banques.',
  },
  IntrBkSttlmDt: {
    en: 'Interbank settlement date — calendar date of interbank settlement.',
    fr: 'Date de règlement interbancaire — date calendaire du règlement.',
  },
  LclInstrm: {
    en: 'Local instrument — product code (e.g. INST for SCT Inst).',
    fr: 'Instrument local — code produit (ex. INST pour SCT Inst).',
  },
  MndtId: {
    en: 'Mandate identification — unique id of the SDD mandate.',
    fr: 'Identifiant de mandat — id unique du mandat SDD.',
  },
  MndtRltdInf: {
    en: 'Mandate-related information — SDD mandate references and dates.',
    fr: 'Informations relatives au mandat — références et dates du mandat SDD.',
  },
  MsgId: {
    en: 'Message identification — unique id of this ISO message.',
    fr: 'Identifiant de message — id unique de ce message ISO.',
  },
  NbOfTxs: {
    en: 'Number of transactions — count of transactions in the group.',
    fr: 'Nombre de transactions — nombre de transactions dans le groupe.',
  },
  Nm: {
    en: 'Name — party or organisation name.',
    fr: 'Nom — nom de la partie ou de l’organisation.',
  },
  Ntfctn: {
    en: 'Notification — debit/credit notification block (camt.054).',
    fr: 'Notification — bloc de notification débit/crédit (camt.054).',
  },
  Ntry: {
    en: 'Entry — booked statement or report entry.',
    fr: 'Écriture — entrée comptabilisée de relevé ou rapport.',
  },
  NtryDtls: {
    en: 'Entry details — underlying transaction details for an entry.',
    fr: 'Détails d’écriture — transactions sous-jacentes d’une écriture.',
  },
  NtryRef: {
    en: 'Entry reference — bank reference of the booked entry.',
    fr: 'Référence d’écriture — référence bancaire de l’écriture.',
  },
  OrgId: {
    en: 'Organisation identification — legal-entity identifiers.',
    fr: 'Identification d’organisation — identifiants de personne morale.',
  },
  OrgnlAssgnmt: {
    en: 'Original assignment — assignment of the message being answered.',
    fr: 'Assignation d’origine — assignation du message auquel on répond.',
  },
  OrgnlCreDtTm: {
    en: 'Original creation date-time — CreDtTm of the original message.',
    fr: 'Date-heure de création d’origine — CreDtTm du message d’origine.',
  },
  OrgnlEndToEndId: {
    en: 'Original end-to-end id — EndToEndId of the original transaction.',
    fr: 'Identifiant de bout en bout d’origine — EndToEndId d’origine.',
  },
  OrgnlGrpInf: {
    en: 'Original group information — references to the original group.',
    fr: 'Informations de groupe d’origine — références au groupe d’origine.',
  },
  OrgnlGrpInfAndSts: {
    en: 'Original group information and status — group refs plus group status.',
    fr: 'Informations et statut de groupe d’origine — refs plus statut de groupe.',
  },
  OrgnlId: {
    en: 'Original identification — id of the original request or case.',
    fr: 'Identifiant d’origine — id de la demande ou du dossier d’origine.',
  },
  OrgnlInstrId: {
    en: 'Original instruction id — InstrId of the original transaction.',
    fr: 'Identifiant d’instruction d’origine — InstrId d’origine.',
  },
  OrgnlIntrBkSttlmAmt: {
    en: 'Original interbank settlement amount — amount of the original tx.',
    fr: 'Montant de règlement interbancaire d’origine — montant d’origine.',
  },
  OrgnlIntrBkSttlmDt: {
    en: 'Original interbank settlement date — settlement date of the original.',
    fr: 'Date de règlement interbancaire d’origine — date de règlement d’origine.',
  },
  OrgnlMsgId: {
    en: 'Original message id — MsgId of the message being reported on.',
    fr: 'Identifiant de message d’origine — MsgId du message concerné.',
  },
  OrgnlMsgNmId: {
    en: 'Original message name id — e.g. pacs.008.001.08.',
    fr: 'Nom de message d’origine — ex. pacs.008.001.08.',
  },
  OrgnlPmtInfAndCxl: {
    en: 'Original payment information and cancellation — pain cancel block.',
    fr: 'Informations de paiement d’origine et annulation — bloc pain.',
  },
  OrgnlPmtInfAndSts: {
    en: 'Original payment information and status — status at payment-info level.',
    fr: 'Informations de paiement d’origine et statut — statut au niveau PmtInf.',
  },
  OrgnlPmtInfId: {
    en: 'Original payment information id — PmtInfId of the original.',
    fr: 'Identifiant d’informations de paiement d’origine — PmtInfId d’origine.',
  },
  OrgnlPtyAndAcctId: {
    en: 'Original party and account id — party/account checked in VoP request.',
    fr: 'Id partie et compte d’origine — partie/compte contrôlés en VoP.',
  },
  OrgnlTxId: {
    en: 'Original transaction id — TxId of the original transaction.',
    fr: 'Identifiant de transaction d’origine — TxId d’origine.',
  },
  OrgnlTxRef: {
    en: 'Original transaction reference — snapshot of original tx data.',
    fr: 'Référence de transaction d’origine — instantané des données d’origine.',
  },
  Orgtr: {
    en: 'Originator — party that originated a status reason or return.',
    fr: 'Émetteur — partie à l’origine d’un motif de statut ou d’un retour.',
  },
  Othr: {
    en: 'Other — proprietary or alternate identification scheme.',
    fr: 'Autre — schéma d’identification propriétaire ou alternatif.',
  },
  PmtId: {
    en: 'Payment identification — InstrId / EndToEndId / TxId block.',
    fr: 'Identification de paiement — bloc InstrId / EndToEndId / TxId.',
  },
  PmtInf: {
    en: 'Payment information — payment-info batch in pain.001 / pain.008.',
    fr: 'Informations de paiement — lot PmtInf dans pain.001 / pain.008.',
  },
  PmtInfId: {
    en: 'Payment information identification — id of the PmtInf block.',
    fr: 'Identifiant d’informations de paiement — id du bloc PmtInf.',
  },
  PmtInfSts: {
    en: 'Payment information status — status at the PmtInf level.',
    fr: 'Statut des informations de paiement — statut au niveau PmtInf.',
  },
  PmtMtd: {
    en: 'Payment method — TRF (transfer), DD (direct debit), CHK, TRA.',
    fr: 'Méthode de paiement — TRF (virement), DD (prélèvement), CHK, TRA.',
  },
  PmtRtr: {
    en: 'pacs.004 — payment return root.',
    fr: 'pacs.004 — racine du retour de paiement.',
  },
  PmtTpInf: {
    en: 'Payment type information — service level, local instrument, category.',
    fr: 'Informations de type de paiement — niveau de service, instrument local…',
  },
  Prtry: {
    en: 'Proprietary — proprietary code when no ISO code applies.',
    fr: 'Propriétaire — code propriétaire lorsqu’aucun code ISO ne s’applique.',
  },
  PrvtId: {
    en: 'Private identification — private-person identifiers.',
    fr: 'Identification privée — identifiants de personne physique.',
  },
  Pty: {
    en: 'Party — generic party identification block.',
    fr: 'Partie — bloc générique d’identification de partie.',
  },
  PtyAndAcctId: {
    en: 'Party and account identification — name + account checked together (VoP).',
    fr: 'Identification partie et compte — nom + compte contrôlés ensemble (VoP).',
  },
  Refs: {
    en: 'References — collection of payment / transaction references.',
    fr: 'Références — ensemble de références de paiement / transaction.',
  },
  ReqToModfyPmt: {
    en: 'camt.087 — request to modify payment root.',
    fr: 'camt.087 — racine de demande de modification de paiement.',
  },
  ReqdColltnDt: {
    en: 'Requested collection date — intended debit date for SDD.',
    fr: 'Date de prélèvement demandée — date de débit prévue pour le SDD.',
  },
  ReqdExctnDt: {
    en: 'Requested execution date — requested date for the credit transfer.',
    fr: 'Date d’exécution demandée — date demandée pour le virement.',
  },
  RltdPties: {
    en: 'Related parties — debtor / creditor (and agents) snapshot.',
    fr: 'Parties liées — instantané débiteur / créancier (et agents).',
  },
  RmtInf: {
    en: 'Remittance information — payment purpose shown to the beneficiary.',
    fr: 'Informations de remise — motif du paiement présenté au bénéficiaire.',
  },
  Rpt: {
    en: 'Report — verification or account report block.',
    fr: 'Rapport — bloc de rapport de vérification ou de compte.',
  },
  RsltnOfInvstgtn: {
    en: 'camt.029 — resolution of investigation root.',
    fr: 'camt.029 — racine de résolution d’investigation.',
  },
  RslvdCase: {
    en: 'Resolved case — case closed by a resolution of investigation.',
    fr: 'Dossier résolu — dossier clos par une résolution d’investigation.',
  },
  Rsn: {
    en: 'Reason — coded reason (status, cancel, return…).',
    fr: 'Motif — motif codé (statut, annulation, retour…).',
  },
  RtrId: {
    en: 'Return identification — id of the payment return.',
    fr: 'Identifiant de retour — id du retour de paiement.',
  },
  RtrRsnInf: {
    en: 'Return reason information — why the payment was returned.',
    fr: 'Information de motif de retour — pourquoi le paiement a été retourné.',
  },
  RtrdIntrBkSttlmAmt: {
    en: 'Returned interbank settlement amount — amount being returned.',
    fr: 'Montant de règlement interbancaire retourné — montant restitué.',
  },
  SchmeNm: {
    en: 'Scheme name — name/code of an identification scheme.',
    fr: 'Nom de schéma — nom/code d’un schéma d’identification.',
  },
  Stmt: {
    en: 'Statement — account statement block (camt.053).',
    fr: 'Relevé — bloc de relevé de compte (camt.053).',
  },
  Sts: {
    en: 'Status — status value or status container.',
    fr: 'Statut — valeur de statut ou conteneur de statut.',
  },
  StsId: {
    en: 'Status identification — id of a status report item.',
    fr: 'Identifiant de statut — id d’un élément de rapport de statut.',
  },
  StsRsnInf: {
    en: 'Status reason information — coded / free-text status reason.',
    fr: 'Information de motif de statut — motif de statut codé / texte libre.',
  },
  SttlmInf: {
    en: 'Settlement information — settlement method and clearing system.',
    fr: 'Informations de règlement — méthode de règlement et système de clearing.',
  },
  SttlmMtd: {
    en: 'Settlement method — CLRG, INDA, INGA, COVE…',
    fr: 'Méthode de règlement — CLRG, INDA, INGA, COVE…',
  },
  SubFmlyCd: {
    en: 'Sub-family code — finest bank transaction code level.',
    fr: 'Code de sous-famille — niveau le plus fin du code opération bancaire.',
  },
  SvcLvl: {
    en: 'Service level — e.g. SEPA for SCT / SCT Inst.',
    fr: 'Niveau de service — ex. SEPA pour SCT / SCT Inst.',
  },
  Svcr: {
    en: 'Servicer — account servicer (bank holding the account).',
    fr: 'Gestionnaire — teneur de compte (banque du compte).',
  },
  Tp: {
    en: 'Type — typed classification (balance type, id type…).',
    fr: 'Type — classification typée (type de solde, type d’id…).',
  },
  TtlIntrBkSttlmAmt: {
    en: 'Total interbank settlement amount — sum of settlement amounts in the group.',
    fr: 'Montant total de règlement interbancaire — somme des montants du groupe.',
  },
  TtlRtrdIntrBkSttlmAmt: {
    en: 'Total returned interbank settlement amount — sum of returned amounts.',
    fr: 'Montant total de règlement interbancaire retourné — somme des retours.',
  },
  TxCxlSts: {
    en: 'Transaction cancellation status — cancel outcome for one transaction.',
    fr: 'Statut d’annulation de transaction — résultat d’annulation pour une tx.',
  },
  TxDtls: {
    en: 'Transaction details — detailed legs under an entry.',
    fr: 'Détails de transaction — jambes détaillées sous une écriture.',
  },
  TxId: {
    en: 'Transaction identification — id assigned by the first instructing agent.',
    fr: 'Identifiant de transaction — id attribué par le premier agent instructeur.',
  },
  TxInf: {
    en: 'Transaction information — per-transaction block in a status/request.',
    fr: 'Information de transaction — bloc par transaction dans un statut/demande.',
  },
  TxInfAndSts: {
    en: 'Transaction information and status — per-tx status in pacs.002.',
    fr: 'Information et statut de transaction — statut par tx dans pacs.002.',
  },
  TxSts: {
    en: 'Transaction status — e.g. ACSC (settled) or RJCT (rejected).',
    fr: 'Statut de transaction — ex. ACSC (réglé) ou RJCT (rejeté).',
  },
  UblToApply: {
    en: 'camt.036 — unable to apply root (cannot process the payment).',
    fr: 'camt.036 — racine « unable to apply » (paiement non traitable).',
  },
  Undrlyg: {
    en: 'Underlying — underlying payment / case being investigated or cancelled.',
    fr: 'Sous-jacent — paiement / dossier investigué ou annulé.',
  },
  UpdtdPtyAndAcctId: {
    en: 'Updated party and account id — corrected party/account after VoP.',
    fr: 'Id partie et compte mis à jour — partie/compte corrigés après VoP.',
  },
  Ustrd: {
    en: 'Unstructured — free-text remittance (RmtInf/Ustrd).',
    fr: 'Non structuré — libellé libre de remise (RmtInf/Ustrd).',
  },
  ValDt: {
    en: 'Value date — date on which the entry has value for interest.',
    fr: 'Date de valeur — date à laquelle l’écriture porte intérêt.',
  },
  Vrfctn: {
    en: 'Verification — VoP verification result block (match / close / no match).',
    fr: 'Vérification — bloc de résultat VoP (match / close / no match).',
  },
  encoding: {
    en: 'XML declaration encoding — character encoding of the document (UTF-8).',
    fr: 'Encodage de la déclaration XML — jeu de caractères du document (UTF-8).',
  },
  version: {
    en: 'XML declaration version — XML version attribute (usually 1.0).',
    fr: 'Version de la déclaration XML — attribut de version XML (souvent 1.0).',
  },
  xmlns: {
    en: 'XML namespace — ISO 20022 schema URN for this message version.',
    fr: 'Espace de noms XML — URN du schéma ISO 20022 pour cette version.',
  },
};

/** Look up a short tip for a local ISO element or attribute name. */
export function isoElementTip(name: string, locale: Locale): string | undefined {
  const tip = ISO_ELEMENTS[name];
  return tip?.[locale];
}
