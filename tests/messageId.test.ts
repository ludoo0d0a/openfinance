import { describe, expect, it } from 'vitest';
import { parseMessageId, namespaceFor, messageIdFromNamespace, messageIdFromPayload } from '../src/lib/messageId';

describe('parseMessageId', () => {
  it('splits a fully versioned id into four segments', () => {
    const parts = parseMessageId('pacs.008.001.08');
    expect(parts).toMatchObject({
      area: 'pacs',
      identifier: '008',
      variant: '001',
      version: '08',
      valid: true,
      short: 'pacs.008',
    });
  });

  it('accepts the short form without variant or version', () => {
    const parts = parseMessageId('camt.053');
    expect(parts.valid).toBe(true);
    expect(parts.variant).toBe('');
    expect(parts.short).toBe('camt.053');
  });

  it('rejects malformed ids rather than guessing', () => {
    for (const bad of ['pacs.8.1.8', 'pacs008001', 'pacs.008.001.8', '', 'Document']) {
      expect(parseMessageId(bad).valid, bad).toBe(false);
    }
  });

  it('round-trips through the namespace', () => {
    const ns = namespaceFor('pain.001.001.09');
    expect(ns).toBe('urn:iso:std:iso:20022:tech:xsd:pain.001.001.09');
    expect(messageIdFromNamespace(ns)).toBe('pain.001.001.09');
  });

  it('returns null for a namespace that is not ISO 20022', () => {
    expect(messageIdFromNamespace('http://example.com/schema')).toBeNull();
  });

  it('extracts a versioned id from a sample payload', () => {
    const xml = `<?xml version="1.0"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10"><FIToFICstmrCdtTrf/></Document>`;
    expect(messageIdFromPayload(xml)).toBe('pacs.008.001.10');
  });
});
