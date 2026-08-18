import type { Sample } from '@/types';
// Relative import: Pages Functions esbuild does not resolve the `@/` alias.
import { xmlToJsonString } from '../lib/isoCodec';

/**
 * Payloads are realistic but entirely synthetic: test IBANs, the FR76 reserved
 * range where possible, and BICs ending XXX. Nothing here belongs to anyone.
 *
 * Hand-authored entries live in SAMPLES. Every ISO XML sample also gets a
 * derived JSON companion so each message can be inspected as XML or JSON.
 */
export const SAMPLES: Sample[] = [
  // ── Berlin Group JSON ───────────────────────────────────────────────────
  {
    id: 'bg-consent-request',
    label: 'AIS consent request',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'Dedicated accounts consent. Note that balances and transactions are separate arrays — listing an IBAN under access.accounts alone gets you the account resource and nothing else.',
    content: `{
  "access": {
    "accounts": [
      { "iban": "FR7630006000011234567890189", "currency": "EUR" }
    ],
    "balances": [
      { "iban": "FR7630006000011234567890189", "currency": "EUR" }
    ],
    "transactions": [
      { "iban": "FR7630006000011234567890189", "currency": "EUR" }
    ]
  },
  "recurringIndicator": true,
  "validUntil": "2026-11-30",
  "frequencyPerDay": 4,
  "combinedServiceIndicator": false
}`,
  },
  {
    id: 'bg-consent-response',
    label: 'AIS consent response (201)',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'consentStatus is received, not valid — the PSU has not authenticated yet. Branch your SCA handling on which _links key is present.',
    content: `{
  "consentStatus": "received",
  "consentId": "d9f4e2a1-3b7c-4e8f-9a2d-5c1b8e7f0a34",
  "_links": {
    "scaRedirect": {
      "href": "https://auth.banque-demo.fr/sca/d9f4e2a1?state=xs2a"
    },
    "self": {
      "href": "/v1/consents/d9f4e2a1-3b7c-4e8f-9a2d-5c1b8e7f0a34"
    },
    "status": {
      "href": "/v1/consents/d9f4e2a1-3b7c-4e8f-9a2d-5c1b8e7f0a34/status"
    },
    "scaStatus": {
      "href": "/v1/consents/d9f4e2a1-3b7c-4e8f-9a2d-5c1b8e7f0a34/authorisations/8c2f"
    }
  }
}`,
  },
  {
    id: 'bg-accounts-response',
    label: 'Account list response',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'resourceId is opaque and scoped to this consent. cashAccountType uses ISO 20022 ExternalCashAccountType — CACC is a current account, SVGS savings.',
    content: `{
  "accounts": [
    {
      "resourceId": "acc-3f9a2b7e",
      "iban": "FR7630006000011234567890189",
      "currency": "EUR",
      "name": "Compte courant",
      "product": "Compte de dépôt",
      "cashAccountType": "CACC",
      "bic": "DEMOFRPPXXX",
      "ownerName": "Marie Lefebvre",
      "_links": {
        "balances": { "href": "/v1/accounts/acc-3f9a2b7e/balances" },
        "transactions": { "href": "/v1/accounts/acc-3f9a2b7e/transactions" }
      }
    },
    {
      "resourceId": "acc-8d1c4f60",
      "iban": "FR7630006000011234567890265",
      "currency": "EUR",
      "name": "Livret",
      "cashAccountType": "SVGS",
      "_links": {
        "balances": { "href": "/v1/accounts/acc-8d1c4f60/balances" }
      }
    }
  ]
}`,
  },
  {
    id: 'bg-payment-request',
    label: 'SEPA credit transfer initiation',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'The sepa-credit-transfers product. instructedAmount.amount is a string — sending a JSON number is a spec violation even though many sandboxes accept it.',
    content: `{
  "instructedAmount": {
    "currency": "EUR",
    "amount": "1250.00"
  },
  "debtorAccount": {
    "iban": "FR7630006000011234567890189"
  },
  "creditorName": "Atelier Rousseau SARL",
  "creditorAccount": {
    "iban": "DE89370400440532013000"
  },
  "creditorAgent": "COBADEFFXXX",
  "remittanceInformationUnstructured": "Facture 2026-0842",
  "requestedExecutionDate": "2026-08-13"
}`,
  },
  {
    id: 'bg-funds-confirmation',
    label: 'Funds confirmation request',
    format: 'json',
    standardId: 'berlin-group',
    description: 'The response is {"fundsAvailable": true} and nothing else. Data minimisation is enforced by the RTS, not by preference.',
    content: `{
  "cardNumber": "525412******3241",
  "account": {
    "iban": "FR7630006000011234567890189"
  },
  "payee": "Librairie Gallimard",
  "instructedAmount": {
    "currency": "EUR",
    "amount": "84.90"
  }
}`,
  },
  {
    id: 'bg-error-consent-invalid',
    label: 'Error: CONSENT_INVALID (401)',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'The Berlin Group error envelope. tppMessages is an array — a single request can fail for several reasons and compliant ASPSPs report all of them.',
    content: `{
  "tppMessages": [
    {
      "category": "ERROR",
      "code": "CONSENT_INVALID",
      "path": "consentId",
      "text": "The consent does not cover balances for this account."
    }
  ],
  "_links": {
    "self": { "href": "/v1/accounts/acc-3f9a2b7e/balances" }
  }
}`,
  },

  // ── STET ────────────────────────────────────────────────────────────────
  {
    id: 'stet-payment-request',
    label: 'STET payment request',
    format: 'json',
    standardId: 'stet',
    description:
      'Notice how closely this tracks pain.001: paymentInformationId, creditTransferTransaction, requestedExecutionDate. STET is ISO 20022 in JSON clothing.',
    content: `{
  "paymentInformationId": "PMT-20260812-0001",
  "creationDateTime": "2026-08-12T09:14:22.118+02:00",
  "numberOfTransactions": 1,
  "initiatingParty": {
    "name": "Aggregateur SAS",
    "organisationId": {
      "identification": "PSDFR-ACPR-91234",
      "schemeName": "COID"
    }
  },
  "paymentTypeInformation": {
    "serviceLevel": "SEPA",
    "categoryPurpose": "CASH"
  },
  "debtor": {
    "name": "Marie Lefebvre"
  },
  "debtorAccount": {
    "iban": "FR7630006000011234567890189"
  },
  "beneficiary": {
    "creditor": { "name": "Atelier Rousseau SARL" },
    "creditorAccount": { "iban": "FR7630004000031234567890143" },
    "creditorAgent": { "bicFi": "BNPAFRPPXXX" }
  },
  "creditTransferTransaction": [
    {
      "paymentId": {
        "instructionId": "INSTR-0001",
        "endToEndId": "E2E-2026-0842"
      },
      "instructedAmount": {
        "currency": "EUR",
        "amount": "1250.00"
      },
      "remittanceInformation": ["Facture 2026-0842"],
      "requestedExecutionDate": "2026-08-13"
    }
  ],
  "supplementaryData": {
    "successfulReportUrl": "https://tpp.example/psd2/ok",
    "unsuccessfulReportUrl": "https://tpp.example/psd2/nok"
  }
}`,
  },

  // ── UK Open Banking ─────────────────────────────────────────────────────
  {
    id: 'ukob-payment-consent',
    label: 'UK domestic payment consent',
    format: 'json',
    standardId: 'uk-open-banking',
    description:
      'The Initiation block here must be reproduced byte for byte in the subsequent POST /domestic-payments. The Risk block drives fraud scoring.',
    content: `{
  "Data": {
    "Initiation": {
      "InstructionIdentification": "INSTR-7F3A21",
      "EndToEndIdentification": "E2E-7F3A21",
      "InstructedAmount": {
        "Amount": "420.50",
        "Currency": "GBP"
      },
      "CreditorAccount": {
        "SchemeName": "UK.OBIE.SortCodeAccountNumber",
        "Identification": "40051512345678",
        "Name": "Thornbury Joinery Ltd"
      },
      "RemittanceInformation": {
        "Reference": "INV-8842",
        "Unstructured": "Invoice 8842"
      }
    }
  },
  "Risk": {
    "PaymentContextCode": "BillPayment",
    "MerchantCategoryCode": "5211"
  }
}`,
  },

  // ── ISO 20022 XML ───────────────────────────────────────────────────────
  {
    id: 'pain-001-sct',
    label: 'pain.001 SEPA credit transfer',
    format: 'xml',
    messageShort: 'pain.001',
    description:
      'One payment information block, one transaction. NbOfTxs and CtrlSum must reconcile with the transactions actually present or the whole file is rejected at group level.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-20260812-0001</MsgId>
      <CreDtTm>2026-08-12T09:14:22</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>1250.00</CtrlSum>
      <InitgPty>
        <Nm>Aggregateur SAS</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>PSDFR-ACPR-91234</Id>
              <SchmeNm><Cd>COID</Cd></SchmeNm>
            </Othr>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-20260812-0001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>false</BtchBookg>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>1250.00</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>
        <Dt>2026-08-13</Dt>
      </ReqdExctnDt>
      <Dbtr>
        <Nm>Marie Lefebvre</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id><IBAN>FR7630006000011234567890189</IBAN></Id>
        <Ccy>EUR</Ccy>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId>
      </DbtrAgt>
      <ChrgBr>SLEV</ChrgBr>
      <CdtTrfTxInf>
        <PmtId>
          <InstrId>INSTR-0001</InstrId>
          <EndToEndId>E2E-2026-0842</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">1250.00</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>Atelier Rousseau SARL</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id><IBAN>DE89370400440532013000</IBAN></Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>Facture 2026-0842</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
  },
  {
    id: 'pacs-008-sct',
    label: 'pacs.008 interbank credit transfer',
    format: 'xml',
    messageShort: 'pacs.008',
    description:
      'The same payment on the interbank leg. InstdAmt became IntrBkSttlmAmt, an IntrBkSttlmDt appeared, and TxId is now the identifier the CSM quotes in every response.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>PACS8-20260812-77412</MsgId>
      <CreDtTm>2026-08-12T09:14:24</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="EUR">1250.00</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-13</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Cd>STEP2</Cd></ClrSys>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR-0001</InstrId>
        <EndToEndId>E2E-2026-0842</EndToEndId>
        <TxId>TX-DEMO-0000771412</TxId>
      </PmtId>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
      </PmtTpInf>
      <IntrBkSttlmAmt Ccy="EUR">1250.00</IntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-13</IntrBkSttlmDt>
      <ChrgBr>SLEV</ChrgBr>
      <Dbtr>
        <Nm>Marie Lefebvre</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id><IBAN>FR7630006000011234567890189</IBAN></Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>Atelier Rousseau SARL</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id><IBAN>DE89370400440532013000</IBAN></Id>
      </CdtrAcct>
      <RmtInf>
        <Ustrd>Facture 2026-0842</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
  },
  {
    id: 'pacs-002-accepted',
    label: 'pacs.002 accepted (ACSC)',
    format: 'xml',
    messageShort: 'pacs.002',
    description: 'TxSts ACSC. Settlement completed and the creditor account has been credited — the only status that lets you tell a customer the money arrived.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-20260813-11908</MsgId>
      <CreDtTm>2026-08-13T06:02:11</CreDtTm>
      <InstgAgt>
        <FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-20260812-77412</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
      <OrgnlCreDtTm>2026-08-12T09:14:24</OrgnlCreDtTm>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>STS-0000771412</StsId>
      <OrgnlInstrId>INSTR-0001</OrgnlInstrId>
      <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
      <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
      <TxSts>ACSC</TxSts>
      <AccptncDtTm>2026-08-13T06:02:09</AccptncDtTm>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-002-rejected',
    label: 'pacs.002 rejected (RJCT / AC01)',
    format: 'xml',
    messageShort: 'pacs.002',
    description:
      'AC01 IncorrectAccountNumber. The IBAN passed its checksum but does not exist at the creditor bank. Fix the data; do not retry the same instruction.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-20260812-11877</MsgId>
      <CreDtTm>2026-08-12T09:14:31</CreDtTm>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-20260812-77412</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
      <GrpSts>PART</GrpSts>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>STS-0000771413</StsId>
      <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
      <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
      <TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Orgtr>
          <Id>
            <OrgId>
              <AnyBIC>COBADEFFXXX</AnyBIC>
            </OrgId>
          </Id>
        </Orgtr>
        <Rsn>
          <Cd>AC01</Cd>
        </Rsn>
        <AddtlInf>Creditor account unknown</AddtlInf>
      </StsRsnInf>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'camt-056-recall',
    label: 'camt.056 recall request',
    format: 'xml',
    messageShort: 'camt.056',
    description:
      'A duplicate recall. Assgnr and Assgne carry the two banks in the case, and Case/Id is the reference both sides quote until the investigation closes.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.056.001.08">
  <FIToFIPmtCxlReq>
    <Assgnmt>
      <Id>CXL-20260814-0031</Id>
      <Assgnr>
        <Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt>
      </Assgnr>
      <Assgne>
        <Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt>
      </Assgne>
      <CreDtTm>2026-08-14T10:20:00</CreDtTm>
    </Assgnmt>
    <Case>
      <Id>CASE-2026-0842-DUP</Id>
      <Cretr>
        <Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt>
      </Cretr>
    </Case>
    <Undrlyg>
      <TxInf>
        <CxlId>CXLID-0000771412</CxlId>
        <OrgnlGrpInf>
          <OrgnlMsgId>PACS8-20260812-77412</OrgnlMsgId>
          <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
        </OrgnlGrpInf>
        <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
        <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
        <OrgnlIntrBkSttlmAmt Ccy="EUR">1250.00</OrgnlIntrBkSttlmAmt>
        <OrgnlIntrBkSttlmDt>2026-08-13</OrgnlIntrBkSttlmDt>
        <CxlRsnInf>
          <Rsn><Cd>DUPL</Cd></Rsn>
          <AddtlInf>Duplicate submission after client retry</AddtlInf>
        </CxlRsnInf>
      </TxInf>
    </Undrlyg>
  </FIToFIPmtCxlReq>
</Document>`,
  },
  {
    id: 'camt-029-resolution',
    label: 'camt.029 resolution (accepted)',
    format: 'xml',
    messageShort: 'camt.029',
    description: 'Sts/Conf=ACCR — the creditor bank agrees to return the funds. The pacs.004 follows separately; this message moves no money.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.029.001.09">
  <RsltnOfInvstgtn>
    <Assgnmt>
      <Id>RSL-20260814-0044</Id>
      <Assgnr>
        <Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt>
      </Assgnr>
      <Assgne>
        <Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt>
      </Assgne>
      <CreDtTm>2026-08-14T15:41:02</CreDtTm>
    </Assgnmt>
    <RslvdCase>
      <Id>CASE-2026-0842-DUP</Id>
    </RslvdCase>
    <Sts>
      <Conf>ACCR</Conf>
    </Sts>
    <CxlDtls>
      <TxInfAndSts>
        <CxlStsId>CXLSTS-0000771412</CxlStsId>
        <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
        <TxCxlSts>ACCR</TxCxlSts>
      </TxInfAndSts>
    </CxlDtls>
  </RsltnOfInvstgtn>
</Document>`,
  },
  {
    id: 'pacs-004-return',
    label: 'pacs.004 payment return',
    format: 'xml',
    messageShort: 'pacs.004',
    description:
      'The money coming back. RtrRsnInf echoes FOCR (following cancellation request) so the debtor bank can match the credit to the original recall case.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09">
  <PmtRtr>
    <GrpHdr>
      <MsgId>PACS4-20260815-20114</MsgId>
      <CreDtTm>2026-08-15T08:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlRtrdIntrBkSttlmAmt Ccy="EUR">1250.00</TtlRtrdIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-15</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <TxInf>
      <RtrId>RTN-0000771412</RtrId>
      <OrgnlGrpInf>
        <OrgnlMsgId>PACS8-20260812-77412</OrgnlMsgId>
        <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
      </OrgnlGrpInf>
      <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
      <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
      <OrgnlIntrBkSttlmAmt Ccy="EUR">1250.00</OrgnlIntrBkSttlmAmt>
      <RtrdIntrBkSttlmAmt Ccy="EUR">1250.00</RtrdIntrBkSttlmAmt>
      <RtrRsnInf>
        <Rsn><Cd>FOCR</Cd></Rsn>
        <AddtlInf>Return following recall CASE-2026-0842-DUP</AddtlInf>
      </RtrRsnInf>
    </TxInf>
  </PmtRtr>
</Document>`,
  },
  {
    id: 'camt-052-report',
    label: 'camt.052 account report',
    format: 'xml',
    messageShort: 'camt.052',
    description:
      'What a Berlin Group ASPSP may return from GET /transactions when you set Accept: application/xml. Bal with OPBD is opening booked, CLBD closing booked.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.052.001.08">
  <BkToCstmrAcctRpt>
    <GrpHdr>
      <MsgId>RPT-20260812-0912</MsgId>
      <CreDtTm>2026-08-12T09:30:00</CreDtTm>
    </GrpHdr>
    <Rpt>
      <Id>RPT-ACC-3F9A2B7E-20260812</Id>
      <CreDtTm>2026-08-12T09:30:00</CreDtTm>
      <Acct>
        <Id><IBAN>FR7630006000011234567890189</IBAN></Id>
        <Ccy>EUR</Ccy>
        <Svcr>
          <FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId>
        </Svcr>
      </Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">4820.35</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-12</Dt></Dt>
      </Bal>
      <Ntry>
        <NtryRef>ENT-0000441</NtryRef>
        <Amt Ccy="EUR">1250.00</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><Dt>2026-08-12</Dt></BookgDt>
        <ValDt><Dt>2026-08-13</Dt></ValDt>
        <BkTxCd>
          <Domn>
            <Cd>PMNT</Cd>
            <Fmly>
              <Cd>ICDT</Cd>
              <SubFmlyCd>ESCT</SubFmlyCd>
            </Fmly>
          </Domn>
        </BkTxCd>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>E2E-2026-0842</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr><Pty><Nm>Atelier Rousseau SARL</Nm></Pty></Cdtr>
            </RltdPties>
            <RmtInf><Ustrd>Facture 2026-0842</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Rpt>
  </BkToCstmrAcctRpt>
</Document>`,
  },
  {
    id: 'camt-054-credit',
    label: 'camt.054 credit notification',
    format: 'xml',
    messageShort: 'camt.054',
    description: 'Real-time credit advice on the beneficiary side. This is the trigger a merchant listens for on instant payments.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtNtfctn>
    <GrpHdr>
      <MsgId>NTF-20260813-0601</MsgId>
      <CreDtTm>2026-08-13T06:02:12</CreDtTm>
    </GrpHdr>
    <Ntfctn>
      <Id>NTF-ACC-DE89-20260813-01</Id>
      <CreDtTm>2026-08-13T06:02:12</CreDtTm>
      <Acct>
        <Id><IBAN>DE89370400440532013000</IBAN></Id>
        <Ccy>EUR</Ccy>
      </Acct>
      <Ntry>
        <Amt Ccy="EUR">1250.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><DtTm>2026-08-13T06:02:11</DtTm></BookgDt>
        <BkTxCd>
          <Domn>
            <Cd>PMNT</Cd>
            <Fmly><Cd>RCDT</Cd><SubFmlyCd>ESCT</SubFmlyCd></Fmly>
          </Domn>
        </BkTxCd>
        <NtryDtls>
          <TxDtls>
            <Refs><EndToEndId>E2E-2026-0842</EndToEndId></Refs>
            <RltdPties>
              <Dbtr><Pty><Nm>Marie Lefebvre</Nm></Pty></Dbtr>
            </RltdPties>
            <RmtInf><Ustrd>Facture 2026-0842</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Ntfctn>
  </BkToCstmrDbtCdtNtfctn>
</Document>`,
  },
  {
    id: 'acmt-023-vop',
    label: 'acmt.023 verification request',
    format: 'xml',
    messageShort: 'acmt.023',
    description: 'Verification of Payee. Send the name exactly as the PSU typed it — normalising it here defeats the purpose of the check.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:acmt.023.001.03">
  <IdVrfctnReq>
    <Assgnmt>
      <Id>VOP-20260812-0007</Id>
      <Assgnr>
        <Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt>
      </Assgnr>
      <Assgne>
        <Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt>
      </Assgne>
      <CreDtTm>2026-08-12T09:14:20</CreDtTm>
    </Assgnmt>
    <Vrfctn>
      <Id>VRF-0001</Id>
      <PtyAndAcctId>
        <Pty><Nm>Atelier Rousseau SARL</Nm></Pty>
        <Acct><Id><IBAN>DE89370400440532013000</IBAN></Id></Acct>
      </PtyAndAcctId>
    </Vrfctn>
  </IdVrfctnReq>
</Document>`,
  },
  {
    id: 'acmt-024-vop-report',
    label: 'acmt.024 verification report (close match)',
    format: 'xml',
    messageShort: 'acmt.024',
    description:
      'A close match. Vrfctn=false with UpdtdPtyAndAcctId carrying the correct legal name — show it to the PSU and let them decide, but do not auto-correct.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:acmt.024.001.03">
  <IdVrfctnRpt>
    <Assgnmt>
      <Id>VOPR-20260812-0007</Id>
      <Assgnr>
        <Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt>
      </Assgnr>
      <Assgne>
        <Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt>
      </Assgne>
      <CreDtTm>2026-08-12T09:14:21</CreDtTm>
    </Assgnmt>
    <OrgnlAssgnmt>
      <Id>VOP-20260812-0007</Id>
    </OrgnlAssgnmt>
    <Rpt>
      <OrgnlId>VRF-0001</OrgnlId>
      <Vrfctn>false</Vrfctn>
      <Rsn>
        <Cd>CMTC</Cd>
      </Rsn>
      <OrgnlPtyAndAcctId>
        <Pty><Nm>Atelier Rousseau SARL</Nm></Pty>
        <Acct><Id><IBAN>DE89370400440532013000</IBAN></Id></Acct>
      </OrgnlPtyAndAcctId>
      <UpdtdPtyAndAcctId>
        <Pty><Nm>Atelier Rousseau S.A.R.L.</Nm></Pty>
      </UpdtdPtyAndAcctId>
    </Rpt>
  </IdVrfctnRpt>
</Document>`,
  },
  {
    id: 'pain-001-sic-chf',
    label: 'pain.001 SIC CHF credit transfer',
    format: 'xml',
    messageShort: 'pain.001',
    standardId: 'swiss-sps',
    description:
      'Swiss Payment Standards initiation in CHF. No SEPA service level — this becomes a SIC pacs.008, not STEP2.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pain.001.001.09.ch.03.xsd">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>PAIN1-CH-20260812-001</MsgId>
      <CreDtTm>2026-08-12T10:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>250.00</CtrlSum>
      <InitgPty><Nm>Alpine Tools AG</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-CH-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>false</BtchBookg>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>250.00</CtrlSum>
      <ReqdExctnDt><Dt>2026-08-12</Dt></ReqdExctnDt>
      <Dbtr><Nm>Alpine Tools AG</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>CH9300762011623852957</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></DbtrAgt>
      <ChrgBr>SHAR</ChrgBr>
      <CdtTrfTxInf>
        <PmtId>
          <InstrId>INSTR-CH-0001</InstrId>
          <EndToEndId>E2E-CH-2026-0001</EndToEndId>
        </PmtId>
        <Amt><InstdAmt Ccy="CHF">250.00</InstdAmt></Amt>
        <CdtrAgt><FinInstnId><BICFI>ZKBKCHZZ80A</BICFI></FinInstnId></CdtrAgt>
        <Cdtr><Nm>Lakeside GmbH</Nm></Cdtr>
        <CdtrAcct><Id><IBAN>CH5604835012345678009</IBAN></Id></CdtrAcct>
        <RmtInf><Ustrd>Rechnung 88421</Ustrd></RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
  },
  {
    id: 'pain-002-sic-chf',
    label: 'pain.002 SIC CHF accepted',
    format: 'xml',
    messageShort: 'pain.002',
    standardId: 'swiss-sps',
    description: 'Customer status report ACTC before the instruction hits SIC.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pain.002.001.10.ch.03.xsd">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>PAIN2-CH-20260812-001</MsgId>
      <CreDtTm>2026-08-12T10:00:02</CreDtTm>
      <InitgPty><Nm>UBS Switzerland AG</Nm></InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PAIN1-CH-20260812-001</OrgnlMsgId>
      <OrgnlMsgNmId>pain.001.001.09.ch.03</OrgnlMsgNmId>
      <GrpSts>ACTC</GrpSts>
    </OrgnlGrpInfAndSts>
    <OrgnlPmtInfAndSts>
      <OrgnlPmtInfId>PMTINF-CH-001</OrgnlPmtInfId>
      <PmtInfSts>ACTC</PmtInfSts>
      <TxInfAndSts>
        <OrgnlEndToEndId>E2E-CH-2026-0001</OrgnlEndToEndId>
        <TxSts>ACTC</TxSts>
      </TxInfAndSts>
    </OrgnlPmtInfAndSts>
  </CstmrPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-008-sic-chf',
    label: 'pacs.008 SIC CHF',
    format: 'xml',
    messageShort: 'pacs.008',
    standardId: 'swiss-sps',
    description: 'Interbank CHF credit into SIC. ClrSys identifies the Swiss RTGS, not STEP2.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pacs.008.001.08.ch.02.xsd">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>PACS8-SIC-20260812-001</MsgId>
      <CreDtTm>2026-08-12T10:00:05</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="CHF">250.00</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>SIC</Prtry></ClrSys>
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>ZKBKCHZZ80A</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR-CH-0001</InstrId>
        <EndToEndId>E2E-CH-2026-0001</EndToEndId>
        <TxId>TX-SIC-0000001</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="CHF">250.00</IntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr><Nm>Alpine Tools AG</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>CH9300762011623852957</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>ZKBKCHZZ80A</BICFI></FinInstnId></CdtrAgt>
      <Cdtr><Nm>Lakeside GmbH</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>CH5604835012345678009</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>Rechnung 88421</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
  },
  {
    id: 'pacs-002-sic-chf',
    label: 'pacs.002 SIC receipt',
    format: 'xml',
    messageShort: 'pacs.002',
    standardId: 'swiss-sps',
    description: 'SIC acknowledges receipt (RCVD) to the instructing participant.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pacs.002.001.10.ch.02.xsd">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-SIC-20260812-001</MsgId>
      <CreDtTm>2026-08-12T10:00:06</CreDtTm>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-SIC-20260812-001</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08.ch.02</OrgnlMsgNmId>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <OrgnlEndToEndId>E2E-CH-2026-0001</OrgnlEndToEndId>
      <OrgnlTxId>TX-SIC-0000001</OrgnlTxId>
      <TxSts>RCVD</TxSts>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-008-sic-ip',
    label: 'pacs.008 SIC Instant Payment',
    format: 'xml',
    messageShort: 'pacs.008',
    standardId: 'swiss-sps',
    description: 'CHF instant credit on SIC IP. Same message family as SCT Inst, Swiss instant ClrSys.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pacs.008.001.08.ch.02.xsd">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>PACS8-SIP-20260812-009</MsgId>
      <CreDtTm>2026-08-12T10:15:00.123</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="CHF">42.50</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>SICIP</Prtry></ClrSys>
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>ZKBKCHZZ80A</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-SIP-2026-0042</EndToEndId>
        <TxId>TX-SIP-0000042</TxId>
      </PmtId>
      <PmtTpInf><LclInstrm><Prtry>INST</Prtry></LclInstrm></PmtTpInf>
      <IntrBkSttlmAmt Ccy="CHF">42.50</IntrBkSttlmAmt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr><Nm>Anna Meier</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>CH9300762011623852957</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>ZKBKCHZZ80A</BICFI></FinInstnId></CdtrAgt>
      <Cdtr><Nm>Jonas Keller</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>CH5604835012345678009</IBAN></Id></CdtrAcct>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
  },
  {
    id: 'pacs-002-sic-ip',
    label: 'pacs.002 SIC IP settled',
    format: 'xml',
    messageShort: 'pacs.002',
    standardId: 'swiss-sps',
    description: 'SIC IP ACSC inside the instant window.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pacs.002.001.10.ch.02.xsd">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-SIP-20260812-009</MsgId>
      <CreDtTm>2026-08-12T10:15:01.890</CreDtTm>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-SIP-20260812-009</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08.ch.02</OrgnlMsgNmId>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <OrgnlEndToEndId>E2E-SIP-2026-0042</OrgnlEndToEndId>
      <OrgnlTxId>TX-SIP-0000042</OrgnlTxId>
      <TxSts>ACSC</TxSts>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-008-eurosic',
    label: 'pacs.008 euroSIC EUR',
    format: 'xml',
    messageShort: 'pacs.008',
    standardId: 'swiss-sps',
    description: 'EUR credit via euroSIC for Swiss participants.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="http://www.six-interbank-clearing.com/de/pacs.008.001.08.ch.02.xsd">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>PACS8-ESIC-20260812-003</MsgId>
      <CreDtTm>2026-08-12T11:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="EUR">980.00</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>EUROSIC</Prtry></ClrSys>
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>BNPAFRPPXXX</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-ESIC-2026-0003</EndToEndId>
        <TxId>TX-ESIC-0000003</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="EUR">980.00</IntrBkSttlmAmt>
      <ChrgBr>SHAR</ChrgBr>
      <Dbtr><Nm>Alpine Tools AG</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>CH9300762011623852957</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>UBSWCHZH80A</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>BNPAFRPPXXX</BICFI></FinInstnId></CdtrAgt>
      <Cdtr><Nm>Atelier Rousseau SARL</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></CdtrAcct>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
  },
  {
    id: 'wero-payment-create',
    label: 'Wero payment intent create',
    format: 'json',
    standardId: 'wero',
    description: 'Scheme-level payment intent before bank debit and SCT Inst settlement.',
    content: `{
  "paymentId": "wero_pay_8f3a2c",
  "amount": { "value": "24.90", "currency": "EUR" },
  "payee": { "aliasType": "PHONE", "alias": "+33601020304" },
  "merchant": { "name": "Café Lumière", "merchantId": "mrc_4412" },
  "returnUrl": "https://merchant.example/wero/return",
  "status": "CREATED"
}`,
  },
  {
    id: 'wero-proxy-resolve',
    label: 'Wero proxy resolve',
    format: 'json',
    standardId: 'wero',
    description: 'Alias resolution to an IBAN held by a participating ASPSP.',
    content: `{
  "aliasType": "PHONE",
  "alias": "+33601020304",
  "iban": "FR7630006000011234567890189",
  "bic": "DEMOFRPPXXX",
  "displayName": "Camille Dupont",
  "status": "FOUND"
}`,
  },
  {
    id: 'wero-payment-completed',
    label: 'Wero payment completed',
    format: 'json',
    standardId: 'wero',
    description: 'Terminal scheme status after SCT Inst ACSC. Must not lead the clearing confirmation.',
    content: `{
  "paymentId": "wero_pay_8f3a2c",
  "status": "COMPLETED",
  "settlement": {
    "rail": "SCT_INST",
    "endToEndId": "E2E-2026-0842",
    "txStatus": "ACSC"
  },
  "completedAt": "2026-08-12T09:14:26.410Z"
}`,
  },
  {
    id: 'bg-payment-cancel-request',
    label: 'Berlin Group DELETE payment',
    format: 'json',
    standardId: 'berlin-group',
    description: 'Empty body DELETE; response may be 202 with a cancellation resource or 204.',
    content: `{
  "paymentId": "payment-demo-77412",
  "paymentProduct": "sepa-credit-transfers",
  "method": "DELETE",
  "note": "No request body. Cancellation only while not yet settled."
}`,
  },
  {
    id: 'bg-payment-cancel-status',
    label: 'Berlin Group payment status CANC',
    format: 'json',
    standardId: 'berlin-group',
    description: 'Terminal cancelled status after a successful DELETE.',
    content: `{
  "transactionStatus": "CANC",
  "paymentId": "payment-demo-77412",
  "tppMessages": [
    {
      "category": "INFO",
      "code": "CANCELLATION_DONE",
      "text": "Payment cancelled before settlement"
    }
  ]
}`,
  },
  {
    id: 'camt-055-cancel',
    label: 'camt.055 customer cancellation',
    format: 'xml',
    messageShort: 'camt.055',
    description: 'Customer-bank cancellation of a pain.001 still held by the ASPSP.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.055.001.08">
  <CstmrPmtCxlReq>
    <Assgnmt>
      <Id>CAMT55-20260812-001</Id>
      <Assgnr><Pty><Nm>Marie Lefebvre</Nm></Pty></Assgnr>
      <Assgne><Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt></Assgne>
      <CreDtTm>2026-08-12T09:20:00</CreDtTm>
    </Assgnmt>
    <Undrlyg>
      <OrgnlPmtInfAndCxl>
        <OrgnlPmtInfId>PMTINF-20260812-0842</OrgnlPmtInfId>
        <OrgnlGrpInf>
          <OrgnlMsgId>PAIN1-20260812-0842</OrgnlMsgId>
          <OrgnlMsgNmId>pain.001.001.09</OrgnlMsgNmId>
        </OrgnlGrpInf>
        <TxInf>
          <CxlId>CXL-0001</CxlId>
          <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
          <CxlRsnInf>
            <Rsn><Cd>CUST</Cd></Rsn>
          </CxlRsnInf>
        </TxInf>
      </OrgnlPmtInfAndCxl>
    </Undrlyg>
  </CstmrPmtCxlReq>
</Document>`,
  },
  {
    id: 'bg-instant-payment-request',
    label: 'Berlin Group SCT Inst initiation',
    format: 'json',
    standardId: 'berlin-group',
    description:
      'Same JSON shape as sepa-credit-transfers; the path product instant-sepa-credit-transfers selects SCT Inst processing.',
    content: `{
  "instructedAmount": { "currency": "EUR", "amount": "42.50" },
  "debtorAccount": { "iban": "FR7630006000011234567890189" },
  "creditorAccount": { "iban": "DE89370400440532013000" },
  "creditorName": "Atelier Rousseau SARL",
  "remittanceInformationUnstructured": "Commande express 8842",
  "endToEndIdentification": "E2E-INST-2026-0042"
}`,
  },
  {
    id: 'bg-instant-payment-status-acsc',
    label: 'Berlin Group SCT Inst status ACSC',
    format: 'json',
    standardId: 'berlin-group',
    description: 'Terminal success after pacs.002 ACSC. IPR expects the payer to be notified of this outcome.',
    content: `{
  "transactionStatus": "ACSC",
  "paymentId": "inst-pay-0042",
  "fundsAvailable": true
}`,
  },
  {
    id: 'bg-instant-payment-status-rjct',
    label: 'Berlin Group SCT Inst status RJCT',
    format: 'json',
    standardId: 'berlin-group',
    description: 'Instant reject surfaced to the TPP. Prefer mapping ISO reason codes when the ASPSP provides them.',
    content: `{
  "transactionStatus": "RJCT",
  "paymentId": "inst-pay-0042",
  "tppMessages": [
    {
      "category": "ERROR",
      "code": "PAYMENT_FAILED",
      "text": "Creditor agent not reachable for SCT Inst (AB05)"
    }
  ]
}`,
  },
  {
    id: 'bg-instant-payment-status-pdng',
    label: 'Berlin Group SCT Inst status PDNG',
    format: 'json',
    standardId: 'berlin-group',
    description: 'Ambiguous instant state during timeout investigation — never treat as failure or retry initiation.',
    content: `{
  "transactionStatus": "PDNG",
  "paymentId": "inst-pay-0042"
}`,
  },
  {
    id: 'pacs-008-sct-inst',
    label: 'pacs.008 SCT Inst (TIPS)',
    format: 'xml',
    messageShort: 'pacs.008',
    standardId: 'sct-inst',
    description:
      'Interbank instant credit transfer. LclInstrm=INST and ClrSys for TIPS (or RT1). Settlement amount equals instructed amount.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>PACS8-INST-20260812-0042</MsgId>
      <CreDtTm>2026-08-12T14:22:01.120</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="EUR">42.50</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Cd>TIPS</Cd></ClrSys>
      </SttlmInf>
      <InstgAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR-INST-0042</InstrId>
        <EndToEndId>E2E-INST-2026-0042</EndToEndId>
        <TxId>TX-INST-00000042</TxId>
      </PmtId>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>INST</Cd></LclInstrm>
      </PmtTpInf>
      <IntrBkSttlmAmt Ccy="EUR">42.50</IntrBkSttlmAmt>
      <AccptncDtTm>2026-08-12T14:22:01.120</AccptncDtTm>
      <ChrgBr>SLEV</ChrgBr>
      <Dbtr><Nm>Marie Lefebvre</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></CdtrAgt>
      <Cdtr><Nm>Atelier Rousseau SARL</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>DE89370400440532013000</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>Commande express 8842</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
  },
  {
    id: 'pacs-002-sct-inst',
    label: 'pacs.002 SCT Inst ACSC ack',
    format: 'xml',
    messageShort: 'pacs.002',
    standardId: 'sct-inst',
    description: 'Positive instant acknowledgement — funds made available inside the SLA.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-INST-20260812-0042</MsgId>
      <CreDtTm>2026-08-12T14:22:03.890</CreDtTm>
      <InstgAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-INST-20260812-0042</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
      <OrgnlCreDtTm>2026-08-12T14:22:01.120</OrgnlCreDtTm>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <OrgnlEndToEndId>E2E-INST-2026-0042</OrgnlEndToEndId>
      <OrgnlTxId>TX-INST-00000042</OrgnlTxId>
      <TxSts>ACSC</TxSts>
      <AccptncDtTm>2026-08-12T14:22:03.850</AccptncDtTm>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-002-sct-inst-reject',
    label: 'pacs.002 SCT Inst RJCT (AB05)',
    format: 'xml',
    messageShort: 'pacs.002',
    standardId: 'sct-inst',
    description: 'Negative instant confirmation — creditor agent not reachable for SCT Inst.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>PACS2-INST-20260812-0099</MsgId>
      <CreDtTm>2026-08-12T14:22:04.010</CreDtTm>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PACS8-INST-20260812-0042</OrgnlMsgId>
      <OrgnlMsgNmId>pacs.008.001.08</OrgnlMsgNmId>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <OrgnlEndToEndId>E2E-INST-2026-0042</OrgnlEndToEndId>
      <OrgnlTxId>TX-INST-00000042</OrgnlTxId>
      <TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Rsn><Cd>AB05</Cd></Rsn>
        <AddtlInf>Creditor PSP not reachable for SCT Inst</AddtlInf>
      </StsRsnInf>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`,
  },
  {
    id: 'pacs-028-sct-inst',
    label: 'pacs.028 SCT Inst status request',
    format: 'xml',
    messageShort: 'pacs.028',
    standardId: 'sct-inst',
    description: 'Investigation after missing pacs.002 inside the instant window.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.028.001.04">
  <FIToFIPmtStsReq>
    <GrpHdr>
      <MsgId>PACS28-INST-20260812-0042</MsgId>
      <CreDtTm>2026-08-12T14:22:12.000</CreDtTm>
      <InstgAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></InstdAgt>
    </GrpHdr>
    <TxInf>
      <OrgnlEndToEndId>E2E-INST-2026-0042</OrgnlEndToEndId>
      <OrgnlTxId>TX-INST-00000042</OrgnlTxId>
      <OrgnlTxRef>
        <IntrBkSttlmAmt Ccy="EUR">42.50</IntrBkSttlmAmt>
        <IntrBkSttlmDt>2026-08-12</IntrBkSttlmDt>
      </OrgnlTxRef>
    </TxInf>
  </FIToFIPmtStsReq>
</Document>`,
  },

  {
    id: 'pain-008-sdd',
    label: 'pain.008 SEPA direct debit',
    format: 'xml',
    messageShort: 'pain.008',
    description: 'SDD Core collection with mandate id and sequence type. Creditor initiates; debtor account is debited.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.08">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>PAIN8-20260812-001</MsgId>
      <CreDtTm>2026-08-12T08:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>59.90</CtrlSum>
      <InitgPty><Nm>Atelier Rousseau SARL</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-SDD-001</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>59.90</CtrlSum>
      <ReqdColltnDt>2026-08-15</ReqdColltnDt>
      <Cdtr><Nm>Atelier Rousseau SARL</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></CdtrAcct>
      <CdtrAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></CdtrAgt>
      <CdtrSchmeId><Id><PrvtId><Othr><Id>FR12ZZZ123456</Id><SchmeNm><Prtry>SEPA</Prtry></SchmeNm></Othr></PrvtId></Id></CdtrSchmeId>
      <DrctDbtTxInf>
        <PmtId><EndToEndId>E2E-SDD-2026-0001</EndToEndId></PmtId>
        <InstdAmt Ccy="EUR">59.90</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>MND-8842</MndtId>
            <DtOfSgntr>2024-03-01</DtOfSgntr>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></DbtrAgt>
        <Dbtr><Nm>Marie Lefebvre</Nm></Dbtr>
        <DbtrAcct><Id><IBAN>DE89370400440532013000</IBAN></Id></DbtrAcct>
      </DrctDbtTxInf>
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`,
  },
  {
    id: 'pain-013-rtp',
    label: 'pain.013 request to pay',
    format: 'xml',
    messageShort: 'pain.013',
    description: 'Creditor payment activation request — the ISO shape behind Request-to-Pay.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.013.001.09">
  <CdtrPmtActvtnReq>
    <GrpHdr>
      <MsgId>PAIN13-20260812-001</MsgId>
      <CreDtTm>2026-08-12T09:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <InitgPty><Nm>Atelier Rousseau SARL</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-RTP-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt><Dt>2026-08-12</Dt></ReqdExctnDt>
      <Dbtr><Nm>Marie Lefebvre</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></DbtrAgt>
      <CdtTrfTx>
        <PmtId><EndToEndId>E2E-RTP-2026-0001</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="EUR">125.00</InstdAmt></Amt>
        <Cdtr><Nm>Atelier Rousseau SARL</Nm></Cdtr>
        <CdtrAcct><Id><IBAN>DE89370400440532013000</IBAN></Id></CdtrAcct>
        <RmtInf><Ustrd>Facture RTP 2026-12</Ustrd></RmtInf>
      </CdtTrfTx>
    </PmtInf>
  </CdtrPmtActvtnReq>
</Document>`,
  },
  {
    id: 'pain-014-rtp-status',
    label: 'pain.014 RTP status report',
    format: 'xml',
    messageShort: 'pain.014',
    description: 'Status answer to a pain.013 — here accepted (ACTC).',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.014.001.09">
  <CdtrPmtActvtnReqStsRpt>
    <GrpHdr>
      <MsgId>PAIN14-20260812-001</MsgId>
      <CreDtTm>2026-08-12T09:01:00</CreDtTm>
      <InitgPty><Nm>Banque de Démonstration</Nm></InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>PAIN13-20260812-001</OrgnlMsgId>
      <OrgnlMsgNmId>pain.013.001.09</OrgnlMsgNmId>
      <GrpSts>ACTC</GrpSts>
    </OrgnlGrpInfAndSts>
  </CdtrPmtActvtnReqStsRpt>
</Document>`,
  },
  {
    id: 'pacs-009-fi-credit',
    label: 'pacs.009 FI credit transfer',
    format: 'xml',
    messageShort: 'pacs.009',
    description: 'Bank-to-bank credit — cover or liquidity, not a customer payment.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.09">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>PACS9-20260812-001</MsgId>
      <CreDtTm>2026-08-12T10:00:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>INDA</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <TxId>TX-FI-0000001</TxId>
        <EndToEndId>E2E-FI-2026-0001</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="EUR">1000000.00</IntrBkSttlmAmt>
      <DbtrAgt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></CdtrAgt>
      <Dbtr><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Dbtr>
      <Cdtr><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Cdtr>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`,
  },
  {
    id: 'camt-053-statement',
    label: 'camt.053 end-of-day statement',
    format: 'xml',
    messageShort: 'camt.053',
    description: 'Bank-to-customer statement with closing booked balance.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>CAMT53-20260812-001</MsgId>
      <CreDtTm>2026-08-12T23:05:00</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-20260812</Id>
      <CreDtTm>2026-08-12T23:05:00</CreDtTm>
      <Acct><Id><IBAN>FR7630006000011234567890189</IBAN></Id></Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">4820.15</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-12</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">42.50</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><Dt>2026-08-12</Dt></BookgDt>
        <NtryDtls><TxDtls><Refs><EndToEndId>E2E-INST-2026-0042</EndToEndId></Refs></TxDtls></NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`,
  },
  {
    id: 'camt-026-unable-to-apply',
    label: 'camt.026 unable to apply',
    format: 'xml',
    messageShort: 'camt.026',
    description: 'Investigation: payment received but cannot be applied — missing remittance.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.026.001.10">
  <UblToApply>
    <Assgnmt>
      <Id>CAMT26-20260812-001</Id>
      <Assgnr><Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt></Assgnr>
      <Assgne><Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt></Assgne>
      <CreDtTm>2026-08-12T11:00:00</CreDtTm>
    </Assgnmt>
    <Case>
      <Id>CASE-UNABLE-0001</Id>
      <Cretr><Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt></Cretr>
    </Case>
    <Undrlyg>
      <IntrBk>
        <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
        <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
      </IntrBk>
    </Undrlyg>
  </UblToApply>
</Document>`,
  },
  {
    id: 'camt-087-modify',
    label: 'camt.087 request to modify payment',
    format: 'xml',
    messageShort: 'camt.087',
    description: 'Ask to correct a field (e.g. creditor name) instead of returning the payment.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.087.001.09">
  <ReqToModfyPmt>
    <Assgnmt>
      <Id>CAMT87-20260812-001</Id>
      <Assgnr><Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt></Assgnr>
      <Assgne><Agt><FinInstnId><BICFI>COBADEFFXXX</BICFI></FinInstnId></Agt></Assgne>
      <CreDtTm>2026-08-12T11:30:00</CreDtTm>
    </Assgnmt>
    <Case>
      <Id>CASE-MOD-0001</Id>
      <Cretr><Agt><FinInstnId><BICFI>DEMOFRPPXXX</BICFI></FinInstnId></Agt></Cretr>
    </Case>
    <Undrlyg>
      <IntrBk>
        <OrgnlEndToEndId>E2E-2026-0842</OrgnlEndToEndId>
        <OrgnlTxId>TX-DEMO-0000771412</OrgnlTxId>
      </IntrBk>
    </Undrlyg>
  </ReqToModfyPmt>
</Document>`,
  },
];

function jsonCompanion(sample: Sample): Sample | null {
  if (sample.format !== 'xml' || !sample.messageShort) return null;
  try {
    return {
      id: `${sample.id}-json`,
      label: `${sample.label} (JSON)`,
      format: 'json',
      messageShort: sample.messageShort,
      standardId: sample.standardId,
      description: `JSON representation of ${sample.messageShort}. Same business data as XML sample \`${sample.id}\`.`,
      content: xmlToJsonString(sample.content),
    };
  } catch {
    return null;
  }
}

/** Hand-authored samples plus JSON companions for every ISO XML payload. */
export const ALL_SAMPLES: Sample[] = [
  ...SAMPLES,
  ...SAMPLES.map(jsonCompanion).filter((s): s is Sample => s !== null),
];

export const sampleById = (id: string) => ALL_SAMPLES.find((s) => s.id === id);

export const samplesForMessage = (short: string) =>
  ALL_SAMPLES.filter((s) => s.messageShort === short).sort((a, b) => {
    if (a.format === b.format) return a.label.localeCompare(b.label);
    return a.format === 'xml' ? -1 : 1;
  });

export const samplesForStandard = (id: string) =>
  ALL_SAMPLES.filter((s) => s.standardId === id && !s.id.endsWith('-json'));
