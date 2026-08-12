import { describe, expect, it } from 'vitest';
import { DEFAULT_PACS_INPUT, buildPacs002, buildPacs008 } from '../src/lib/pacsBuilder';
import { parseXml, collectPaths } from '../src/lib/xml';

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
  });
});
