import { describe, expect, it } from 'vitest';
import { messageByShort, versionById, versionsFor } from '../src/data/iso20022';
import { createIndex } from '../src/lib/search';

describe('message versions', () => {
  it('lists pacs.008 declinations including Swiss CH and CBPR+ revisions', () => {
    const msg = messageByShort('pacs.008');
    expect(msg).toBeDefined();
    const versions = versionsFor(msg!);
    expect(versions.map((v) => v.id)).toEqual([
      'pacs.008.001.08',
      'pacs.008.001.08.ch.02',
      'pacs.008.001.10',
      'pacs.008.001.13',
    ]);
    expect(versions.find((v) => v.id === 'pacs.008.001.08')?.markets).toContain('sepa-sct-inst');
    expect(versions.find((v) => v.id === 'pacs.008.001.08.ch.02')?.markets).toContain('sic');
    expect(versions.find((v) => v.id === 'pacs.008.001.10')?.markets).toContain('cbpr-plus');
    expect(versions.every((v) => v.notes.en.length > 20 && v.notes.fr.length > 20)).toBe(true);
  });

  it('lists pain.001 Swiss SPS and German DK flavours', () => {
    const msg = messageByShort('pain.001');
    expect(msg).toBeDefined();
    const ids = versionsFor(msg!).map((v) => v.id);
    expect(ids).toContain('pain.001.001.09.ch.03');
    expect(ids).toContain('pain.001.003.03');
    expect(versionById(msg!, 'pain001.01.09.ch.03')?.id).toBe('pain.001.001.09.ch.03');
  });

  it('falls back to a single synthetic version when none are listed', () => {
    const msg = messageByShort('camt.053');
    expect(msg?.versions).toBeUndefined();
    const versions = versionsFor(msg!);
    expect(versions).toHaveLength(1);
    expect(versions[0].id).toBe(msg!.id);
    expect(versions[0].status).toBe('current');
  });

  it('indexes CBPR+ and country usage-guideline ids for search', () => {
    const index = createIndex();
    expect(index.search('pacs.008.001.13').some((h) => String(h.id) === 'message:pacs.008')).toBe(true);
    expect(index.search('pacs.008.001.08.ch.02').some((h) => String(h.id) === 'message:pacs.008')).toBe(true);
    expect(index.search('pacs008.01.08.ch.02').some((h) => String(h.id) === 'message:pacs.008')).toBe(true);
    expect(index.search('pain.001.003.03').some((h) => String(h.id) === 'message:pain.001')).toBe(true);
  });
});
