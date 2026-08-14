import type { ActorId, Flow, FlowStep } from '@/types';

export const ACTOR_W = 124;
export const ACTOR_H = 70;
export const COL_GAP = 232;
export const PAD_X = 36;
export const PAD_Y = 32;
export const TAG_H = 20;

export type Point = { x: number; y: number };

export interface LaidActor {
  id: ActorId;
  x: number;
  y: number;
}

export interface LaidHop {
  step: FlowStep;
  from: Point;
  to: Point;
  control: Point;
  tag: Point;
  tagLabel: string;
  tagCaption: string;
  tagWidth: number;
  path: string;
}

export interface EntityFlowLayout {
  actors: LaidActor[];
  hops: LaidHop[];
  width: number;
  height: number;
}

export function layoutEntityFlow(flow: Flow): EntityFlowLayout {
  const actorIds = orderedActors(flow);
  const index = new Map(actorIds.map((id, i) => [id, i]));
  const actorY = 0;
  const actors: LaidActor[] = actorIds.map((id, i) => ({
    id,
    x: PAD_X + ACTOR_W / 2 + i * COL_GAP,
    y: actorY,
  }));
  const pos = new Map(actors.map((a) => [a.id, a]));

  const pairSeen = new Map<string, number>();
  const pairTotals = new Map<string, number>();
  for (const step of flow.steps) {
    const key = directedKey(step.from, step.to);
    pairTotals.set(key, (pairTotals.get(key) ?? 0) + 1);
  }

  const hops: LaidHop[] = flow.steps.map((step) => {
    const key = directedKey(step.from, step.to);
    const stack = pairSeen.get(key) ?? 0;
    pairSeen.set(key, stack + 1);
    const fromA = pos.get(step.from) ?? { id: step.from, x: PAD_X, y: 0 };
    const toA = pos.get(step.to) ?? { id: step.to, x: PAD_X, y: 0 };
    const fromIdx = index.get(step.from) ?? 0;
    const toIdx = index.get(step.to) ?? 0;
    const span = Math.abs(toIdx - fromIdx);
    const forward = toIdx >= fromIdx;
    const sign = forward ? -1 : 1;
    const magnitude = 86 + stack * 42 + Math.max(0, span - 1) * 16;

    const tagCaption = hopCaption(step);
    const tagLabel = `${String(step.n).padStart(2, '0')}${tagCaption ? ` ${tagCaption}` : ''}`;
    const tagWidth = Math.min(124, Math.max(34, 16 + tagLabel.length * 6.1));

    if (fromIdx === toIdx) {
      const cx = fromA.x;
      const cy = fromA.y - (110 + stack * 36);
      const from = { x: fromA.x - 18, y: fromA.y - ACTOR_H / 2 };
      const to = { x: fromA.x + 18, y: fromA.y - ACTOR_H / 2 };
      const control = { x: cx, y: cy };
      const tag = quadraticPoint(from, control, to, 0.5);
      return {
        step,
        from,
        to,
        control,
        tag,
        tagLabel,
        tagCaption,
        tagWidth,
        path: `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`,
      };
    }

    const mid = { x: (fromA.x + toA.x) / 2, y: (fromA.y + toA.y) / 2 };
    const control = { x: mid.x, y: mid.y + sign * magnitude };
    const from = boxExit(fromA, control);
    const to = boxExit(toA, control);
    const tag = quadraticPoint(from, control, to, 0.5);
    return {
      step,
      from,
      to,
      control,
      tag,
      tagLabel,
      tagCaption,
      tagWidth,
      path: `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`,
    };
  });

  separateTags(hops);

  let minY = -ACTOR_H / 2;
  let maxY = ACTOR_H / 2;
  for (const hop of hops) {
    minY = Math.min(minY, hop.tag.y - TAG_H / 2, hop.control.y, hop.from.y, hop.to.y);
    maxY = Math.max(maxY, hop.tag.y + TAG_H / 2, hop.control.y, hop.from.y, hop.to.y);
  }

  const shiftY = PAD_Y - minY;
  for (const actor of actors) actor.y += shiftY;
  for (const hop of hops) {
    hop.from.y += shiftY;
    hop.to.y += shiftY;
    hop.control.y += shiftY;
    hop.tag.y += shiftY;
    hop.path = `M ${hop.from.x} ${hop.from.y} Q ${hop.control.x} ${hop.control.y} ${hop.to.x} ${hop.to.y}`;
  }

  return {
    actors,
    hops,
    width: PAD_X * 2 + ACTOR_W + Math.max(0, actorIds.length - 1) * COL_GAP,
    height: maxY - minY + PAD_Y * 2,
  };
}

export function hopCaption(step: FlowStep): string {
  if (step.messageShort) return step.messageShort;
  if (step.method) return step.method;
  return '';
}

export function quadraticPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export function tokenOnHop(hop: LaidHop, t: number): Point {
  return quadraticPoint(hop.from, hop.control, hop.to, clamp(t, 0, 1));
}

export function tagsOverlap(a: LaidHop, b: LaidHop, gap = 6): boolean {
  return (
    Math.abs(a.tag.x - b.tag.x) < (a.tagWidth + b.tagWidth) / 2 + gap &&
    Math.abs(a.tag.y - b.tag.y) < TAG_H + gap
  );
}

function orderedActors(flow: Flow): ActorId[] {
  const seen = new Set<ActorId>(flow.actors);
  const ids = [...flow.actors];
  for (const step of flow.steps) {
    if (!seen.has(step.from)) {
      seen.add(step.from);
      ids.push(step.from);
    }
    if (!seen.has(step.to)) {
      seen.add(step.to);
      ids.push(step.to);
    }
  }
  return ids;
}

function directedKey(from: ActorId, to: ActorId) {
  return `${from}->${to}`;
}

function boxExit(center: LaidActor, toward: Point): Point {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (dx === 0 && dy === 0) return { x: center.x, y: center.y - ACTOR_H / 2 };
  const hw = ACTOR_W / 2;
  const hh = ACTOR_H / 2;
  const sx = dx === 0 ? Infinity : hw / Math.abs(dx);
  const sy = dy === 0 ? Infinity : hh / Math.abs(dy);
  const s = Math.min(sx, sy);
  return { x: center.x + dx * s, y: center.y + dy * s };
}

function separateTags(hops: LaidHop[]) {
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < hops.length; i++) {
      for (let j = i + 1; j < hops.length; j++) {
        const a = hops[i];
        const b = hops[j];
        if (!tagsOverlap(a, b)) continue;
        const push = 12;
        if (a.tag.y <= b.tag.y) {
          a.tag.y -= push;
          a.control.y -= push;
          b.tag.y += push;
          b.control.y += push;
        } else {
          a.tag.y += push;
          a.control.y += push;
          b.tag.y -= push;
          b.control.y -= push;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
