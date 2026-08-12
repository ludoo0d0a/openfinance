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
}

export type Pacs002Outcome = 'ACSC' | 'RJCT';

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
  settlementDate: new Date().toISOString().slice(0, 10),
  createdAt: new Date().toISOString().replace(/\.\d{3}Z$/, ''),
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
  const localInstr = input.instant
    ? `
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>INST</Cd></LclInstrm>
      </PmtTpInf>`
    : `
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
      </PmtTpInf>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${esc(input.msgId)}</MsgId>
      <CreDtTm>${esc(input.createdAt)}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="${esc(input.currency)}">${esc(input.amount)}</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>${esc(input.settlementDate)}</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        ${clrSysXml(input.clrSys)}
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>${esc(input.debtorBic)}</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>${esc(input.creditorBic)}</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${esc(input.instructionId)}</InstrId>
        <EndToEndId>${esc(input.endToEndId)}</EndToEndId>
        <TxId>${esc(input.txId)}</TxId>
      </PmtId>${localInstr}
      <IntrBkSttlmAmt Ccy="${esc(input.currency)}">${esc(input.amount)}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${esc(input.settlementDate)}</IntrBkSttlmDt>
      <AccptncDtTm>${esc(input.createdAt)}</AccptncDtTm>
      <ChrgBr>SLEV</ChrgBr>
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
  const statusMsgId = input.msgId.replace(/PACS8/i, 'PACS2') || 'PACS2-TRY-0001';
  const statusBlock =
    outcome === 'ACSC'
      ? `<TxSts>ACSC</TxSts>
      <AccptncDtTm>${esc(input.createdAt)}</AccptncDtTm>`
      : `<TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Rsn><Cd>${esc(reasonCode)}</Cd></Rsn>
        <AddtlInf>Synthetic reject from the Try Editor</AddtlInf>
      </StsRsnInf>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>${esc(statusMsgId)}</MsgId>
      <CreDtTm>${esc(input.createdAt)}</CreDtTm>
      <InstgAgt><FinInstnId><BICFI>${esc(input.creditorBic)}</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>${esc(input.debtorBic)}</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>${esc(input.msgId)}</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
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
