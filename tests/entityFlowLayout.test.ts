import { describe, expect, it } from 'vitest';
import { FLOWS } from '../src/data/flows';
import { ACTOR_H, ACTOR_W, TAG_H, layoutEntityFlow, tagsOverlap } from '../src/lib/entityFlowLayout';

describe('entity flow layout', () => {
  it('numbers hops in catalog step order for every flow', () => {
    for (const flow of FLOWS) {
      const layout = layoutEntityFlow(flow);
      expect(layout.hops.map((h) => h.step.n), flow.id).toEqual(flow.steps.map((s) => s.n));
      expect(
        layout.hops.map((h) => h.tagLabel.slice(0, 2)),
        flow.id,
      ).toEqual(flow.steps.map((s) => String(s.n).padStart(2, '0')));
    }
  });

  it('keeps message labels as compact tags, not full-length bars', () => {
    for (const flow of FLOWS) {
      const layout = layoutEntityFlow(flow);
      for (const hop of layout.hops) {
        const chord = Math.hypot(hop.to.x - hop.from.x, hop.to.y - hop.from.y);
        if (chord < 40) continue;
        expect(hop.tagWidth, `${flow.id} step ${hop.step.n}`).toBeLessThan(chord * 0.7);
        expect(hop.tagWidth, `${flow.id} step ${hop.step.n}`).toBeLessThan(128);
      }
    }
  });

  it('does not overlap hop tags', () => {
    for (const flow of FLOWS) {
      const layout = layoutEntityFlow(flow);
      for (let i = 0; i < layout.hops.length; i++) {
        for (let j = i + 1; j < layout.hops.length; j++) {
          expect(
            tagsOverlap(layout.hops[i], layout.hops[j], 2),
            `${flow.id} steps ${layout.hops[i].step.n} & ${layout.hops[j].step.n}`,
          ).toBe(false);
        }
      }
    }
  });

  it('keeps tags off actor boxes', () => {
    for (const flow of FLOWS) {
      const layout = layoutEntityFlow(flow);
      for (const hop of layout.hops) {
        for (const actor of layout.actors) {
          const overlapX =
            Math.abs(hop.tag.x - actor.x) < hop.tagWidth / 2 + ACTOR_W / 2 - 4;
          const overlapY = Math.abs(hop.tag.y - actor.y) < TAG_H / 2 + ACTOR_H / 2 - 4;
          expect(overlapX && overlapY, `${flow.id} step ${hop.step.n} vs ${actor.id}`).toBe(false);
        }
      }
    }
  });

  it('places actors left-to-right in the flow actor sequence', () => {
    const flow = FLOWS.find((f) => f.id === 'sct-inst-happy-path');
    expect(flow).toBeDefined();
    const layout = layoutEntityFlow(flow!);
    const xs = layout.actors.map((a) => a.x);
    expect(layout.actors.map((a) => a.id)).toEqual(flow!.actors);
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
  });
});
