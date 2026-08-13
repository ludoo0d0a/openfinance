import { useEffect, useMemo, useRef } from 'react';
import cytoscape, { type Core, type ElementDefinition, type Position } from 'cytoscape';
import { useNavigate } from 'react-router-dom';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';

const RAILS = [
  { id: 'rail:sepa', label: 'SEPA SCT', href: '/flows/clearing-sct-happy-path' },
  { id: 'rail:sctinst', label: 'SCT Inst / TIPS', href: '/flows/sct-inst-happy-path' },
  { id: 'rail:wero', label: 'Wero / EPI', href: '/flows/wero-a2a-payment' },
  { id: 'rail:sic', label: 'SIC CHF', href: '/flows/sic-chf-credit' },
  { id: 'rail:eurosic', label: 'euroSIC', href: '/flows/eurosic-eur-credit' },
  { id: 'rail:sicip', label: 'SIC IP', href: '/flows/sic-ip-instant' },
] as const;

const AREA_ORDER = ['pain', 'pacs', 'camt', 'acmt'] as const;

const STANDARD_LABEL: Record<string, string> = {
  'berlin-group': 'Berlin Group',
  stet: 'STET',
  'uk-open-banking': 'UK Open Banking',
  'polish-api': 'PolishAPI',
  'czech-obs': 'Czech OBS',
  'swiss-sps': 'Swiss SPS',
  wero: 'Wero',
  'sct-inst': 'SCT Inst',
};

const COL_X = { standard: 110, message: 430, rail: 780 } as const;
const MSG_COL_GAP = 118;
const ROW = { standard: 64, message: 44, rail: 64, band: 28 } as const;

function inferArea(short: string): string {
  const known = ISO_MESSAGES.find((m) => m.short === short);
  if (known) return known.area;
  const prefix = short.split('.')[0];
  return AREA_ORDER.includes(prefix as (typeof AREA_ORDER)[number]) ? prefix : 'other';
}

function railForFlow(flow: (typeof FLOWS)[number]): string | null {
  const tags = flow.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes('sic-ip') || t === 'sic-ip')) return 'rail:sicip';
  if (tags.some((t) => t.includes('eurosic'))) return 'rail:eurosic';
  if (tags.some((t) => t === 'sic' || t.includes('chf'))) return 'rail:sic';
  if (tags.some((t) => t.includes('wero') || t.includes('epi'))) return 'rail:wero';
  if (tags.some((t) => t.includes('sct-inst') || t.includes('tips') || t === 'instant')) return 'rail:sctinst';
  if (flow.category === 'clearing' || flow.category === 'exception' || flow.category === 'payment-initiation') {
    return 'rail:sepa';
  }
  return null;
}

function stackColumn(
  ids: string[],
  x: number,
  y0: number,
  row: number,
  positions: Map<string, Position>,
) {
  ids.forEach((id, i) => positions.set(id, { x, y: y0 + i * row }));
}

/**
 * Three-column organization chart: API standards → ISO messages (by area) → rails.
 * Positions are preset so boxes never collide; edges only hop one layer.
 */
function layoutPositions(nodeIds: { standards: string[]; messages: { id: string; area: string }[]; rails: string[] }) {
  const positions = new Map<string, Position>();
  const messagesByArea = new Map<string, string[]>();
  for (const area of [...AREA_ORDER, 'other']) messagesByArea.set(area, []);
  for (const m of nodeIds.messages) {
    const bucket = messagesByArea.get(m.area) ?? messagesByArea.get('other')!;
    bucket.push(m.id);
  }

  let msgY = 36;
  const bandIds: { id: string; area: string }[] = [];
  for (const area of [...AREA_ORDER, 'other']) {
    const ids = messagesByArea.get(area) ?? [];
    if (ids.length === 0) continue;
    const bandId = `band:${area}`;
    bandIds.push({ id: bandId, area });
    positions.set(bandId, { x: COL_X.message + MSG_COL_GAP / 2, y: msgY });
    msgY += ROW.band;
    ids.forEach((id, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      positions.set(id, { x: COL_X.message + col * MSG_COL_GAP, y: msgY + row * ROW.message });
    });
    msgY += Math.ceil(ids.length / 2) * ROW.message + 18;
  }

  const midY = msgY / 2;
  const stdHeight = Math.max(0, nodeIds.standards.length - 1) * ROW.standard;
  const railHeight = Math.max(0, nodeIds.rails.length - 1) * ROW.rail;
  stackColumn(nodeIds.standards, COL_X.standard, Math.max(48, midY - stdHeight / 2), ROW.standard, positions);
  stackColumn(nodeIds.rails, COL_X.rail, Math.max(48, midY - railHeight / 2), ROW.rail, positions);

  return { positions, bandIds };
}

function buildElements(): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (source: string, target: string, hop: 'api' | 'clearing') => {
    const key = `${source}->${target}`;
    if (edgeKeys.has(key) || source === target) return;
    edgeKeys.add(key);
    elements.push({ data: { id: key, source, target, hop } });
  };

  const usedShorts = new Set<string>();
  for (const m of ISO_MESSAGES) {
    if (m.flows.length > 0) usedShorts.add(m.short);
  }
  for (const flow of FLOWS) {
    for (const step of flow.steps) {
      if (step.messageShort) usedShorts.add(step.messageShort);
    }
  }

  const standardIds = STANDARDS.map((s) => `standard:${s.id}`);
  const railIds = RAILS.map((r) => r.id);
  const messageNodes = [...usedShorts]
    .sort((a, b) => a.localeCompare(b))
    .map((short) => ({ id: `message:${short}`, short, area: inferArea(short) }));

  const { positions, bandIds } = layoutPositions({
    standards: standardIds,
    messages: messageNodes.map((m) => ({ id: m.id, area: m.area })),
    rails: railIds,
  });

  const placed = (id: string, data: ElementDefinition['data']): ElementDefinition => ({
    data,
    position: positions.get(id),
    grabbable: data.kind === 'band' ? false : true,
    selectable: data.kind !== 'band',
  });

  for (const s of STANDARDS) {
    const id = `standard:${s.id}`;
    elements.push(
      placed(id, {
        id,
        label: STANDARD_LABEL[s.id] ?? s.name,
        kind: 'standard',
        href: `/standards/${s.id}`,
      }),
    );
  }

  for (const rail of RAILS) {
    elements.push(
      placed(rail.id, {
        id: rail.id,
        label: rail.label,
        kind: 'rail',
        href: rail.href,
      }),
    );
  }

  for (const band of bandIds) {
    elements.push(
      placed(band.id, {
        id: band.id,
        label: band.area.toUpperCase(),
        kind: 'band',
      }),
    );
  }

  for (const m of messageNodes) {
    elements.push(
      placed(m.id, {
        id: m.id,
        label: m.short,
        kind: 'message',
        area: m.area,
        href: `/messages/${m.short}`,
      }),
    );
  }

  // One hop per layer: standard → message → rail. Skip standard→rail triangles.
  for (const flow of FLOWS) {
    const standardNode = `standard:${flow.standardId}`;
    const rail = railForFlow(flow);
    const weroSettlesInst =
      flow.tags.some((t) => t.toLowerCase().includes('wero')) && rail === 'rail:wero';

    for (const step of flow.steps) {
      if (!step.messageShort) continue;
      const messageNode = `message:${step.messageShort}`;
      addEdge(standardNode, messageNode, 'api');
      if (rail) addEdge(messageNode, rail, 'clearing');
      if (weroSettlesInst) addEdge(messageNode, 'rail:sctinst', 'clearing');
    }
  }

  return elements;
}

/**
 * Network view of how API standards, ISO messages and clearing rails connect.
 * Sequence detail stays on FlowCanvas; this answers "what talks to what?".
 */
export function InteropGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const navigate = useNavigate();
  const elements = useMemo(() => buildElements(), []);

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
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'JetBrains Mono, ui-monospace, monospace',
            'font-size': '10px',
            color: '#0d1420',
            'text-wrap': 'wrap',
            'text-max-width': '110px',
            'border-width': 1,
            'border-color': '#c8d1de',
            width: '118px',
            height: '42px',
            shape: 'round-rectangle',
          },
        },
        {
          selector: 'node[kind = "standard"]',
          style: {
            'background-color': '#dde5fb',
            'border-color': '#1f4fd8',
            'font-family': 'IBM Plex Sans, sans-serif',
            'font-size': '11px',
            width: '138px',
            height: '44px',
          },
        },
        {
          selector: 'node[kind = "rail"]',
          style: {
            'background-color': '#e4dffb',
            'border-color': '#5b45d6',
            width: '128px',
            height: '44px',
          },
        },
        {
          selector: 'node[kind = "message"]',
          style: {
            'background-color': '#ffffff',
            'border-color': '#5b6779',
            width: '92px',
            height: '30px',
            'font-size': '10px',
          },
        },
        {
          selector: 'node[kind = "band"]',
          style: {
            'background-opacity': 0,
            'border-width': 0,
            width: '200px',
            height: '18px',
            'font-family': 'IBM Plex Sans, sans-serif',
            'font-size': '10px',
            'font-weight': 600,
            color: '#5b6779',
            label: 'data(label)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.15,
            'line-color': '#c8d1de',
            'target-arrow-color': '#c8d1de',
            'target-arrow-shape': 'triangle',
            'curve-style': 'taxi',
            'taxi-direction': 'horizontal',
            'taxi-turn': 28,
            'arrow-scale': 0.7,
            opacity: 0.55,
          },
        },
        {
          selector: 'edge[hop = "clearing"]',
          style: {
            'line-color': '#b7aee8',
            'target-arrow-color': '#b7aee8',
          },
        },
        {
          selector: '.faded',
          style: { opacity: 0.12 },
        },
        {
          selector: 'edge.highlight',
          style: {
            opacity: 1,
            width: 1.8,
            'line-color': '#1f4fd8',
            'target-arrow-color': '#1f4fd8',
            'z-index': 10,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 2,
            'border-color': '#0d1420',
          },
        },
      ],
      layout: {
        name: 'preset',
        padding: 36,
        fit: true,
        animate: false,
      },
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.25,
      autoungrabify: true,
    });

    cy.on('tap', 'node', (evt) => {
      const href = evt.target.data('href') as string | undefined;
      if (href) navigate(href);
    });

    cy.on('mouseover', 'node[kind != "band"]', (evt) => {
      const node = evt.target;
      cy.elements().addClass('faded');
      node.removeClass('faded');
      node.neighborhood().removeClass('faded');
      node.connectedEdges().addClass('highlight').removeClass('faded');
    });
    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded highlight');
    });

    cy.fit(undefined, 28);
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [elements, navigate]);

  return (
    <div className="relative">
      <div className="mb-2 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>API standards</span>
        <span className="text-center">ISO 20022</span>
        <span className="text-right">Clearing rails</span>
      </div>
      <div
        ref={containerRef}
        className="h-[min(78vh,720px)] w-full border border-rule bg-surface"
        role="img"
        aria-label="Interop map of standards, ISO 20022 messages and clearing rails"
      />
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
        <Legend swatch="bg-signal-soft border-signal" label="API standard" />
        <Legend swatch="bg-violet-soft border-violet" label="Clearing / scheme rail" />
        <Legend swatch="bg-surface border-muted" label="ISO 20022 message" />
        <span>Hover to trace · click to open</span>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-5 border ${swatch}`} />
      {label}
    </span>
  );
}
