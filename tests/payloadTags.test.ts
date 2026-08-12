import { describe, expect, it } from 'vitest';
import { extractJsonTags, extractXmlTags, looksLikeIsoTag } from '../src/lib/payloadTags';
import { createIndex } from '../src/lib/search';
import { SAMPLES } from '../src/data/samples';
import { xmlToJsonString } from '../src/lib/isoCodec';

const pacs008 = SAMPLES.find((s) => s.id === 'pacs-008-sct')!;

describe('payloadTags', () => {
  it('extracts DbtrAgt from XML', () => {
    const tags = extractXmlTags(pacs008.content);
    expect(tags).toContain('DbtrAgt');
    expect(tags).toContain('CdtrAgt');
    expect(tags).toContain('Document');
  });

  it('extracts the same tags from JSON', () => {
    const json = xmlToJsonString(pacs008.content);
    const tags = extractJsonTags(json);
    expect(tags).toContain('DbtrAgt');
    expect(tags).toContain('CdtTrfTxInf');
  });

  it('recognises ISO-looking tag queries', () => {
    expect(looksLikeIsoTag('DbtrAgt')).toBe(true);
    expect(looksLikeIsoTag('TxSts')).toBe(true);
    expect(looksLikeIsoTag('pacs.008')).toBe(false);
    expect(looksLikeIsoTag('consent')).toBe(false);
  });
});

describe('search by ISO tag', () => {
  const index = createIndex();

  it('finds samples containing DbtrAgt', () => {
    const hits = index.search('DbtrAgt');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => String(h.id).startsWith('sample:'))).toBe(true);
  });

  it('finds messages that declare the path', () => {
    const hits = index.search('DbtrAgt');
    expect(hits.some((h) => String(h.id).startsWith('message:'))).toBe(true);
  });
});
