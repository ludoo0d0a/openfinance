import type { PacsBuildInput } from './pacsBuilder';
import { xmlElementPath } from './xml';

/** Form keys, including pacs.002-only controls that live beside PacsBuildInput. */
export type EditorFieldKey = keyof PacsBuildInput | 'outcome' | 'rejectReason';

export type FieldKind = 'text' | 'date' | 'datetime' | 'select' | 'checkbox';

export interface PacsFieldSpec {
  key: EditorFieldKey;
  xmlSelectors: string[];
  labelKey: string;
  defKey: string;
  kind: FieldKind;
  expertOnly?: boolean;
  /** When this expert field is clicked in simple mode, focus this instead (or open expert). */
  simpleAlias?: EditorFieldKey;
  options?: readonly string[];
}

export interface PacsSection {
  id: string;
  titleKey: string;
  keys: EditorFieldKey[];
  columns?: 1 | 2;
}

const P008 = 'FIToFICstmrCdtTrf';
const P002 = 'FIToFIPmtStsRpt';

export const PACS_FIELDS: PacsFieldSpec[] = [
  {
    key: 'xmlns',
    xmlSelectors: ['Document@xmlns'],
    labelKey: 'try.fieldXmlns',
    defKey: 'try.defXmlns',
    kind: 'text',
    expertOnly: true,
  },
  {
    key: 'msgId',
    xmlSelectors: [`${P008}/GrpHdr/MsgId`, `${P002}/OrgnlGrpInfAndSts/OrgnlMsgId`],
    labelKey: 'try.fieldMsgId',
    defKey: 'try.defMsgId',
    kind: 'text',
  },
  {
    key: 'createdAt',
    xmlSelectors: [
      `${P008}/GrpHdr/CreDtTm`,
      `${P002}/GrpHdr/CreDtTm`,
      `${P002}/OrgnlGrpInfAndSts/OrgnlCreDtTm`,
    ],
    labelKey: 'try.fieldCreatedAt',
    defKey: 'try.defCreatedAt',
    kind: 'datetime',
  },
  {
    key: 'nbOfTxs',
    xmlSelectors: [`${P008}/GrpHdr/NbOfTxs`],
    labelKey: 'try.fieldNbOfTxs',
    defKey: 'try.defNbOfTxs',
    kind: 'text',
    expertOnly: true,
  },
  {
    key: 'ttlAmount',
    xmlSelectors: [`${P008}/GrpHdr/TtlIntrBkSttlmAmt`],
    labelKey: 'try.fieldTtlAmount',
    defKey: 'try.defTtlAmount',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'amount',
  },
  {
    key: 'ttlCurrency',
    xmlSelectors: [`${P008}/GrpHdr/TtlIntrBkSttlmAmt@Ccy`],
    labelKey: 'try.fieldTtlCurrency',
    defKey: 'try.defTtlCurrency',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'currency',
  },
  {
    key: 'grpSettlementDate',
    xmlSelectors: [`${P008}/GrpHdr/IntrBkSttlmDt`],
    labelKey: 'try.fieldGrpSettlementDate',
    defKey: 'try.defGrpSettlementDate',
    kind: 'date',
    expertOnly: true,
    simpleAlias: 'settlementDate',
  },
  {
    key: 'sttlmMtd',
    xmlSelectors: [`${P008}/GrpHdr/SttlmInf/SttlmMtd`],
    labelKey: 'try.fieldSttlmMtd',
    defKey: 'try.defSttlmMtd',
    kind: 'select',
    expertOnly: true,
    options: ['CLRG', 'INDA', 'INGA', 'COVE'],
  },
  {
    key: 'clrSys',
    xmlSelectors: [`${P008}/GrpHdr/SttlmInf/ClrSys/Prtry`, `${P008}/GrpHdr/SttlmInf/ClrSys/Cd`],
    labelKey: 'try.clearing',
    defKey: 'try.clearingDef',
    kind: 'select',
    options: ['TIPS', 'RT1', 'STEP2', 'SIC', 'EUROSIC'],
  },
  {
    key: 'instgAgtBic',
    xmlSelectors: [
      `${P008}/GrpHdr/InstgAgt/FinInstnId/BICFI`,
      `${P002}/GrpHdr/InstdAgt/FinInstnId/BICFI`,
    ],
    labelKey: 'try.fieldInstgAgt',
    defKey: 'try.defInstgAgt',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'debtorBic',
  },
  {
    key: 'instdAgtBic',
    xmlSelectors: [
      `${P008}/GrpHdr/InstdAgt/FinInstnId/BICFI`,
      `${P002}/GrpHdr/InstgAgt/FinInstnId/BICFI`,
    ],
    labelKey: 'try.fieldInstdAgt',
    defKey: 'try.defInstdAgt',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'creditorBic',
  },
  {
    key: 'instructionId',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtId/InstrId`, `${P002}/TxInfAndSts/OrgnlInstrId`],
    labelKey: 'try.fieldInstructionId',
    defKey: 'try.defInstructionId',
    kind: 'text',
  },
  {
    key: 'endToEndId',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtId/EndToEndId`, `${P002}/TxInfAndSts/OrgnlEndToEndId`],
    labelKey: 'try.fieldEndToEndId',
    defKey: 'try.defEndToEndId',
    kind: 'text',
  },
  {
    key: 'txId',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtId/TxId`, `${P002}/TxInfAndSts/OrgnlTxId`],
    labelKey: 'try.fieldTxId',
    defKey: 'try.defTxId',
    kind: 'text',
  },
  {
    key: 'svcLvl',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtTpInf/SvcLvl/Cd`],
    labelKey: 'try.fieldSvcLvl',
    defKey: 'try.defSvcLvl',
    kind: 'text',
    expertOnly: true,
  },
  {
    key: 'lclInstrm',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtTpInf/LclInstrm/Cd`],
    labelKey: 'try.fieldLclInstrm',
    defKey: 'try.defLclInstrm',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'instant',
  },
  {
    key: 'instant',
    xmlSelectors: [`${P008}/CdtTrfTxInf/PmtTpInf/LclInstrm/Cd`],
    labelKey: 'try.instant',
    defKey: 'try.instantDef',
    kind: 'checkbox',
  },
  {
    key: 'amount',
    xmlSelectors: [`${P008}/CdtTrfTxInf/IntrBkSttlmAmt`],
    labelKey: 'try.fieldAmount',
    defKey: 'try.defAmount',
    kind: 'text',
  },
  {
    key: 'currency',
    xmlSelectors: [`${P008}/CdtTrfTxInf/IntrBkSttlmAmt@Ccy`],
    labelKey: 'try.fieldCurrency',
    defKey: 'try.defCurrency',
    kind: 'text',
  },
  {
    key: 'settlementDate',
    xmlSelectors: [`${P008}/CdtTrfTxInf/IntrBkSttlmDt`],
    labelKey: 'try.fieldSettlementDate',
    defKey: 'try.defSettlementDate',
    kind: 'date',
  },
  {
    key: 'accptncDtTm',
    xmlSelectors: [`${P008}/CdtTrfTxInf/AccptncDtTm`, `${P002}/TxInfAndSts/AccptncDtTm`],
    labelKey: 'try.fieldAccptncDtTm',
    defKey: 'try.defAccptncDtTm',
    kind: 'datetime',
    expertOnly: true,
    simpleAlias: 'createdAt',
  },
  {
    key: 'chrgBr',
    xmlSelectors: [`${P008}/CdtTrfTxInf/ChrgBr`],
    labelKey: 'try.fieldChrgBr',
    defKey: 'try.defChrgBr',
    kind: 'select',
    expertOnly: true,
    options: ['SLEV', 'DEBT', 'CRED', 'SHAR'],
  },
  {
    key: 'debtorName',
    xmlSelectors: [`${P008}/CdtTrfTxInf/Dbtr/Nm`],
    labelKey: 'try.fieldDebtorName',
    defKey: 'try.defDebtorName',
    kind: 'text',
  },
  {
    key: 'debtorIban',
    xmlSelectors: [`${P008}/CdtTrfTxInf/DbtrAcct/Id/IBAN`],
    labelKey: 'try.fieldDebtorIban',
    defKey: 'try.defDebtorIban',
    kind: 'text',
  },
  {
    key: 'debtorBic',
    xmlSelectors: [`${P008}/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI`],
    labelKey: 'try.fieldDebtorBic',
    defKey: 'try.defDebtorBic',
    kind: 'text',
  },
  {
    key: 'creditorBic',
    xmlSelectors: [`${P008}/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI`],
    labelKey: 'try.fieldCreditorBic',
    defKey: 'try.defCreditorBic',
    kind: 'text',
  },
  {
    key: 'creditorName',
    xmlSelectors: [`${P008}/CdtTrfTxInf/Cdtr/Nm`],
    labelKey: 'try.fieldCreditorName',
    defKey: 'try.defCreditorName',
    kind: 'text',
  },
  {
    key: 'creditorIban',
    xmlSelectors: [`${P008}/CdtTrfTxInf/CdtrAcct/Id/IBAN`],
    labelKey: 'try.fieldCreditorIban',
    defKey: 'try.defCreditorIban',
    kind: 'text',
  },
  {
    key: 'remittance',
    xmlSelectors: [`${P008}/CdtTrfTxInf/RmtInf/Ustrd`],
    labelKey: 'try.fieldRemittance',
    defKey: 'try.defRemittance',
    kind: 'text',
  },
  {
    key: 'statusMsgId',
    xmlSelectors: [`${P002}/GrpHdr/MsgId`],
    labelKey: 'try.fieldStatusMsgId',
    defKey: 'try.defStatusMsgId',
    kind: 'text',
    expertOnly: true,
    simpleAlias: 'msgId',
  },
  {
    key: 'orgnlMsgNmId',
    xmlSelectors: [`${P002}/OrgnlGrpInfAndSts/OrgnlMsgNmId`],
    labelKey: 'try.fieldOrgnlMsgNmId',
    defKey: 'try.defOrgnlMsgNmId',
    kind: 'text',
    expertOnly: true,
  },
  {
    key: 'outcome',
    xmlSelectors: [`${P002}/TxInfAndSts/TxSts`],
    labelKey: 'try.outcome',
    defKey: 'try.outcomeDef',
    kind: 'select',
    options: ['ACSC', 'RJCT'],
  },
  {
    key: 'rejectReason',
    xmlSelectors: [`${P002}/TxInfAndSts/StsRsnInf/Rsn/Cd`],
    labelKey: 'try.reason',
    defKey: 'try.reasonDef',
    kind: 'select',
    options: ['AB05', 'AC01', 'AC03', 'AM04', 'AG01', 'AM02', 'TM01'],
  },
  {
    key: 'addtlInf',
    xmlSelectors: [`${P002}/TxInfAndSts/StsRsnInf/AddtlInf`],
    labelKey: 'try.fieldAddtlInf',
    defKey: 'try.defAddtlInf',
    kind: 'text',
    expertOnly: true,
  },
];

export const SIMPLE_SECTIONS: PacsSection[] = [
  { id: 'money', titleKey: 'try.sectionMoney', keys: ['amount', 'currency'], columns: 2 },
  {
    id: 'ids',
    titleKey: 'try.sectionIds',
    keys: ['endToEndId', 'instructionId', 'txId', 'msgId'],
    columns: 2,
  },
  { id: 'debtor', titleKey: 'try.sectionDebtor', keys: ['debtorName', 'debtorIban', 'debtorBic'] },
  {
    id: 'creditor',
    titleKey: 'try.sectionCreditor',
    keys: ['creditorName', 'creditorIban', 'creditorBic'],
  },
  { id: 'remittance', titleKey: 'try.sectionRemittance', keys: ['remittance'] },
  { id: 'timing', titleKey: 'try.sectionTiming', keys: ['settlementDate', 'createdAt'] },
];

export const EXPERT_SECTIONS: PacsSection[] = [
  { id: 'document', titleKey: 'try.sectionDocument', keys: ['xmlns'] },
  {
    id: 'grphdr',
    titleKey: 'try.sectionGrpHdr',
    keys: [
      'msgId',
      'createdAt',
      'nbOfTxs',
      'ttlAmount',
      'ttlCurrency',
      'grpSettlementDate',
      'sttlmMtd',
      'clrSys',
      'instgAgtBic',
      'instdAgtBic',
    ],
    columns: 2,
  },
  {
    id: 'pmtid',
    titleKey: 'try.sectionPmtId',
    keys: ['instructionId', 'endToEndId', 'txId'],
    columns: 2,
  },
  {
    id: 'pmttp',
    titleKey: 'try.sectionPmtTpInf',
    keys: ['svcLvl', 'lclInstrm', 'instant'],
    columns: 2,
  },
  {
    id: 'tx',
    titleKey: 'try.sectionTxInf',
    keys: ['amount', 'currency', 'settlementDate', 'accptncDtTm', 'chrgBr'],
    columns: 2,
  },
  { id: 'debtor', titleKey: 'try.sectionDebtor', keys: ['debtorName', 'debtorIban', 'debtorBic'] },
  {
    id: 'creditor',
    titleKey: 'try.sectionCreditor',
    keys: ['creditorName', 'creditorIban', 'creditorBic'],
  },
  { id: 'remittance', titleKey: 'try.sectionRemittance', keys: ['remittance'] },
  {
    id: 'status',
    titleKey: 'try.sectionStatus',
    keys: ['statusMsgId', 'orgnlMsgNmId', 'outcome', 'rejectReason', 'addtlInf'],
    columns: 2,
  },
];

const FIELD_BY_KEY = new Map(PACS_FIELDS.map((f) => [f.key, f]));

export function fieldByKey(key: EditorFieldKey): PacsFieldSpec | undefined {
  return FIELD_BY_KEY.get(key);
}

export function highlightSelectors(key: EditorFieldKey): string[] {
  return FIELD_BY_KEY.get(key)?.xmlSelectors ?? [];
}

function selectorHits(field: PacsFieldSpec, clicked: string): boolean {
  return field.xmlSelectors.some((s) => s === clicked);
}

function descendantHits(field: PacsFieldSpec, clicked: string): boolean {
  const el = xmlElementPath(clicked);
  if (clicked.includes('@')) return false;
  return field.xmlSelectors.some((s) => xmlElementPath(s).startsWith(`${el}/`));
}

/**
 * Resolve a path to a catalog field without simple-mode aliasing.
 * Exact path wins; a unique descendant under a parent tag is next.
 */
export function resolveXmlField(selector: string): PacsFieldSpec | null {
  const exact = PACS_FIELDS.filter((f) => selectorHits(f, selector));
  const pool = exact.length > 0 ? exact : PACS_FIELDS.filter((f) => descendantHits(f, selector));
  if (pool.length === 0) return null;
  if (exact.length === 0 && pool.length > 1) return null;

  if (exact.length > 1) {
    return pool.find((f) => f.kind !== 'checkbox') ?? pool[0];
  }
  return pool[0];
}

/**
 * Map a clicked XML selector to a form field.
 * Exact path wins; a unique descendant under a parent tag is next.
 */
export function resolveXmlClick(
  selector: string,
  expert: boolean,
): { field: PacsFieldSpec; enableExpert: boolean } | null {
  const exact = PACS_FIELDS.filter((f) => selectorHits(f, selector));
  const pool = exact.length > 0 ? exact : PACS_FIELDS.filter((f) => descendantHits(f, selector));
  if (pool.length === 0) return null;
  if (exact.length === 0 && pool.length > 1) return null;

  const preferred =
    pool.find((f) => (expert ? true : !f.expertOnly) && f.kind !== 'checkbox') ??
    pool.find((f) => (expert ? true : !f.expertOnly)) ??
    pool[0];

  if (!expert && preferred.expertOnly) {
    if (preferred.simpleAlias) {
      const alias = FIELD_BY_KEY.get(preferred.simpleAlias);
      if (alias) return { field: alias, enableExpert: false };
    }
    return { field: preferred, enableExpert: true };
  }

  if (expert && pool.length > 1) {
    const dedicated = pool.find((f) => f.kind !== 'checkbox') ?? preferred;
    return { field: dedicated, enableExpert: false };
  }

  return { field: preferred, enableExpert: false };
}

/** Simple-mode edits keep the mirrored expert leaves in lockstep. */
export const SIMPLE_SYNC: Partial<Record<keyof PacsBuildInput, (keyof PacsBuildInput)[]>> = {
  amount: ['ttlAmount'],
  currency: ['ttlCurrency'],
  settlementDate: ['grpSettlementDate'],
  createdAt: ['accptncDtTm'],
  debtorBic: ['instgAgtBic'],
  creditorBic: ['instdAgtBic'],
};
