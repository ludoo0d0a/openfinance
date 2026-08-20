/** Form fields used by the Try Editor to build pacs.008 / pacs.002 pairs. */
export interface PacsBuildInput {
  amount: string;
  currency: string;
  endToEndId: string;
  instructionId: string;
  txId: string;
  msgId: string;
  debtorName: string;
  debtorIban: string;
  debtorBic: string;
  creditorName: string;
  creditorIban: string;
  creditorBic: string;
  remittance: string;
  clrSys: 'TIPS' | 'RT1' | 'STEP2' | 'SIC' | 'EUROSIC';
  instant: boolean;
  settlementDate: string;
  /** ISO datetime used as AccptncDtTm / CreDtTm */
  createdAt: string;
  xmlns: string;
  nbOfTxs: string;
  ttlAmount: string;
  ttlCurrency: string;
  grpSettlementDate: string;
  sttlmMtd: string;
  instgAgtBic: string;
  instdAgtBic: string;
  svcLvl: string;
  lclInstrm: string;
  accptncDtTm: string;
  chrgBr: string;
  statusMsgId: string;
  orgnlMsgNmId: string;
  addtlInf: string;
}

export type Pacs002Outcome = 'ACSC' | 'RJCT';

const now = new Date();
const today = now.toISOString().slice(0, 10);
const created = now.toISOString().replace(/\.\d{3}Z$/, '');

export const DEFAULT_PACS_INPUT: PacsBuildInput = {
  amount: '42.50',
  currency: 'EUR',
  endToEndId: 'E2E-TRY-2026-0001',
  instructionId: 'INSTR-TRY-0001',
  txId: 'TX-TRY-00000001',
  msgId: 'PACS8-TRY-0001',
  debtorName: 'Marie Lefebvre',
  debtorIban: 'FR7630006000011234567890189',
  debtorBic: 'DEMOFRPPXXX',
  creditorName: 'Atelier Rousseau SARL',
  creditorIban: 'DE89370400440532013000',
  creditorBic: 'COBADEFFXXX',
  remittance: 'Try editor payment',
  clrSys: 'TIPS',
  instant: true,
  settlementDate: today,
  createdAt: created,
  xmlns: 'urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08',
  nbOfTxs: '1',
  ttlAmount: '42.50',
  ttlCurrency: 'EUR',
  grpSettlementDate: today,
  sttlmMtd: 'CLRG',
  instgAgtBic: 'DEMOFRPPXXX',
  instdAgtBic: 'COBADEFFXXX',
  svcLvl: 'SEPA',
  lclInstrm: 'INST',
  accptncDtTm: created,
  chrgBr: 'SLEV',
  statusMsgId: 'PACS2-TRY-0001',
  orgnlMsgNmId: 'pacs.008.001.08',
  addtlInf: 'Synthetic reject from the Try Editor',
};

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clrSysXml(code: PacsBuildInput['clrSys']): string {
  if (code === 'STEP2') return '<ClrSys><Cd>STEP2</Cd></ClrSys>';
  return `<ClrSys><Prtry>${esc(code)}</Prtry></ClrSys>`;
}

/** Build a synthetic pacs.008 from the Try Editor form. */
export function buildPacs008(input: PacsBuildInput): string {
  const lcl = input.lclInstrm.trim()
    ? `
        <LclInstrm><Cd>${esc(input.lclInstrm)}</Cd></LclInstrm>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="${esc(input.xmlns)}">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${esc(input.msgId)}</MsgId>
      <CreDtTm>${esc(input.createdAt)}</CreDtTm>
      <NbOfTxs>${esc(input.nbOfTxs)}</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="${esc(input.ttlCurrency)}">${esc(input.ttlAmount)}</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>${esc(input.grpSettlementDate)}</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>${esc(input.sttlmMtd)}</SttlmMtd>
        ${clrSysXml(input.clrSys)}
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>${esc(input.instgAgtBic)}</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>${esc(input.instdAgtBic)}</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${esc(input.instructionId)}</InstrId>
        <EndToEndId>${esc(input.endToEndId)}</EndToEndId>
        <TxId>${esc(input.txId)}</TxId>
      </PmtId>
      <PmtTpInf>
        <SvcLvl><Cd>${esc(input.svcLvl)}</Cd></SvcLvl>${lcl}
      </PmtTpInf>
      <IntrBkSttlmAmt Ccy="${esc(input.currency)}">${esc(input.amount)}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${esc(input.settlementDate)}</IntrBkSttlmDt>
      <AccptncDtTm>${esc(input.accptncDtTm)}</AccptncDtTm>
      <ChrgBr>${esc(input.chrgBr)}</ChrgBr>
      <Dbtr><Nm>${esc(input.debtorName)}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${esc(input.debtorIban)}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>${esc(input.debtorBic)}</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>${esc(input.creditorBic)}</BICFI></FinInstnId></CdtrAgt>
      <Cdtr><Nm>${esc(input.creditorName)}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${esc(input.creditorIban)}</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>${esc(input.remittance)}</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}

/** Build a matching pacs.002 acknowledgement / status report for a pacs.008. */
export function buildPacs002(
  input: PacsBuildInput,
  outcome: Pacs002Outcome,
  reasonCode = 'AB05',
): string {
  const statusMsgId = input.statusMsgId.trim() || input.msgId.replace(/PACS8/i, 'PACS2') || 'PACS2-TRY-0001';
  const statusBlock =
    outcome === 'ACSC'
      ? `<TxSts>ACSC</TxSts>
      <AccptncDtTm>${esc(input.accptncDtTm)}</AccptncDtTm>`
      : `<TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Rsn><Cd>${esc(reasonCode)}</Cd></Rsn>
        <AddtlInf>${esc(input.addtlInf)}</AddtlInf>
      </StsRsnInf>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>${esc(statusMsgId)}</MsgId>
      <CreDtTm>${esc(input.createdAt)}</CreDtTm>
      <InstgAgt><FinInstnId><BICFI>${esc(input.instdAgtBic)}</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>${esc(input.instgAgtBic)}</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>${esc(input.msgId)}</OrgnlMsgId>
      <OrgnlMsgNmId>${esc(input.orgnlMsgNmId)}</OrgnlMsgNmId>
      <OrgnlCreDtTm>${esc(input.createdAt)}</OrgnlCreDtTm>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <OrgnlInstrId>${esc(input.instructionId)}</OrgnlInstrId>
      <OrgnlEndToEndId>${esc(input.endToEndId)}</OrgnlEndToEndId>
      <OrgnlTxId>${esc(input.txId)}</OrgnlTxId>
      ${statusBlock}
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`;
}
