import { useEffect, useMemo, useRef } from 'react';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import type { ActorId, Flow, FlowStep } from '@/types';
import { ACTORS } from '@/data/flows';
import { ActorIcon } from '@/lib/icons';
import { ACTOR_ICON, actorIconDataUri } from '@/lib/iconMeta';
import { ENTITY_LABEL_FR, useI18n, useT } from '@/i18n';

interface Props {
  flow: Flow;
  selectedStep: number;
  onSelectStep: (n: number) => void;
}

/** Friendly labels for the transaction diagram (user, bank, CSM, …). */
const ENTITY_LABEL_EN: Record<ActorId, { title: string; role: string }> = {
  psu: { title: 'User', role: 'PSU' },
  tpp: { title: 'TPP', role: 'AISP / PISP' },
  aspsp: { title: 'Debtor bank', role: 'ASPSP' },
  sca: { title: 'SCA', role: 'Auth' },
  csm: { title: 'CSM', role: 'Clearing' },
  beneficiary: { title: 'Creditor bank', role: 'Beneficiary' },
  rail: { title: 'SIC rail', role: 'RTGS / IP' },
  scheme: { title: 'Scheme', role: 'Wero / EPI' },
};

const LAYER_COLOR = {
  api: '#1f4fd8',
  clearing: '#5b45d6',
} as const;

/**
 * Entity / transaction diagram: actors as boxes with icons, each step as a
 * labeled arrow (pacs.008, pacs.002 ack, …). Complements the swimlane view.
 */
export function EntityFlowDiagram({ flow, selectedStep, onSelectStep }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const entityLabel = locale === 'fr' ? ENTITY_LABEL_FR : ENTITY_LABEL_EN;
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelectStep);
  onSelectRef.current = onSelectStep;

  const actors = useMemo(() => {
    const set = new Set<ActorId>(flow.actors);
    for (const step of flow.steps) {
      set.add(step.from);
      set.add(step.to);
    }
    return [...set];
  }, [flow]);

  const elements = useMemo(() => buildElements(flow, actors, entityLabel), [flow, actors, entityLabel]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            // Label sits under the box so the icon can occupy the center.
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 14,
            'text-wrap': 'wrap',
            'text-max-width': '110px',
            'font-family': 'IBM Plex Sans, sans-serif',
            'font-size': '11px',
            'font-weight': 600,
            'line-height': 1.25,
            color: '#0d1420',
            'background-color': '#ffffff',
            'background-image': 'data(icon)',
            'background-fit': 'none',
            'background-clip': 'none',
            'background-repeat': 'no-repeat',
            'background-width': 40,
            'background-height': 40,
            'background-position-x': 'center',
            'background-position-y': 'center',
            'background-image-opacity': 1,
            'border-width': 1.5,
            'border-color': '#c8d1de',
            shape: 'round-rectangle',
            width: 112,
            height: 72,
          },
        },
        {
          selector: 'node[kind = "bank"]',
          style: { 'border-color': '#1f4fd8', 'background-color': '#dde5fb' },
        },
        {
          selector: 'node[kind = "csm"]',
          style: { 'border-color': '#5b45d6', 'background-color': '#e4dffb' },
        },
        {
          selector: 'node[kind = "user"]',
          style: { 'border-color': '#0b8f63', 'background-color': '#d5f0e5' },
        },
        {
          selector: 'node[kind = "scheme"]',
          style: { 'border-color': '#b26b00', 'background-color': '#f9ecd4' },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(edgeLabel)',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '9px',
            color: '#5b6779',
            'text-background-color': '#f4f6f9',
            'text-background-opacity': 1,
            'text-background-padding': '3px',
            'curve-style': 'bezier',
            'control-point-step-size': 40,
            width: 1.5,
            'line-color': '#c8d1de',
            'target-arrow-color': '#c8d1de',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1,
            'source-endpoint': 'outside-to-node',
            'target-endpoint': 'outside-to-node',
          },
        },
        {
          selector: 'edge[layer = "api"]',
          style: {
            'line-color': LAYER_COLOR.api,
            'target-arrow-color': LAYER_COLOR.api,
            color: LAYER_COLOR.api,
          },
        },
        {
          selector: 'edge[layer = "clearing"]',
          style: {
            'line-color': LAYER_COLOR.clearing,
            'target-arrow-color': LAYER_COLOR.clearing,
            color: LAYER_COLOR.clearing,
          },
        },
        {
          selector: 'edge.selected',
          style: {
            width: 3,
            'line-color': '#0d1420',
            'target-arrow-color': '#0d1420',
            color: '#0d1420',
            'font-size': '10px',
            'font-weight': 700,
            'z-index': 10,
          },
        },
      ],
      layout: { name: 'preset', fit: true, padding: 36 },
      minZoom: 0.4,
      maxZoom: 2.2,
      wheelSensitivity: 0.2,
      userZoomingEnabled: true,
      userPanningEnabled: true,
    });

    cy.on('tap', 'edge', (evt) => {
      const n = Number(evt.target.data('step'));
      if (Number.isFinite(n)) onSelectRef.current(n);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [elements]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().removeClass('selected');
    cy.$(`edge[step = "${selectedStep}"]`).addClass('selected');
  }, [selectedStep, elements]);

  return (
    <div>
      <div
        ref={containerRef}
        className="h-[min(52vh,420px)] w-full border border-rule-soft bg-paper-raised"
        role="img"
        aria-label={`${flow.name} transaction flow between entities`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {actors.map((id) => (
          <span key={id} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <ActorIcon actor={id} size={12} />
            <span className="font-medium text-ink">{ACTOR_ICON[id].label}</span>
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-signal" /> {t('flow.apiHop')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-violet" /> {t('flow.clearingHop')}
        </span>
        <span>{t('flow.clickArrow')}</span>
      </div>
    </div>
  );
}

function buildElements(
  flow: Flow,
  actors: ActorId[],
  entityLabel: Record<string, { title: string; role: string }>,
): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const positions = layoutActors(actors);

  for (const id of actors) {
    const meta = entityLabel[id] ?? { title: ACTORS[id]?.label ?? id, role: ACTORS[id]?.sublabel ?? '' };
    elements.push({
      data: {
        id: `actor:${id}`,
        label: `${meta.title}\n${meta.role}`,
        kind: nodeKind(id),
        icon: actorIconDataUri(id),
      },
      position: positions.get(id) ?? { x: 0, y: 0 },
    });
  }

  for (const step of flow.steps) {
    elements.push({
      data: {
        id: `step:${step.n}`,
        source: `actor:${step.from}`,
        target: `actor:${step.to}`,
        step: String(step.n),
        layer: step.layer,
        edgeLabel: edgeLabel(step),
      },
    });
  }

  return elements;
}

function edgeLabel(step: FlowStep): string {
  const n = String(step.n).padStart(2, '0');
  if (step.messageShort) {
    const ack = /pacs\.002/i.test(step.messageShort) ? ' ack' : '';
    return `${n} ${step.messageShort}${ack}`;
  }
  if (step.method) return `${n} ${step.method}`;
  return `${n} ${truncate(step.label, 22)}`;
}

function nodeKind(id: ActorId): string {
  if (id === 'psu') return 'user';
  if (id === 'csm' || id === 'rail') return 'csm';
  if (id === 'scheme' || id === 'tpp' || id === 'sca') return 'scheme';
  return 'bank';
}

function layoutActors(actors: ActorId[]): Map<ActorId, { x: number; y: number }> {
  const rank: Record<ActorId, number> = {
    psu: 0,
    tpp: 1,
    scheme: 1,
    sca: 2,
    aspsp: 3,
    csm: 4,
    rail: 4,
    beneficiary: 5,
  };

  const byRank = new Map<number, ActorId[]>();
  for (const id of actors) {
    const r = rank[id] ?? 3;
    const list = byRank.get(r) ?? [];
    list.push(id);
    byRank.set(r, list);
  }

  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const map = new Map<ActorId, { x: number; y: number }>();
  const colGap = 180;
  const rowGap = 140;

  ranks.forEach((r, col) => {
    const column = byRank.get(r) ?? [];
    column.forEach((id, row) => {
      const offset = ((column.length - 1) * rowGap) / 2;
      map.set(id, { x: col * colGap, y: row * rowGap - offset });
    });
  });

  return map;
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
