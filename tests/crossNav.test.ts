import { describe, expect, it } from 'vitest';
import { usagesOfSample } from '../src/data/flows';
import {
  liveScenarioHref,
  scenariosForFlow,
  scenariosForFlowStep,
  scenariosForPayment,
  scenariosForSample,
} from '../src/data/lifeScenes';

describe('cross-nav helpers', () => {
  it('finds flows that use a sample (and JSON companions)', () => {
    const xml = usagesOfSample('pacs-008-sct');
    expect(xml.length).toBeGreaterThan(0);
    expect(xml.some((u) => u.flow.id === 'clearing-sct-happy-path')).toBe(true);

    const json = usagesOfSample('pacs-008-sct-json');
    expect(json.map((u) => u.flow.id).sort()).toEqual(xml.map((u) => u.flow.id).sort());
  });

  it('links live scenarios back to flows and steps', () => {
    const forFlow = scenariosForFlow('bg-pis-sepa-redirect');
    expect(forFlow.length).toBeGreaterThan(0);
    expect(liveScenarioHref(forFlow[0]!.scenario, forFlow[0]!.beatIndex)).toMatch(
      /^\/live\/shop\/atelier-pisp-sct/,
    );

    const forStep = scenariosForFlowStep('bg-pis-sepa-redirect', 1);
    expect(forStep.length).toBeGreaterThan(0);
  });

  it('resolves live scenarios for samples and payments', () => {
    expect(scenariosForSample('camt-054-credit').length).toBeGreaterThan(0);
    expect(scenariosForPayment('sepa-instant').length).toBeGreaterThan(0);
  });
});
