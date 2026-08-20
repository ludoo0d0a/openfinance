import { describe, expect, it } from 'vitest';
import { DEFAULT_PACS_INPUT, buildPacs002, buildPacs008 } from '../src/lib/pacsBuilder';
import { parseXml, collectLeaves, collectPaths } from '../src/lib/xml';
import { EXPERT_SECTIONS, PACS_FIELDS, resolveXmlClick } from '../src/lib/pacsFields';

describe('pacsBuilder', () => {
  it('builds a well-formed pacs.008 with required paths', () => {
    const xml = buildPacs008(DEFAULT_PACS_INPUT);
    const parsed = parseXml(xml);
    expect(parsed.wellFormed).toBe(true);
    expect(parsed.messageId).toBe('pacs.008.001.08');
    const paths = collectPaths(parsed.root);
    expect([...paths].some((p) => p.includes('EndToEndId'))).toBe(true);
    expect([...paths].some((p) => p.includes('IntrBkSttlmAmt'))).toBe(true);
    expect(xml).toContain('LclInstrm');
    expect(xml).toContain(DEFAULT_PACS_INPUT.endToEndId);
  });

  it('builds a matching pacs.002 ACSC that quotes the original ids', () => {
    const xml = buildPacs002(DEFAULT_PACS_INPUT, 'ACSC');
    const parsed = parseXml(xml);
    expect(parsed.wellFormed).toBe(true);
    expect(parsed.messageId).toBe('pacs.002.001.10');
    expect(xml).toContain('<TxSts>ACSC</TxSts>');
    expect(xml).toContain(DEFAULT_PACS_INPUT.endToEndId);
    expect(xml).toContain(DEFAULT_PACS_INPUT.msgId);
  });

  it('builds a pacs.002 RJCT with a reason code', () => {
    const xml = buildPacs002(DEFAULT_PACS_INPUT, 'RJCT', 'AC01');
    expect(xml).toContain('<TxSts>RJCT</TxSts>');
    expect(xml).toContain('<Cd>AC01</Cd>');
    expect(xml).toContain(DEFAULT_PACS_INPUT.addtlInf);
  });

  it('emits expert-only leaves from the form', () => {
    const xml = buildPacs008({
      ...DEFAULT_PACS_INPUT,
      nbOfTxs: '2',
      sttlmMtd: 'INDA',
      chrgBr: 'DEBT',
      svcLvl: 'NURG',
      lclInstrm: '',
    });
    expect(xml).toContain('<NbOfTxs>2</NbOfTxs>');
    expect(xml).toContain('<SttlmMtd>INDA</SttlmMtd>');
    expect(xml).toContain('<ChrgBr>DEBT</ChrgBr>');
    expect(xml).toContain('<Cd>NURG</Cd>');
    expect(xml).not.toContain('LclInstrm');
  });
});

describe('pacs field mapping', () => {
  it('maps every pacs.008 leaf to a form field in expert mode', () => {
    const parsed = parseXml(buildPacs008(DEFAULT_PACS_INPUT));
    const unmapped = collectLeaves(parsed.root).filter((leaf) => !resolveXmlClick(leaf.selector, true));
    expect(unmapped).toEqual([]);
  });

  it('maps EndToEndId clicks to the same field from both messages', () => {
    const from008 = resolveXmlClick('FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId', false);
    const from002 = resolveXmlClick('FIToFIPmtStsRpt/TxInfAndSts/OrgnlEndToEndId', false);
    expect(from008?.field.key).toBe('endToEndId');
    expect(from002?.field.key).toBe('endToEndId');
  });

  it('opens expert mode when clicking a leaf with no simple alias', () => {
    const hit = resolveXmlClick('FIToFICstmrCdtTrf/GrpHdr/NbOfTxs', false);
    expect(hit?.field.key).toBe('nbOfTxs');
    expect(hit?.enableExpert).toBe(true);
  });

  it('keeps simple mode when clicking a mirrored expert leaf', () => {
    const hit = resolveXmlClick('FIToFICstmrCdtTrf/GrpHdr/TtlIntrBkSttlmAmt', false);
    expect(hit?.field.key).toBe('amount');
    expect(hit?.enableExpert).toBe(false);
  });

  it('covers every catalog field in expert sections', () => {
    const keys = new Set(EXPERT_SECTIONS.flatMap((s) => s.keys));
    const missing = PACS_FIELDS.map((f) => f.key).filter((k) => !keys.has(k));
    expect(missing).toEqual([]);
  });

  it('prefers LclInstrm over the instant checkbox in expert mode', () => {
    const hit = resolveXmlClick('FIToFICstmrCdtTrf/CdtTrfTxInf/PmtTpInf/LclInstrm/Cd', true);
    expect(hit?.field.key).toBe('lclInstrm');
  });
});
