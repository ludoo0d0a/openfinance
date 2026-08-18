import { describe, expect, it } from 'vitest';
import {
  jsonToXml,
  needsXmlRoot,
  tryJsonToXml,
  tryXmlToJsonString,
  tryXmlToSourceJson,
  xmlToJson,
  xmlToJsonString,
} from '../src/lib/isoCodec';
import { parseXml } from '../src/lib/xml';
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

  it('wraps multi-key API JSON so the XML is well-formed', () => {
    const api = SAMPLES.find((s) => s.id === 'bg-funds-confirmation')!;
    const original = JSON.parse(api.content) as unknown;
    expect(needsXmlRoot(original)).toBe(true);

    const xml = jsonToXml(api.content);
    expect(xml).toContain('<payload>');
    expect(parseXml(xml).wellFormed).toBe(true);

    const back = tryXmlToSourceJson(xml, api.content);
    expect(back.ok).toBe(true);
    if (back.ok) {
      expect(JSON.parse(back.json)).toEqual(original);
    }
  });

  it('does not wrap ISO Document JSON in <payload>', () => {
    const json = xmlToJsonString(pacs008.content);
    const obj = JSON.parse(json) as unknown;
    expect(needsXmlRoot(obj)).toBe(false);
    const xml = jsonToXml(json);
    expect(xml).not.toContain('<payload>');
    expect(xml).toContain('<Document');
    expect(parseXml(xml).wellFormed).toBe(true);
  });

  it('converts every hand-authored API JSON sample to well-formed XML', () => {
    for (const sample of SAMPLES.filter((s) => s.format === 'json' && !s.messageShort)) {
      const result = tryJsonToXml(sample.content);
      expect(result.ok, sample.id).toBe(true);
      if (result.ok) {
        expect(parseXml(result.xml).wellFormed, sample.id).toBe(true);
      }
    }
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
