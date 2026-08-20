import { describe, expect, it } from 'vitest';
import { SAMPLES } from '../src/data/samples';
import { ISO_ELEMENTS, isoElementTip } from '../src/data/isoElements';
import { extractXmlTags } from '../src/lib/payloadTags';
import { buildPacs002, buildPacs008, DEFAULT_PACS_INPUT } from '../src/lib/pacsBuilder';
import { resolveXmlField } from '../src/lib/pacsFields';
import { xmlTagTooltip } from '../src/lib/xmlTagTooltip';
import { en } from '../src/i18n/locales/en';
import { resolveMessage } from '../src/i18n/types';

const t = (key: string) => resolveMessage(en, key) ?? key;

describe('resolveXmlField', () => {
  it('matches an exact leaf path', () => {
    const field = resolveXmlField('FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr/Nm');
    expect(field?.key).toBe('debtorName');
  });

  it('matches an attribute selector', () => {
    const field = resolveXmlField('FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt@Ccy');
    expect(field?.key).toBe('currency');
  });

  it('matches a unique parent of a leaf', () => {
    const field = resolveXmlField('FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf');
    expect(field?.key).toBe('remittance');
  });

  it('returns null for an ambiguous parent', () => {
    expect(resolveXmlField('FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId')).toBeNull();
  });
});

describe('xmlTagTooltip', () => {
  it('prefers the form field definition when the path maps', () => {
    const tip = xmlTagTooltip({
      selector: 'FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt',
      localName: 'IntrBkSttlmAmt',
      t,
      locale: 'en',
    });
    expect(tip).toBe(t('try.defAmount'));
  });

  it('falls through to the ISO dictionary for ambiguous parents', () => {
    const tip = xmlTagTooltip({
      selector: 'FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId',
      localName: 'PmtId',
      t,
      locale: 'en',
    });
    expect(tip).toBe(ISO_ELEMENTS.PmtId.en);
  });

  it('looks up structural tags by local name', () => {
    expect(isoElementTip('GrpHdr', 'en')).toContain('Group header');
    expect(isoElementTip('Dbtr', 'fr')).toContain('Débiteur');
    expect(isoElementTip('Document', 'en')).toContain('ISO 20022');
  });

  it('returns undefined for unknown names', () => {
    expect(isoElementTip('NotARealIsoTag', 'en')).toBeUndefined();
  });
});

describe('ISO_ELEMENTS coverage', () => {
  it('covers every local tag used in samples and the Try builder', () => {
    const tags = new Set<string>();
    for (const s of SAMPLES) {
      if (s.format === 'xml') {
        for (const tag of extractXmlTags(s.content)) tags.add(tag);
      }
    }
    for (const xml of [
      buildPacs008(DEFAULT_PACS_INPUT),
      buildPacs002(DEFAULT_PACS_INPUT, 'ACSC'),
      buildPacs002(DEFAULT_PACS_INPUT, 'RJCT', 'AC01'),
    ]) {
      for (const tag of extractXmlTags(xml)) tags.add(tag);
    }
    for (const attr of ['xmlns', 'Ccy', 'encoding', 'version']) tags.add(attr);

    const missing = [...tags].filter((tag) => !ISO_ELEMENTS[tag]).sort();
    expect(missing).toEqual([]);
  });

  it('has both locales for every entry', () => {
    for (const [name, tip] of Object.entries(ISO_ELEMENTS)) {
      expect(tip.en.length, name).toBeGreaterThan(0);
      expect(tip.fr.length, name).toBeGreaterThan(0);
    }
  });
});
