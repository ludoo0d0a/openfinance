import { describe, expect, it } from 'vitest';
import { parseXml, collectPaths, collectLeaves, searchNodes, xmlSelector } from '../src/lib/xml';
import { SAMPLES } from '../src/data/samples';
import { ISO_MESSAGES, versionsFor } from '../src/data/iso20022';
import { canonicalId } from '../src/lib/messageId';

const pacs008 = SAMPLES.find((s) => s.id === 'pacs-008-sct')!;

describe('parseXml', () => {
  it('reads the message id out of the root namespace', () => {
    const parsed = parseXml(pacs008.content);
    expect(parsed.wellFormed).toBe(true);
    expect(parsed.messageId).toBe('pacs.008.001.08');
    expect(parsed.root?.name).toBe('Document');
  });

  it('reports malformed documents instead of throwing', () => {
    const parsed = parseXml('<Document><GrpHdr></Document>');
    expect(parsed.wellFormed).toBe(false);
    expect(parsed.error).toBeTruthy();
  });

  it('keeps attributes such as the currency on an amount', () => {
    const parsed = parseXml(pacs008.content);
    const hits = searchNodes(parsed.root, 'IntrBkSttlmAmt');
    const amount = hits.find((n) => n.attributes.Ccy === 'EUR');
    expect(amount?.text).toBe('1250.00');
  });

  it('collects paths relative to the message root, not to <Document>', () => {
    const paths = collectPaths(parseXml(pacs008.content).root);
    expect(paths.has('FIToFICstmrCdtTrf/GrpHdr/MsgId')).toBe(true);
    expect(paths.has('Document/FIToFICstmrCdtTrf')).toBe(false);
  });

  it('builds Document-relative selectors for leaves and attributes', () => {
    const parsed = parseXml(pacs008.content);
    const amount = searchNodes(parsed.root, 'IntrBkSttlmAmt').find((n) => n.name === 'IntrBkSttlmAmt');
    expect(amount).toBeTruthy();
    expect(xmlSelector(amount!)).toBe('FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt');
    expect(xmlSelector(amount!, 'Ccy')).toBe('FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt@Ccy');
    const leaves = collectLeaves(parsed.root);
    expect(leaves.some((l) => l.selector === 'Document@xmlns')).toBe(true);
    expect(leaves.some((l) => l.selector.endsWith('EndToEndId'))).toBe(true);
  });
});

describe('bundled XML samples', () => {
  it.each(SAMPLES.filter((s) => s.format === 'xml'))('$id is well-formed', (sample) => {
    expect(parseXml(sample.content).wellFormed).toBe(true);
  });

  it.each(SAMPLES.filter((s) => s.format === 'xml'))('$id declares the namespace its message expects', (sample) => {
    const parsed = parseXml(sample.content);
    const message = ISO_MESSAGES.find((m) => m.short === sample.messageShort);
    expect(message, `no catalog entry for ${sample.messageShort}`).toBeDefined();
    expect(parsed.messageId).toBeDefined();
    const knownIds = versionsFor(message!).map((v) => canonicalId(v.id));
    expect(knownIds, `${sample.id} xmlns ${parsed.messageId}`).toContain(parsed.messageId);
    expect(parsed.root?.children[0]?.name).toBe(message!.rootElement);
  });

  it.each(SAMPLES.filter((s) => s.format === 'xml'))('$id satisfies its own required paths', (sample) => {
    const parsed = parseXml(sample.content);
    const message = ISO_MESSAGES.find((m) => m.short === sample.messageShort)!;
    const present = collectPaths(parsed.root);
    const missing = message.requiredPaths.filter(
      (required) => ![...present].some((p) => p === required || p.startsWith(`${required}/`) || p.endsWith(required)),
    );
    expect(missing, `missing in ${sample.id}`).toEqual([]);
  });
});

describe('bundled JSON samples', () => {
  it.each(SAMPLES.filter((s) => s.format === 'json'))('$id parses', (sample) => {
    expect(() => JSON.parse(sample.content)).not.toThrow();
  });
});
