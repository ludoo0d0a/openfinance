import { describe, expect, it } from 'vitest';
import { THESAURUS, codeByValue, localizeThesaurusEntry, thesaurusById } from '../src/data/thesaurus';
import { createIndex } from '../src/lib/search';

describe('thesaurus', () => {
  it('includes Verification of Payee with French copy', () => {
    const vop = thesaurusById('vop');
    expect(vop).toBeDefined();
    expect(vop!.term).toBe('VoP');
    expect(vop!.name.en).toMatch(/Verification of Payee/i);
    expect(vop!.name.fr).toMatch(/Vérification du bénéficiaire/i);
    expect(vop!.definition.fr.length).toBeGreaterThan(40);

    const fr = localizeThesaurusEntry(vop!, 'fr');
    expect(fr.displayName).toBe(vop!.name.fr);
    expect(fr.displayDefinition).toBe(vop!.definition.fr);
  });

  it('every entry has EN and FR name + definition', () => {
    for (const e of THESAURUS) {
      expect(e.name.en.length, e.id).toBeGreaterThan(0);
      expect(e.name.fr.length, e.id).toBeGreaterThan(0);
      expect(e.definition.en.length, e.id).toBeGreaterThan(10);
      expect(e.definition.fr.length, e.id).toBeGreaterThan(10);
    }
  });

  it('merges the code registry, keeping bilingual VoP outcomes', () => {
    const mtch = codeByValue('MTCH');
    expect(mtch).toBeDefined();
    expect(mtch!.category).toBe('code');
    expect(mtch!.family).toBe('iso-status-reason');
    expect(mtch!.severity).toBe('success');
    expect(mtch!.action).toMatch(/Proceed/i);
    expect(mtch!.name.fr).toMatch(/Correspondance/i);
    expect(mtch!.definition.fr.length).toBeGreaterThan(40);

    const ac01 = codeByValue('AC01');
    expect(ac01?.term).toBe('AC01');
    expect(ac01?.action).toMatch(/Data fix/i);
  });

  it('search finds VoP as a thesaurus term', () => {
    const hits = createIndex().search('VoP');
    expect(hits.some((h) => String(h.id) === 'term:vop')).toBe(true);
  });

  it('search finds Instant Payment, Wero and Payconiq', () => {
    const index = createIndex();
    expect(index.search('Instant Payment').some((h) => String(h.id) === 'term:ip')).toBe(true);
    expect(index.search('Wero').some((h) => String(h.id) === 'term:wero')).toBe(true);
    expect(index.search('Payconiq').some((h) => String(h.id) === 'term:payconiq')).toBe(true);
  });
});
