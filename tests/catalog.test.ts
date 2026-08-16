import { describe, expect, it } from 'vitest';
import { FLOWS, ACTORS, usagesOfMessage } from '../src/data/flows';
import { ISO_MESSAGES } from '../src/data/iso20022';
import { ALL_SAMPLES, SAMPLES, samplesForMessage } from '../src/data/samples';
import { FLOWS_FR } from '../src/i18n/flowsFr';
import { STANDARDS } from '../src/data/standards';
import { PAYMENTS } from '../src/data/payments';
import { SCHEMES } from '../src/data/schemes';
import { INFRASTRUCTURES } from '../src/data/infrastructures';
import { RELATIONS } from '../src/data/relations';
import { CODES } from '../src/data/codes';
import { codeByValue, GLOSSARY, GLOSSARY_CODES, GLOSSARY_MESSAGES } from '../src/data/glossary';
import { DOCUMENTS, createIndex } from '../src/lib/search';

/**
 * The catalog is hand-maintained, so these guard the cross-references. A broken
 * link between a flow step and a sample is the kind of thing nobody notices in
 * review and everybody notices in the UI.
 */
describe('referential integrity', () => {
  it('every flow points at a real standard', () => {
    for (const flow of FLOWS) {
      expect(STANDARDS.map((s) => s.id), flow.id).toContain(flow.standardId);
    }
  });

  it('every step references a sample that exists', () => {
    const ids = new Set(SAMPLES.map((s) => s.id));
    for (const flow of FLOWS) {
      for (const step of flow.steps) {
        if (step.sampleId) expect(ids, `${flow.id} step ${step.n}`).toContain(step.sampleId);
      }
    }
  });

  it('every step references a message that exists', () => {
    const shorts = new Set(ISO_MESSAGES.map((m) => m.short));
    for (const flow of FLOWS) {
      for (const step of flow.steps) {
        if (step.messageShort) expect(shorts, `${flow.id} step ${step.n}`).toContain(step.messageShort);
      }
    }
  });

  it('every actor used by a step is a known actor', () => {
    for (const flow of FLOWS) {
      for (const step of flow.steps) {
        expect(ACTORS[step.from], `${flow.id} step ${step.n} from`).toBeDefined();
        expect(ACTORS[step.to], `${flow.id} step ${step.n} to`).toBeDefined();
      }
    }
  });

  it('step numbers are sequential from one', () => {
    for (const flow of FLOWS) {
      expect(flow.steps.map((s) => s.n), flow.id).toEqual(flow.steps.map((_, i) => i + 1));
    }
  });

  it('messages claiming a flow are actually used by it', () => {
    for (const message of ISO_MESSAGES) {
      for (const flowId of message.flows) {
        expect(FLOWS.map((f) => f.id), `${message.short} -> ${flowId}`).toContain(flowId);
      }
    }
  });

  it('message.flows matches every step that references the message', () => {
    for (const message of ISO_MESSAGES) {
      const actual = usagesOfMessage(message.short)
        .map((u) => u.flow.id)
        .sort();
      expect([...message.flows].sort(), message.short).toEqual(actual);
    }
  });

  it('samples reference a real message or standard', () => {
    for (const sample of SAMPLES) {
      if (sample.messageShort) {
        expect(ISO_MESSAGES.map((m) => m.short), sample.id).toContain(sample.messageShort);
      }
      if (sample.standardId) {
        expect(STANDARDS.map((s) => s.id), sample.id).toContain(sample.standardId);
      }
      expect(sample.messageShort ?? sample.standardId, `${sample.id} belongs to nothing`).toBeDefined();
    }
  });

  it('every ISO message has at least one sample', () => {
    const covered = new Set(SAMPLES.filter((s) => s.messageShort).map((s) => s.messageShort));
    const missing = ISO_MESSAGES.filter((m) => !covered.has(m.short)).map((m) => m.short);
    expect(missing).toEqual([]);
  });

  it('every ISO message has both XML and JSON samples', () => {
    const missing: string[] = [];
    for (const message of ISO_MESSAGES) {
      const samples = samplesForMessage(message.short);
      if (!samples.some((s) => s.format === 'xml')) missing.push(`${message.short}:xml`);
      if (!samples.some((s) => s.format === 'json')) missing.push(`${message.short}:json`);
    }
    expect(missing).toEqual([]);
  });

  it('JSON companions round-trip from every ISO XML sample', () => {
    const companions = ALL_SAMPLES.filter((s) => s.id.endsWith('-json'));
    expect(companions.length).toBeGreaterThan(0);
    for (const sample of SAMPLES.filter((s) => s.format === 'xml' && s.messageShort)) {
      expect(
        companions.some((c) => c.id === `${sample.id}-json`),
        `missing JSON for ${sample.id}`,
      ).toBe(true);
    }
  });

  it('every code referenced by a flow step is in the glossary', () => {
    const known = new Set(GLOSSARY_CODES.map((c) => c.term.toLowerCase()));
    const missing: string[] = [];
    for (const flow of FLOWS) {
      for (const step of flow.steps) {
        for (const code of step.codes ?? []) {
          if (!known.has(code.toLowerCase())) missing.push(`${flow.id} step ${step.n}: ${code}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('every flow has a complete French translation', () => {
    for (const flow of FLOWS) {
      const tr = FLOWS_FR[flow.id];
      expect(tr, `missing FR for ${flow.id}`).toBeDefined();
      expect(tr.name.length).toBeGreaterThan(0);
      expect(tr.summary.length).toBeGreaterThan(0);
      expect(tr.useCase.length).toBeGreaterThan(0);
      for (const step of flow.steps) {
        expect(tr.steps[step.n], `${flow.id} step ${step.n}`).toBeDefined();
        expect(tr.steps[step.n].label.length).toBeGreaterThan(0);
        expect(tr.steps[step.n].detail.length).toBeGreaterThan(0);
      }
    }
  });

  it('code identifiers are unique within a family', () => {
    const seen = new Set<string>();
    for (const code of CODES) {
      const key = `${code.family}:${code.code}`;
      expect(seen.has(key), `duplicate ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('every ISO message is a glossary entry', () => {
    for (const m of ISO_MESSAGES) {
      const entry = GLOSSARY_MESSAGES.find((e) => e.term === m.short);
      expect(entry, m.short).toBeDefined();
      expect(entry!.category).toBe('message');
    }
    expect(GLOSSARY_MESSAGES.length).toBe(ISO_MESSAGES.length + 4);
    for (const id of ['pain', 'pacs', 'camt', 'acmt']) {
      expect(GLOSSARY_MESSAGES.some((e) => e.id === id), id).toBe(true);
    }
  });

  it('every authored code is a glossary entry', () => {
    for (const code of CODES) {
      const entry = codeByValue(code.code);
      expect(entry, code.code).toBeDefined();
      expect(entry!.family).toBe(code.family);
      expect(entry!.action).toBe(code.action);
    }
    expect(GLOSSARY_CODES.length).toBe(CODES.length);
  });

  it('glossary ids are unique', () => {
    const seen = new Set<string>();
    for (const e of GLOSSARY) {
      expect(seen.has(e.id), `duplicate glossary id ${e.id}`).toBe(false);
      seen.add(e.id);
    }
  });

  it('payments point at real schemes, rails, messages, flows and samples', () => {
    const schemeIds = new Set(SCHEMES.map((s) => s.id));
    const infraIds = new Set(INFRASTRUCTURES.map((i) => i.id));
    const shorts = new Set(ISO_MESSAGES.map((m) => m.short));
    const flowIds = new Set(FLOWS.map((f) => f.id));
    const sampleIds = new Set(SAMPLES.map((s) => s.id));
    for (const p of PAYMENTS) {
      expect(schemeIds, p.id).toContain(p.schemeId);
      expect(infraIds, p.id).toContain(p.defaultRailId);
      for (const id of p.infrastructureIds) expect(infraIds, `${p.id} rail ${id}`).toContain(id);
      for (const short of p.messageShorts) expect(shorts, `${p.id} ${short}`).toContain(short);
      for (const flowId of p.relatedFlowIds) expect(flowIds, `${p.id} ${flowId}`).toContain(flowId);
      for (const hop of p.hops) {
        if (hop.messageShort) expect(shorts, `${p.id} hop ${hop.id}`).toContain(hop.messageShort);
        if (hop.flowId) expect(flowIds, `${p.id} hop ${hop.id}`).toContain(hop.flowId);
        if (hop.sampleId) expect(sampleIds, `${p.id} hop ${hop.id}`).toContain(hop.sampleId);
      }
    }
  });

  it('every hop with a flowId points at a real flow step', () => {
    for (const p of PAYMENTS) {
      for (const hop of p.hops) {
        if (!hop.flowId) continue;
        const flow = FLOWS.find((f) => f.id === hop.flowId);
        expect(flow, `${p.id}/${hop.id} → ${hop.flowId}`).toBeDefined();
        if (hop.step != null) {
          expect(
            flow!.steps.some((s) => s.n === hop.step),
            `${p.id}/${hop.id} step ${hop.step}`,
          ).toBe(true);
        }
      }
    }
  });

  it('keeps TIPS and RT1 as distinct infrastructures', () => {
    expect(INFRASTRUCTURES.some((i) => i.id === 'tips')).toBe(true);
    expect(INFRASTRUCTURES.some((i) => i.id === 'rt1')).toBe(true);
    expect(INFRASTRUCTURES.find((i) => i.id === 'tips')!.name.en).toBe('TIPS');
    expect(INFRASTRUCTURES.find((i) => i.id === 'rt1')!.name.en).toBe('RT1');
  });

  it('relations resolve to known entities', () => {
    const known = new Set<string>([
      ...PAYMENTS.map((p) => `payment:${p.id}`),
      ...SCHEMES.map((s) => `scheme:${s.id}`),
      ...INFRASTRUCTURES.map((i) => `infrastructure:${i.id}`),
      ...ISO_MESSAGES.map((m) => `message:${m.short}`),
    ]);
    for (const r of RELATIONS) {
      if (r.to.startsWith('organization:') || r.from.startsWith('organization:')) continue;
      expect(known.has(r.from), r.from).toBe(true);
      expect(known.has(r.to), r.to).toBe(true);
    }
  });
});

describe('search index', () => {
  const index = createIndex();

  it('indexes every catalog document', () => {
    expect(DOCUMENTS.length).toBeGreaterThan(80);
  });

  it('finds a message by its dotted id', () => {
    const hits = index.search('pacs.008');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.id === 'message:pacs.008')).toBe(true);
  });

  it('finds a reason code by its exact value', () => {
    const hits = index.search('AC01');
    expect(hits.some((h) => h.id === 'code:AC01')).toBe(true);
    expect(hits.some((h) => String(h.href).includes('/glossary'))).toBe(true);
  });

  it('survives dot-heavy OBIE codes', () => {
    expect(index.search('UK.OBIE.Signature.Invalid').length).toBeGreaterThan(0);
  });

  it('finds flows by concept rather than exact title', () => {
    expect(index.search('recall').some((h) => h.id === 'flow:clearing-recall')).toBe(true);
  });

  it('finds Payment Explorer journeys', () => {
    const hits = index.search('SEPA Instant');
    expect(hits.some((h) => h.id === 'payment:sepa-instant')).toBe(true);
  });
});
