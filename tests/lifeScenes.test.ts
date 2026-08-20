import { describe, expect, it } from 'vitest';
import { FLOWS } from '../src/data/flows';
import { PAYMENTS } from '../src/data/payments';
import { ALL_SAMPLES } from '../src/data/samples';
import {
  LIFE_SCENARIOS,
  LIFE_SCENES,
  lifeScenarioById,
  scenariosForScene,
} from '../src/data/lifeScenes';
import type { LifeSceneId } from '../src/types';

describe('lifeScenes', () => {
  it('lists five hub scenes', () => {
    expect(LIFE_SCENES.map((s) => s.id)).toEqual(['shop', 'stream', 'wallet', 'receive', 'bank']);
  });

  it('covers every catalog flow at least once', () => {
    const referenced = new Set<string>();
    for (const scenario of LIFE_SCENARIOS) {
      for (const beat of scenario.beats) {
        if (beat.flowId) referenced.add(beat.flowId);
      }
    }
    for (const flow of FLOWS) {
      expect(referenced.has(flow.id), `flow ${flow.id} missing from /live`).toBe(true);
    }
  });

  it('covers every catalog payment at least once', () => {
    const referenced = new Set<string>();
    for (const scenario of LIFE_SCENARIOS) {
      if (scenario.paymentId) referenced.add(scenario.paymentId);
      for (const beat of scenario.beats) {
        if (beat.paymentId) referenced.add(beat.paymentId);
      }
    }
    for (const payment of PAYMENTS) {
      expect(referenced.has(payment.id), `payment ${payment.id} missing from /live`).toBe(true);
    }
  });

  it('resolves every flowId / step / sampleId / hopId / paymentId', () => {
    const sampleIds = new Set(ALL_SAMPLES.map((s) => s.id));
    const flowById = new Map(FLOWS.map((f) => [f.id, f]));
    const paymentById = new Map(PAYMENTS.map((p) => [p.id, p]));

    for (const scenario of LIFE_SCENARIOS) {
      expect(scenario.beats.length, scenario.id).toBeGreaterThan(0);
      if (scenario.paymentId) {
        expect(paymentById.has(scenario.paymentId), scenario.id).toBe(true);
      }
      if (scenario.pairScenarioId) {
        expect(lifeScenarioById(scenario.pairScenarioId), scenario.id).toBeDefined();
      }
      if (scenario.bankDeepLinkId) {
        expect(lifeScenarioById(scenario.bankDeepLinkId), scenario.id).toBeDefined();
      }

      for (const beat of scenario.beats) {
        if (beat.flowId) {
          const flow = flowById.get(beat.flowId);
          expect(flow, `${scenario.id} flow ${beat.flowId}`).toBeDefined();
          if (beat.step != null) {
            expect(
              flow!.steps.some((s) => s.n === beat.step),
              `${scenario.id} step ${beat.step} in ${beat.flowId}`,
            ).toBe(true);
          }
        }
        if (beat.sampleId) {
          expect(sampleIds.has(beat.sampleId), `${scenario.id} sample ${beat.sampleId}`).toBe(true);
        }
        if (beat.paymentId || beat.hopId) {
          const pid = beat.paymentId ?? scenario.paymentId;
          expect(pid, `${scenario.id} hop without payment`).toBeTruthy();
          const payment = paymentById.get(pid!);
          expect(payment, `${scenario.id} payment ${pid}`).toBeDefined();
          if (beat.hopId) {
            expect(
              payment!.hops.some((h) => h.id === beat.hopId),
              `${scenario.id} hop ${beat.hopId}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('keeps scenario ids unique and scenes non-empty', () => {
    const ids = LIFE_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const scene of LIFE_SCENES) {
      expect(scenariosForScene(scene.id as LifeSceneId).length, scene.id).toBeGreaterThan(0);
    }
  });

  it('exposes receive as a first-class scene with send pairs', () => {
    const receive = scenariosForScene('receive');
    expect(receive.length).toBeGreaterThan(0);
    for (const s of receive) {
      expect(s.pairScenarioId, s.id).toBeTruthy();
      const pair = lifeScenarioById(s.pairScenarioId!);
      expect(pair?.sceneId, s.id).toBe('wallet');
    }
  });
});
