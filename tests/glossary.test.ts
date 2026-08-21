import { describe, expect, it } from 'vitest';
import {
  GLOSSARY,
  GLOSSARY_SOURCES,
  codeByValue,
  glossaryById,
  localizeGlossaryEntry,
} from '../src/data/glossary';
import { ISO_MESSAGES } from '../src/data/iso20022';
import { SCHEMES, schemeGlossaryId, schemeHref } from '../src/data/schemes';
import { applySearchQueryToHref, createIndex, searchCatalog } from '../src/lib/search';

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
    for (const id of [
      'sct',
      'sepa',
      'stet',
      'tips',
      'piis',
      'a2a',
      'sct-inst',
      'ais',
      'pis',
      'xs2a',
      'swift',
      'cbpr-plus',
      'rtgs',
      'six',
      'snb',
      'sps',
      'mx',
      'mt',
      'ebics',
      'hvps',
      'ig',
      'xsd',
      'sla',
      'p2p',
      'pan',
      'bin',
      'jws',
      'pkce',
      'par',
      'eea',
      'qr-bill',
      'b2b',
      'eod',
      'vpa',
    ]) {
      expect(glossaryById(id), id).toBeDefined();
    }
    expect(glossaryById('swift')!.term).toBe('SWIFT');
    expect(glossaryById('cbpr-plus')!.term).toBe('CBPR+');
    expect(glossaryById('cbpr-plus')!.aliases.en).toEqual(expect.arrayContaining(['CBPR']));
    expect(glossaryById('swift')!.seeAlso).toEqual(expect.arrayContaining(['cbpr-plus']));
  });

  it('covers PSP licence types vs neobank marketing label', () => {
    for (const id of ['emi', 'pi', 'credit-institution', 'neobank', 'aspsp', 'psp']) {
      expect(glossaryById(id), id).toBeDefined();
    }
    expect(glossaryById('neobank')!.aliases.en).toEqual(
      expect.arrayContaining(['virtual bank', 'digital bank', 'online bank']),
    );
    expect(glossaryById('neobank')!.aliases.fr).toEqual(
      expect.arrayContaining(['néobanque', 'banque en ligne']),
    );
    expect(glossaryById('credit-institution')!.name.fr).toMatch(/établissement de crédit/i);
    expect(glossaryById('pi')!.name.fr).toMatch(/établissement de paiement/i);
    expect(glossaryById('neobank')!.seeAlso).toEqual(
      expect.arrayContaining(['credit-institution', 'emi', 'pi', 'aspsp']),
    );
  });

  it('covers nostro / correspondent banking and AML screening', () => {
    for (const id of [
      'nostro',
      'vostro',
      'correspondent-banking',
      'aml',
      'cft',
      'sanctions-screening',
      'watchlist',
      'pep',
      'name-screening',
      'transaction-monitoring',
      'str',
      'ubo',
      'cdd',
    ]) {
      expect(glossaryById(id), id).toBeDefined();
    }
    expect(glossaryById('nostro')!.name.fr).toMatch(/nostro/i);
    expect(glossaryById('aml')!.aliases.fr).toEqual(
      expect.arrayContaining(['LCB-FT', 'blanchiment', 'anti-blanchiment']),
    );
  });

  it('covers well-known card and A2A schemes', () => {
    for (const id of [
      'visa',
      'mastercard',
      'amex',
      'cartes-bancaires',
      'wero',
      'a2a-overlay',
      'pisp-a2a',
      'instant-a2a',
      'paypal',
      'curve',
      'apple-pay',
      'ideal',
      'bancontact',
      'twint',
      'pix',
      'upi',
    ]) {
      expect(glossaryById(id), id).toBeDefined();
    }
    expect(glossaryById('visa')!.category).toBe('scheme');
    expect(glossaryById('cartes-bancaires')!.aliases.fr).toEqual(expect.arrayContaining(['CB', 'carte bleue']));
  });

  it('maps every catalog scheme page into a glossary entry', () => {
    for (const s of SCHEMES) {
      const glossaryId = schemeGlossaryId(s.id);
      expect(glossaryById(glossaryId), `${s.id} → ${glossaryId}`).toBeDefined();
      expect(schemeHref(s.id)).toBe(`/glossary?id=${encodeURIComponent(glossaryId)}`);
    }
    expect(schemeGlossaryId('wero')).toBe('a2a-overlay');
    expect(schemeGlossaryId('card')).toBe('card-scheme');
    expect(schemeGlossaryId('sic-ch')).toBe('sic');
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
    expect(glossaryById('pain')?.category).toBe('message');
    expect(glossaryById('pacs')?.category).toBe('message');
    expect(glossaryById('camt')?.category).toBe('message');
    expect(glossaryById('acmt')?.category).toBe('message');
    expect(glossaryById('mx')?.category).toBe('message');
    expect(glossaryById('mt')?.category).toBe('message');
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

  it('keeps the search query on glossary result hrefs', () => {
    const href = applySearchQueryToHref('/glossary?id=vop', 'term', 'VoP');
    expect(href).toContain('id=vop');
    expect(href).toContain('q=VoP');
  });

  it('searchCatalog ranks glossary terms ahead of other hits', () => {
    const index = createIndex();
    const hits = searchCatalog(index, 'VoP');
    expect(hits[0]?.id).toBe('term:vop');
    expect(hits[0]?.kind).toBe('term');
    const firstNonTerm = hits.findIndex((h) => h.kind !== 'term');
    if (firstNonTerm >= 0) {
      expect(hits.slice(0, firstNonTerm).every((h) => h.kind === 'term')).toBe(true);
    }
  });

  it('search finds Instant Payment, Wero, Payconiq, TIPS and Data Connect', () => {
    const index = createIndex();
    expect(index.search('Instant Payment').some((h) => String(h.id) === 'term:ip')).toBe(true);
    expect(index.search('Wero').some((h) => String(h.id) === 'term:wero')).toBe(true);
    expect(index.search('Payconiq').some((h) => String(h.id) === 'term:payconiq')).toBe(true);
    expect(index.search('TIPS').some((h) => String(h.id) === 'term:tips')).toBe(true);
    expect(index.search('Data Connect').some((h) => String(h.id) === 'term:data-connect')).toBe(true);
    expect(index.search('PayPal').some((h) => String(h.id) === 'term:paypal')).toBe(true);
    expect(index.search('Curve').some((h) => String(h.id) === 'term:curve')).toBe(true);
    expect(index.search('SWIFT').some((h) => String(h.id) === 'term:swift')).toBe(true);
    expect(index.search('CBPR+').some((h) => String(h.id) === 'term:cbpr-plus')).toBe(true);
  });

  it('puts AML first when searching the thesaurus for AML', () => {
    expect(glossaryById('aml')?.term).toBe('AML');
    const index = createIndex();
    const hits = searchCatalog(index, 'AML');
    expect(hits[0]?.id).toBe('term:aml');
    expect(hits[0]?.kind).toBe('term');
  });
});
