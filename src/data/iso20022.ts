import type { Iso20022Message, Locale, MessageVersion } from '@/types';
// Relative path: Wrangler Pages Functions bundle this file without Vite aliases.
import { canonicalId, parseMessageId } from '../lib/messageId';

/**
 * ISO 20022 messages that show up in a PSD2 estate.
 * `requiredPaths` is a pragmatic subset used by /api/validate — enough to catch
 * the mistakes people actually make, not a replacement for the XSD.
 *
 * `versions` lists SWIFT/ISO schema revisions and national usage guidelines
 * (pacs.008.001.08 → .08.ch.02 → .10 → .13). Markets pick one — the xmlns must match.
 */
export const ISO_MESSAGES: Iso20022Message[] = [
  // ── pain: customer to bank ──────────────────────────────────────────────
  {
    id: 'pain.001.001.09',
    short: 'pain.001',
    name: 'CustomerCreditTransferInitiationV09',
    area: 'pain',
    direction: 'customer-to-bank',
    purpose:
      'The instruction a customer — or a PISP acting for one — sends to its bank to move money. In PSD2 this is what a bulk or file payment body actually contains.',
    rootElement: 'CstmrCdtTrfInitn',
    requiredPaths: [
      'CstmrCdtTrfInitn/GrpHdr/MsgId',
      'CstmrCdtTrfInitn/GrpHdr/CreDtTm',
      'CstmrCdtTrfInitn/GrpHdr/NbOfTxs',
      'CstmrCdtTrfInitn/GrpHdr/InitgPty',
      'CstmrCdtTrfInitn/PmtInf/PmtInfId',
      'CstmrCdtTrfInitn/PmtInf/PmtMtd',
      'CstmrCdtTrfInitn/PmtInf/Dbtr',
      'CstmrCdtTrfInitn/PmtInf/DbtrAcct/Id/IBAN',
      'CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/PmtId/EndToEndId',
      'CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/Amt/InstdAmt',
      'CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/Cdtr',
      'CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf/CdtrAcct/Id/IBAN',
    ],
    flows: ['clearing-sct-happy-path', 'sic-chf-credit'],
    tags: ['initiation', 'sepa', 'credit transfer', 'bulk', 'pain', 'sic', 'chf'],
    versions: [
      {
        id: 'pain.001.001.09',
        schemaName: 'CustomerCreditTransferInitiationV09',
        status: 'current',
        markets: ['sepa-sct', 'uk-ob'],
        notes: {
          en: 'EPC customer initiation baseline used with modern pain.001 file and API payloads. UK Open Banking bulk channels reuse this xmlns.',
          fr: 'Référence EPC pour l’initiation client, utilisée avec les payloads pain.001 fichier et API modernes. Les canaux bulk UK Open Banking réutilisent ce xmlns.',
        },
      },
      {
        id: 'pain.001.001.09.ch.03',
        schemaName: 'CustomerCreditTransferInitiationV09',
        status: 'current',
        markets: ['swiss-sps'],
        notes: {
          en: 'Swiss Payment Standards customer-bank schema. Document xmlns is the SIX URL, not the ISO urn; CHF SIC initiation must quote this id.',
          fr: 'Schéma client-banque Swiss Payment Standards. Le xmlns Document est l’URL SIX, pas l’urn ISO ; l’initiation SIC CHF doit citer cet id.',
        },
      },
      {
        id: 'pain.001.001.03',
        schemaName: 'CustomerCreditTransferInitiationV03',
        status: 'legacy',
        markets: ['sepa-sct'],
        notes: {
          en: 'Older SEPA pain.001 still seen in legacy file channels. Do not mix with a bank that only accepts .09.',
          fr: 'Ancien pain.001 SEPA encore vu sur des canaux fichier historiques. Ne pas mélanger avec une banque qui n’accepte que le .09.',
        },
      },
      {
        id: 'pain.001.003.03',
        schemaName: 'CustomerCreditTransferInitiationV03',
        status: 'legacy',
        markets: ['dk'],
        notes: {
          en: 'German DK / DFÜ-Abkommen flavour 003, still sent on many EBICS contracts. Same ISO version as .001.03 but a different variant — not a .de country suffix.',
          fr: 'Flavour 003 DK / DFÜ-Abkommen allemand, encore envoyé sur de nombreux contrats EBICS. Même version ISO que le .001.03 mais une variante différente — pas un suffixe pays .de.',
        },
      },
    ],
  },
  {
    id: 'pain.002.001.10',
    short: 'pain.002',
    name: 'CustomerPaymentStatusReportV10',
    area: 'pain',
    direction: 'bank-to-customer',
    purpose:
      'The bank telling the initiator what happened to a pain.001. Group, payment-information and transaction level statuses are all optional, which is why parsers must handle three nesting levels.',
    rootElement: 'CstmrPmtStsRpt',
    requiredPaths: [
      'CstmrPmtStsRpt/GrpHdr/MsgId',
      'CstmrPmtStsRpt/GrpHdr/CreDtTm',
      'CstmrPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId',
      'CstmrPmtStsRpt/OrgnlGrpInfAndSts/OrgnlMsgNmId',
    ],
    flows: ['sic-chf-credit'],
    tags: ['status', 'report', 'rejection', 'pain', 'sic'],
    versions: [
      {
        id: 'pain.002.001.10',
        schemaName: 'CustomerPaymentStatusReportV10',
        status: 'current',
        markets: ['sepa-sct'],
        notes: {
          en: 'ISO / EPC customer status report paired with pain.001.001.09. OrgnlMsgNmId must quote the original initiation’s full versioned id.',
          fr: 'Rapport de statut client ISO / EPC associé au pain.001.001.09. OrgnlMsgNmId doit citer l’id versionné complet de l’initiation d’origine.',
        },
      },
      {
        id: 'pain.002.001.10.ch.03',
        schemaName: 'CustomerPaymentStatusReportV10',
        status: 'current',
        markets: ['swiss-sps'],
        notes: {
          en: 'Swiss Payment Standards status report. Pair it with pain.001.001.09.ch.03; a plain ISO xmlns here is a common Swiss-bank rejection.',
          fr: 'Rapport de statut Swiss Payment Standards. Associez-le au pain.001.001.09.ch.03 ; un xmlns ISO nu est un motif de rejet fréquent en Suisse.',
        },
      },
    ],
  },
  {
    id: 'pain.008.001.08',
    short: 'pain.008',
    name: 'CustomerDirectDebitInitiationV08',
    area: 'pain',
    direction: 'customer-to-bank',
    purpose: 'SEPA Direct Debit collection instruction. Carries the mandate reference and sequence type that drive R-transaction handling.',
    rootElement: 'CstmrDrctDbtInitn',
    requiredPaths: [
      'CstmrDrctDbtInitn/GrpHdr/MsgId',
      'CstmrDrctDbtInitn/PmtInf/PmtInfId',
      'CstmrDrctDbtInitn/PmtInf/Cdtr',
      'CstmrDrctDbtInitn/PmtInf/DrctDbtTxInf/DrctDbtTx/MndtRltdInf/MndtId',
    ],
    flows: [],
    tags: ['direct debit', 'sdd', 'mandate', 'pain'],
    versions: [
      {
        id: 'pain.008.001.08',
        schemaName: 'CustomerDirectDebitInitiationV08',
        status: 'current',
        markets: ['sepa-sct'],
        notes: {
          en: 'EPC SEPA Direct Debit initiation on the current ISO catalogue revision.',
          fr: 'Initiation de prélèvement SEPA EPC sur la révision courante du catalogue ISO.',
        },
      },
      {
        id: 'pain.008.003.02',
        schemaName: 'CustomerDirectDebitInitiationV02',
        status: 'legacy',
        markets: ['dk'],
        notes: {
          en: 'German DK / DFÜ-Abkommen SDD flavour 003. Still common on EBICS; not a .de country suffix.',
          fr: 'Flavour 003 DK / DFÜ-Abkommen pour le SDD. Encore courant sur EBICS ; ce n’est pas un suffixe pays .de.',
        },
      },
    ],
  },
  {
    id: 'pain.013.001.09',
    short: 'pain.013',
    name: 'CreditorPaymentActivationRequestV09',
    area: 'pain',
    direction: 'customer-to-bank',
    purpose: 'Request-to-Pay. The creditor asks the debtor to authorise a payment — the ISO underpinning of SRTP and of most PISP-at-checkout products.',
    rootElement: 'CdtrPmtActvtnReq',
    requiredPaths: ['CdtrPmtActvtnReq/GrpHdr/MsgId', 'CdtrPmtActvtnReq/PmtInf/CdtTrfTx/PmtId/EndToEndId'],
    flows: [],
    tags: ['request to pay', 'rtp', 'srtp', 'pain'],
  },
  {
    id: 'pain.014.001.09',
    short: 'pain.014',
    name: 'CreditorPaymentActivationRequestStatusReportV09',
    area: 'pain',
    direction: 'bank-to-customer',
    purpose: 'The answer to a pain.013 — accepted, rejected or pending.',
    rootElement: 'CdtrPmtActvtnReqStsRpt',
    requiredPaths: ['CdtrPmtActvtnReqStsRpt/GrpHdr/MsgId', 'CdtrPmtActvtnReqStsRpt/OrgnlGrpInfAndSts/OrgnlMsgId'],
    flows: [],
    tags: ['request to pay', 'status', 'pain'],
  },

  // ── pacs: bank to bank ──────────────────────────────────────────────────
  {
    id: 'pacs.008.001.08',
    short: 'pacs.008',
    name: 'FIToFICustomerCreditTransferV08',
    area: 'pacs',
    direction: 'bank-to-bank',
    purpose:
      'The interbank credit transfer. Everything a PISP initiates eventually becomes one of these. SWIFT and ISO publish successive schema versions (…001.08, …001.10, …001.13); each market picks one via its usage guideline (EPC SEPA, CBPR+, SIC…).',
    rootElement: 'FIToFICstmrCdtTrf',
    requiredPaths: [
      'FIToFICstmrCdtTrf/GrpHdr/MsgId',
      'FIToFICstmrCdtTrf/GrpHdr/CreDtTm',
      'FIToFICstmrCdtTrf/GrpHdr/NbOfTxs',
      'FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmMtd',
      'FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/TxId',
      'FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt',
      'FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgBr',
      'FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr',
      'FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr',
    ],
    flows: [
      'bg-pis-sepa-redirect',
      'clearing-sct-happy-path',
      'clearing-reject',
      'sic-chf-credit',
      'sic-ip-instant',
      'sic-ip-timeout',
      'eurosic-eur-credit',
      'wero-a2a-payment',
      'sct-inst-happy-path',
      'sct-inst-reject',
      'sct-inst-vop',
      'sepa-instant-timeout',
      'hub-ip-transaction-flow',
      'hub-non-ip-transaction-flow',
      'target2-regular-payment',
    ],
    tags: ['interbank', 'sepa', 'sct', 'instant', 'pacs', 'sic', 'eurosic', 'wero', 'sct-inst', 'tips', 'cbpr+'],
    versions: [
      {
        id: 'pacs.008.001.08',
        schemaName: 'FIToFICustomerCreditTransferV08',
        status: 'current',
        markets: ['sepa-sct', 'sepa-sct-inst', 'tips', 'rt1', 'target2'],
        notes: {
          en: 'SEPA / SCT Inst / TARGET2 baseline. EPC rulebooks and most TIPS/RT1 traffic still expect this ISO xmlns. SEPA samples in this explorer use .08.',
          fr: 'Référence SEPA / SCT Inst / TARGET2. Les rulebooks EPC et la plupart du trafic TIPS/RT1 attendent encore ce xmlns ISO. Les exemples SEPA de l’explorateur utilisent le .08.',
        },
      },
      {
        id: 'pacs.008.001.08.ch.02',
        schemaName: 'FIToFICustomerCreditTransferV08',
        status: 'current',
        markets: ['sic', 'eurosic', 'swiss-sps'],
        notes: {
          en: 'SIC / euroSIC / SIC IP usage guideline. SIX publishes pacs.008.001.08.ch.02.xsd with a CH-specific namespace; ClrSys remains SIC, SICIP or EUROSIC.',
          fr: 'Guide d’usage SIC / euroSIC / SIC IP. SIX publie pacs.008.001.08.ch.02.xsd avec un namespace CH ; ClrSys reste SIC, SICIP ou EUROSIC.',
        },
      },
      {
        id: 'pacs.008.001.10',
        schemaName: 'FIToFICustomerCreditTransferV10',
        status: 'current',
        markets: ['cbpr-plus', 'swift-mx'],
        notes: {
          en: 'Later ISO maintenance release adopted on some CBPR+ / cross-border MX corridors. Same FIToFICstmrCdtTrf business root; banks reject a mismatched version number in the namespace.',
          fr: 'Révision ISO ultérieure adoptée sur certains corridors CBPR+ / MX transfrontaliers. Même racine métier FIToFICstmrCdtTrf ; les banques rejettent un numéro de version incorrect dans le namespace.',
        },
      },
      {
        id: 'pacs.008.001.13',
        schemaName: 'FIToFICustomerCreditTransferV13',
        status: 'upcoming',
        markets: ['cbpr-plus', 'swift-mx'],
        notes: {
          en: 'Further ISO / SWIFT catalogue step. Track your market’s migration window — CBPR+ and regional HVPS publish the mandated revision, not the ISO catalogue alone.',
          fr: 'Étape ultérieure du catalogue ISO / SWIFT. Suivez la fenêtre de migration de votre marché — CBPR+ et les HVPS régionaux publient la révision imposée, pas le catalogue ISO seul.',
        },
      },
    ],
  },
  {
    id: 'pacs.002.001.10',
    short: 'pacs.002',
    name: 'FIToFIPaymentStatusReportV10',
    area: 'pacs',
    direction: 'bank-to-bank',
    purpose:
      'The clearing answer. Under SEPA Instant this is the message you are waiting on inside a 10-second window, and TxSts=ACSC is the only thing that means settled. Pair its schema version with the pacs.008 you acknowledged.',
    rootElement: 'FIToFIPmtStsRpt',
    requiredPaths: [
      'FIToFIPmtStsRpt/GrpHdr/MsgId',
      'FIToFIPmtStsRpt/GrpHdr/CreDtTm',
      'FIToFIPmtStsRpt/TxInfAndSts/OrgnlEndToEndId',
      'FIToFIPmtStsRpt/TxInfAndSts/TxSts',
    ],
    flows: [
      'clearing-sct-happy-path',
      'clearing-reject',
      'sepa-instant-timeout',
      'sic-chf-credit',
      'sic-ip-instant',
      'sic-ip-timeout',
      'eurosic-eur-credit',
      'wero-a2a-payment',
      'sct-inst-happy-path',
      'sct-inst-reject',
      'sct-inst-vop',
      'hub-ip-transaction-flow',
      'hub-non-ip-transaction-flow',
      'target2-regular-payment',
    ],
    tags: ['status', 'acsc', 'rjct', 'instant', 'pacs', 'sic', 'sct-inst', 'ack', 'cbpr+'],
    versions: [
      {
        id: 'pacs.002.001.10',
        schemaName: 'FIToFIPaymentStatusReportV10',
        status: 'current',
        markets: ['sepa-sct', 'sepa-sct-inst', 'tips', 'rt1'],
        notes: {
          en: 'Status report paired with pacs.008.001.08 on SEPA / SCT Inst rails. OrgnlMsgNmId must quote the original message’s full versioned id.',
          fr: 'Rapport de statut associé au pacs.008.001.08 sur les rails SEPA / SCT Inst. OrgnlMsgNmId doit citer l’id versionné complet du message d’origine.',
        },
      },
      {
        id: 'pacs.002.001.10.ch.02',
        schemaName: 'FIToFIPaymentStatusReportV10',
        status: 'current',
        markets: ['sic', 'eurosic', 'swiss-sps'],
        notes: {
          en: 'SIC receipt/settlement ack. Pair it with pacs.008.001.08.ch.02 so OrgnlMsgNmId matches the original Swiss interbank xmlns.',
          fr: 'Ack de réception/règlement SIC. Associez-le au pacs.008.001.08.ch.02 pour que OrgnlMsgNmId corresponde au xmlns interbancaire suisse d’origine.',
        },
      },
      {
        id: 'pacs.002.001.12',
        schemaName: 'FIToFIPaymentStatusReportV12',
        status: 'upcoming',
        markets: ['cbpr-plus', 'swift-mx'],
        notes: {
          en: 'Later revision aligned with newer pacs.008 CBPR+ packages. Keep ack and original transfer on compatible catalogue releases.',
          fr: 'Révision ultérieure alignée sur les packages pacs.008 CBPR+ plus récents. Gardez l’ack et le virement d’origine sur des releases de catalogue compatibles.',
        },
      },
    ],
  },
  {
    id: 'pacs.004.001.09',
    short: 'pacs.004',
    name: 'PaymentReturnV09',
    area: 'pacs',
    direction: 'bank-to-bank',
    purpose:
      'Money going back. Used for returns after settlement and as the positive answer to a recall. Carries RtrRsnInf with the original reason code.',
    rootElement: 'PmtRtr',
    requiredPaths: [
      'PmtRtr/GrpHdr/MsgId',
      'PmtRtr/TxInf/RtrId',
      'PmtRtr/TxInf/OrgnlEndToEndId',
      'PmtRtr/TxInf/RtrdIntrBkSttlmAmt',
      'PmtRtr/TxInf/RtrRsnInf/Rsn/Cd',
    ],
    flows: ['clearing-recall', 'sct-inst-recall'],
    tags: ['return', 'r-transaction', 'recall', 'pacs', 'sct-inst'],
  },
  {
    id: 'pacs.009.001.09',
    short: 'pacs.009',
    name: 'FinancialInstitutionCreditTransferV09',
    area: 'pacs',
    direction: 'bank-to-bank',
    purpose: 'Bank-to-bank transfer where both parties are financial institutions — cover payments and liquidity moves.',
    rootElement: 'FICdtTrf',
    requiredPaths: ['FICdtTrf/GrpHdr/MsgId', 'FICdtTrf/CdtTrfTxInf/PmtId/TxId', 'FICdtTrf/CdtTrfTxInf/IntrBkSttlmAmt'],
    flows: [],
    tags: ['interbank', 'cover', 'liquidity', 'pacs'],
  },
  {
    id: 'pacs.028.001.04',
    short: 'pacs.028',
    name: 'FIToFIPaymentStatusRequestV04',
    area: 'pacs',
    direction: 'bank-to-bank',
    purpose: 'Asking the other side what happened, when no pacs.002 arrived. The polite version of a payment investigation.',
    rootElement: 'FIToFIPmtStsReq',
    requiredPaths: ['FIToFIPmtStsReq/GrpHdr/MsgId', 'FIToFIPmtStsReq/TxInf/OrgnlEndToEndId'],
    flows: ['sepa-instant-timeout', 'sic-ip-timeout'],
    tags: ['enquiry', 'investigation', 'timeout', 'pacs', 'sic-ip', 'sct-inst'],
  },

  // ── camt: cash management ───────────────────────────────────────────────
  {
    id: 'camt.052.001.08',
    short: 'camt.052',
    name: 'BankToCustomerAccountReportV08',
    area: 'camt',
    direction: 'bank-to-customer',
    purpose:
      'Intraday account report. Berlin Group lets an ASPSP return this instead of JSON from GET /transactions when you ask for it in the Accept header.',
    rootElement: 'BkToCstmrAcctRpt',
    requiredPaths: [
      'BkToCstmrAcctRpt/GrpHdr/MsgId',
      'BkToCstmrAcctRpt/GrpHdr/CreDtTm',
      'BkToCstmrAcctRpt/Rpt/Id',
      'BkToCstmrAcctRpt/Rpt/Acct/Id',
    ],
    flows: ['bg-ais-consent-redirect'],
    tags: ['reporting', 'intraday', 'transactions', 'camt'],
  },
  {
    id: 'camt.053.001.08',
    short: 'camt.053',
    name: 'BankToCustomerStatementV08',
    area: 'camt',
    direction: 'bank-to-customer',
    purpose: 'End-of-day statement. Closing booked balance is authoritative; intraday reports are not.',
    rootElement: 'BkToCstmrStmt',
    requiredPaths: ['BkToCstmrStmt/GrpHdr/MsgId', 'BkToCstmrStmt/Stmt/Id', 'BkToCstmrStmt/Stmt/Acct/Id', 'BkToCstmrStmt/Stmt/Bal'],
    flows: [],
    tags: ['statement', 'reconciliation', 'end of day', 'camt'],
  },
  {
    id: 'camt.054.001.08',
    short: 'camt.054',
    name: 'BankToCustomerDebitCreditNotificationV08',
    area: 'camt',
    direction: 'bank-to-customer',
    purpose: 'Real-time credit or debit notification. What a merchant listens to in order to release goods on an instant payment.',
    rootElement: 'BkToCstmrDbtCdtNtfctn',
    requiredPaths: [
      'BkToCstmrDbtCdtNtfctn/GrpHdr/MsgId',
      'BkToCstmrDbtCdtNtfctn/Ntfctn/Id',
      'BkToCstmrDbtCdtNtfctn/Ntfctn/Acct/Id',
    ],
    flows: ['clearing-sct-happy-path', 'sct-inst-happy-path'],
    tags: ['notification', 'instant', 'credit', 'camt'],
  },
  {
    id: 'camt.056.001.08',
    short: 'camt.056',
    name: 'FIToFIPaymentCancellationRequestV08',
    area: 'camt',
    direction: 'bank-to-bank',
    purpose: 'The recall. Asks the creditor bank to send the money back, quoting a CancellationReason such as DUPL, TECH or FRAD.',
    rootElement: 'FIToFIPmtCxlReq',
    requiredPaths: [
      'FIToFIPmtCxlReq/Assgnmt/Id',
      'FIToFIPmtCxlReq/Assgnmt/Assgnr',
      'FIToFIPmtCxlReq/Assgnmt/Assgne',
      'FIToFIPmtCxlReq/Undrlyg/TxInf/CxlId',
      'FIToFIPmtCxlReq/Undrlyg/TxInf/OrgnlEndToEndId',
      'FIToFIPmtCxlReq/Undrlyg/TxInf/CxlRsnInf/Rsn/Cd',
    ],
    flows: ['clearing-recall', 'sct-inst-recall'],
    tags: ['recall', 'cancellation', 'fraud', 'camt', 'sct-inst'],
  },
  {
    id: 'camt.029.001.09',
    short: 'camt.029',
    name: 'ResolutionOfInvestigationV09',
    area: 'camt',
    direction: 'bank-to-bank',
    purpose: 'The answer to a camt.056 or camt.026. Negative answers carry a RejectionReason; positive ones are followed by a pacs.004.',
    rootElement: 'RsltnOfInvstgtn',
    requiredPaths: ['RsltnOfInvstgtn/Assgnmt/Id', 'RsltnOfInvstgtn/Sts/Conf'],
    flows: ['clearing-recall', 'sct-inst-recall'],
    tags: ['investigation', 'resolution', 'recall', 'camt', 'sct-inst'],
  },
  {
    id: 'camt.055.001.08',
    short: 'camt.055',
    name: 'CustomerPaymentCancellationRequestV08',
    area: 'camt',
    direction: 'customer-to-bank',
    purpose: 'A customer asking its own bank to cancel a pain.001 it already sent. Maps onto DELETE /v1/payments in Berlin Group.',
    rootElement: 'CstmrPmtCxlReq',
    requiredPaths: ['CstmrPmtCxlReq/Assgnmt/Id', 'CstmrPmtCxlReq/Undrlyg/OrgnlPmtInfAndCxl/OrgnlPmtInfId'],
    flows: ['bg-payment-cancellation'],
    tags: ['cancellation', 'customer', 'camt'],
  },
  {
    id: 'camt.026.001.10',
    short: 'camt.026',
    name: 'UnableToApplyV10',
    area: 'camt',
    direction: 'bank-to-bank',
    purpose: 'A payment arrived but cannot be applied — missing or unusable remittance information. Opens an investigation case.',
    rootElement: 'UblToApply',
    requiredPaths: ['UblToApply/Assgnmt/Id', 'UblToApply/Case/Id'],
    flows: [],
    tags: ['investigation', 'exception', 'camt'],
  },
  {
    id: 'camt.087.001.09',
    short: 'camt.087',
    name: 'RequestToModifyPaymentV09',
    area: 'camt',
    direction: 'bank-to-bank',
    purpose: 'Asking for a field to be corrected rather than the payment returned — usually a beneficiary detail.',
    rootElement: 'ReqToModfyPmt',
    requiredPaths: ['ReqToModfyPmt/Assgnmt/Id', 'ReqToModfyPmt/Case/Id'],
    flows: [],
    tags: ['modification', 'investigation', 'camt'],
  },

  // ── acmt / auth ─────────────────────────────────────────────────────────
  {
    id: 'acmt.023.001.03',
    short: 'acmt.023',
    name: 'IdentificationVerificationRequestV03',
    area: 'acmt',
    direction: 'bank-to-bank',
    purpose:
      'Verification of Payee. Since the SEPA Instant Regulation made VoP mandatory in October 2025, this is the pre-flight check before a credit transfer leaves.',
    rootElement: 'IdVrfctnReq',
    requiredPaths: ['IdVrfctnReq/Assgnmt/Id', 'IdVrfctnReq/Vrfctn/Id', 'IdVrfctnReq/Vrfctn/PtyAndAcctId'],
    flows: ['vop-check', 'sct-inst-vop'],
    tags: ['vop', 'verification of payee', 'confirmation of payee', 'acmt', 'ipr'],
  },
  {
    id: 'acmt.024.001.03',
    short: 'acmt.024',
    name: 'IdentificationVerificationReportV03',
    area: 'acmt',
    direction: 'bank-to-bank',
    purpose: 'The VoP answer: match, close match with the correct name returned, or no match.',
    rootElement: 'IdVrfctnRpt',
    requiredPaths: ['IdVrfctnRpt/Assgnmt/Id', 'IdVrfctnRpt/Rpt/OrgnlId', 'IdVrfctnRpt/Rpt/Vrfctn'],
    flows: ['vop-check', 'sct-inst-vop'],
    tags: ['vop', 'match', 'report', 'acmt', 'ipr'],
  },
];

export const messageByShort = (short: string) => ISO_MESSAGES.find((m) => m.short === short);
export const messageById = (id: string) => ISO_MESSAGES.find((m) => m.id === id);

/** Markets / exchange zones that pick an ISO schema revision via usage guidelines. */
export const MESSAGE_MARKET_LABELS: Record<string, Record<Locale, string>> = {
  'sepa-sct': { en: 'SEPA SCT', fr: 'SCT SEPA' },
  'sepa-sct-inst': { en: 'SEPA SCT Inst', fr: 'SCT Inst SEPA' },
  tips: { en: 'TIPS', fr: 'TIPS' },
  rt1: { en: 'RT1', fr: 'RT1' },
  target2: { en: 'TARGET2', fr: 'TARGET2' },
  'cbpr-plus': { en: 'CBPR+', fr: 'CBPR+' },
  'swift-mx': { en: 'SWIFT MX', fr: 'SWIFT MX' },
  sic: { en: 'SIC', fr: 'SIC' },
  eurosic: { en: 'euroSIC', fr: 'euroSIC' },
  'swiss-sps': { en: 'Swiss SPS', fr: 'SPS suisse' },
  dk: { en: 'German DK', fr: 'DK allemande' },
  'uk-ob': { en: 'UK Open Banking', fr: 'UK Open Banking' },
};

/**
 * Declinations for a message. Falls back to a single synthetic entry from `id`
 * when the catalogue has not listed successive SWIFT/ISO revisions yet.
 */
export function versionsFor(message: Iso20022Message): MessageVersion[] {
  if (message.versions?.length) return message.versions;
  const parts = parseMessageId(message.id);
  return [
    {
      id: message.id,
      schemaName: message.name,
      status: 'current',
      markets: [],
      notes: {
        en: parts.valid
          ? `Catalogue entry ${message.id} (variant ${parts.variant}, version ${parts.version}).`
          : `Catalogue entry ${message.id}.`,
        fr: parts.valid
          ? `Entrée catalogue ${message.id} (variante ${parts.variant}, version ${parts.version}).`
          : `Entrée catalogue ${message.id}.`,
      },
    },
  ];
}

export function versionById(message: Iso20022Message, id: string): MessageVersion | undefined {
  const wanted = canonicalId(id);
  return versionsFor(message).find((v) => canonicalId(v.id) === wanted);
}

export const AREA_LABELS: Record<string, string> = {
  pain: 'Payments Initiation',
  pacs: 'Payments Clearing & Settlement',
  camt: 'Cash Management',
  acmt: 'Account Management',
  auth: 'Authorities',
  remt: 'Remittance Advice',
};
