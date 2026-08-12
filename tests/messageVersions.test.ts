import { describe, expect, it } from 'vitest';
import { messageByShort, versionsFor } from '../src/data/iso20022';
import { createIndex } from '../src/lib/search';

describe('message versions', () => {
  it('lists pacs.008 declinations including CBPR+ revisions', () => {
    const msg = messageByShort('pacs.008');
    expect(msg).toBeDefined();
    const versions = versionsFor(msg!);
    expect(versions.map((v) => v.id)).toEqual([
      'pacs.008.001.08',
      'pacs.008.001.10',
      'pacs.008.001.13',
    ]);
    expect(versions.find((v) => v.id === 'pacs.008.001.08')?.markets).toContain('sepa-sct-inst');
    expect(versions.find((v) => v.id === 'pacs.008.001.10')?.markets).toContain('cbpr-plus');
    expect(versions.every((v) => v.notes.en.length > 20 && v.notes.fr.length > 20)).toBe(true);
  });

  it('falls back to a single synthetic version when none are listed', () => {
    const msg = messageByShort('camt.053');
    expect(msg?.versions).toBeUndefined();
    const versions = versionsFor(msg!);
    expect(versions).toHaveLength(1);
    expect(versions[0].id).toBe(msg!.id);
    expect(versions[0].status).toBe('current');
  });

  it('indexes CBPR+ version ids for search', () => {
    const hits = createIndex().search('pacs.008.001.13');
    expect(hits.some((h) => String(h.id) === 'message:pacs.008')).toBe(true);
  });
});
