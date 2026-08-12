import { describe, expect, it } from 'vitest';
import { jsonToXml, tryJsonToXml, tryXmlToJsonString, xmlToJson, xmlToJsonString } from '../src/lib/isoCodec';
import { SAMPLES } from '../src/data/samples';

const pacs008 = SAMPLES.find((s) => s.id === 'pacs-008-sct')!;

describe('isoCodec', () => {
  it('converts XML to a Document-shaped JSON object', () => {
    const obj = xmlToJson(pacs008.content) as { Document?: Record<string, unknown> };
    expect(obj.Document).toBeDefined();
    const json = xmlToJsonString(pacs008.content);
    expect(json).toContain('"Document"');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips XML → JSON → XML with the same business identifiers', () => {
    const json = xmlToJsonString(pacs008.content);
    const xml = jsonToXml(json);
    expect(xml).toContain('FIToFICstmrCdtTrf');
    expect(xml).toContain('MsgId');
    const back = tryXmlToJsonString(xml);
    expect(back.ok).toBe(true);
  });

  it('try helpers surface parse errors', () => {
    expect(tryJsonToXml('{').ok).toBe(false);
    expect(tryJsonToXml('not-json').ok).toBe(false);
  });

  it('converts every hand-authored ISO XML sample to JSON', () => {
    for (const sample of SAMPLES.filter((s) => s.format === 'xml' && s.messageShort)) {
      const result = tryXmlToJsonString(sample.content);
      expect(result.ok, sample.id).toBe(true);
      if (result.ok) {
        expect(() => JSON.parse(result.json)).not.toThrow();
      }
    }
  });
});
