import { describe, expect, it } from 'vitest';
import {
  GLOSSARY,
  GLOSSARY_SOURCES,
  codeByValue,
  glossaryById,
  localizeGlossaryEntry,
} from '../src/data/glossary';
import { ISO_MESSAGES } from '../src/data/iso20022';
import { createIndex } from '../src/lib/search';

describe('glossary', () => {
  it('includes Verification of Payee with French copy', () => {
    const vop = glossaryById('vop');
    expect(vop).toBeDefined();
    expect(vop!.term).toBe('VoP');
    expect(vop!.name.en).toMatch(/Verification of Payee/i);
    expect(vop!.name.fr).toMatch(/Vérification du bénéficiaire/i);
    expect(vop!.definition.fr.length).toBeGreaterThan(40);

    const fr = localizeGlossaryEntry(vop!, 'fr');
    expect(fr.displayName).toBe(vop!.name.fr);
    expect(fr.displayDefinition).toBe(vop!.definition.fr);
  });

  it('covers core payments acronyms', () => {
    for (const id of ['sct', 'sepa', 'stet', 'tips', 'piis', 'a2a', 'sct-inst', 'ais', 'pis', 'xs2a']) {
      expect(glossaryById(id), id).toBeDefined();
    }
  });

  it('includes Mastercard Open Finance US terms', () => {
    for (const id of ['data-connect', 'finbanks', 'access-token', 'permissioning', 'partner-linked', 'app-key']) {
      const e = glossaryById(id);
      expect(e, id).toBeDefined();
      expect(e!.sources).toContain('mastercard');
    }
  });

  it('cites the public glossaries', () => {
    expect(GLOSSARY_SOURCES.map((s) => s.id).sort()).toEqual([
      'bundesbank',
      'konsentus',
      'mastercard',
      'ravelin',
      'ukob',
    ]);
    for (const s of GLOSSARY_SOURCES) {
      expect(s.href.startsWith('https://')).toBe(true);
    }
  });

  it('includes Bundesbank third-party issuer and Ravelin-aligned SCA', () => {
    const issuer = glossaryById('third-party-issuer');
    expect(issuer).toBeDefined();
    expect(issuer!.sources).toContain('bundesbank');
    expect(glossaryById('cbpii')!.sources).toContain('bundesbank');
    expect(glossaryById('sca')!.sources).toEqual(expect.arrayContaining(['bundesbank', 'ravelin']));
    expect(glossaryById('tpp')!.sources).toEqual(expect.arrayContaining(['bundesbank', 'ravelin']));
  });

  it('every ISO catalog message is a glossary entry with category message', () => {
    const dotted = GLOSSARY.filter((e) => /^(pacs|pain|camt|acmt|auth|remt)\.\d+$/i.test(e.term));
    for (const e of dotted) {
      expect(e.category, e.term).toBe('message');
    }
    expect(dotted.map((e) => e.term).sort()).toEqual([...ISO_MESSAGES.map((m) => m.short)].sort());
    for (const m of ISO_MESSAGES) {
      const e = GLOSSARY.find((x) => x.term === m.short);
      expect(e, m.short).toBeDefined();
      expect(e!.category).toBe('message');
    }
    expect(glossaryById('pain')?.category).toBe('concept');
    expect(glossaryById('pacs')?.category).toBe('concept');
  });

  it('every entry has EN and FR name + definition', () => {
    for (const e of GLOSSARY) {
      expect(e.name.en.length, e.id).toBeGreaterThan(0);
      expect(e.name.fr.length, e.id).toBeGreaterThan(0);
      expect(e.definition.en.length, e.id).toBeGreaterThan(10);
      expect(e.definition.fr.length, e.id).toBeGreaterThan(10);
    }
  });

  it('seeAlso targets exist', () => {
    const ids = new Set(GLOSSARY.map((e) => e.id));
    const missing: string[] = [];
    for (const e of GLOSSARY) {
      for (const related of e.seeAlso ?? []) {
        if (!ids.has(related)) missing.push(`${e.id} → ${related}`);
      }
    }
    expect(missing).toEqual([]);
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

  it('search finds VoP as a glossary term', () => {
    const hits = createIndex().search('VoP');
    expect(hits.some((h) => String(h.id) === 'term:vop')).toBe(true);
  });

  it('search finds Instant Payment, Wero, Payconiq, TIPS and Data Connect', () => {
    const index = createIndex();
    expect(index.search('Instant Payment').some((h) => String(h.id) === 'term:ip')).toBe(true);
    expect(index.search('Wero').some((h) => String(h.id) === 'term:wero')).toBe(true);
    expect(index.search('Payconiq').some((h) => String(h.id) === 'term:payconiq')).toBe(true);
    expect(index.search('TIPS').some((h) => String(h.id) === 'term:tips')).toBe(true);
    expect(index.search('Data Connect').some((h) => String(h.id) === 'term:data-connect')).toBe(true);
  });
});
