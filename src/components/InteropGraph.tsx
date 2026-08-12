import { useEffect, useMemo, useRef } from 'react';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import { useNavigate } from 'react-router-dom';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';

const RAILS = [
  { id: 'rail:sepa', label: 'SEPA SCT', href: '/flows/clearing-sct-happy-path' },
  { id: 'rail:sctinst', label: 'SCT Inst / TIPS', href: '/flows/sct-inst-happy-path' },
  { id: 'rail:sic', label: 'SIC CHF', href: '/flows/sic-chf-credit' },
  { id: 'rail:eurosic', label: 'euroSIC', href: '/flows/eurosic-eur-credit' },
  { id: 'rail:sicip', label: 'SIC IP', href: '/flows/sic-ip-instant' },
  { id: 'rail:wero', label: 'Wero / EPI', href: '/flows/wero-a2a-payment' },
] as const;

function buildElements(): ElementDefinition[] {
  const elements: ElementDefinition[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (source: string, target: string, label?: string) => {
    const key = `${source}->${target}:${label ?? ''}`;
    if (edgeKeys.has(key) || source === target) return;
    edgeKeys.add(key);
    elements.push({
      data: { id: key, source, target, label: label ?? '' },
    });
  };

  for (const s of STANDARDS) {
    elements.push({
      data: {
        id: `standard:${s.id}`,
        label: s.name,
        kind: 'standard',
        href: `/standards/${s.id}`,
      },
    });
  }

  for (const rail of RAILS) {
    elements.push({
      data: {
        id: rail.id,
        label: rail.label,
        kind: 'rail',
        href: rail.href,
      },
    });
  }

  // Keep the map readable: only messages that appear in at least one flow.
  const usedMessages = ISO_MESSAGES.filter((m) => m.flows.length > 0);
  for (const m of usedMessages) {
    elements.push({
      data: {
        id: `message:${m.short}`,
        label: m.short,
        kind: 'message',
        href: `/messages/${m.short}`,
      },
    });
  }

  for (const flow of FLOWS) {
    const standardNode = `standard:${flow.standardId}`;
    const tags = flow.tags.map((t) => t.toLowerCase());

    if (tags.some((t) => t.includes('sic-ip') || t === 'sic-ip')) {
      addEdge(standardNode, 'rail:sicip', flow.name);
    } else if (tags.some((t) => t.includes('eurosic'))) {
      addEdge(standardNode, 'rail:eurosic', flow.name);
    } else if (tags.some((t) => t === 'sic' || t.includes('chf'))) {
      addEdge(standardNode, 'rail:sic', flow.name);
    } else if (tags.some((t) => t.includes('wero') || t.includes('epi'))) {
      addEdge(standardNode, 'rail:wero', flow.name);
      addEdge(standardNode, 'rail:sctinst', 'settles on SCT Inst');
    } else if (tags.some((t) => t.includes('sct-inst') || t.includes('tips') || t === 'instant')) {
      addEdge(standardNode, 'rail:sctinst', flow.name);
    } else if (
      flow.category === 'clearing' ||
      flow.category === 'exception' ||
      flow.category === 'payment-initiation'
    ) {
      addEdge(standardNode, 'rail:sepa', flow.name);
    }

    for (const step of flow.steps) {
      if (!step.messageShort) continue;
      const messageNode = `message:${step.messageShort}`;
      addEdge(standardNode, messageNode, step.messageShort);

      if (tags.some((t) => t.includes('sic-ip'))) addEdge(messageNode, 'rail:sicip');
      else if (tags.some((t) => t.includes('eurosic'))) addEdge(messageNode, 'rail:eurosic');
      else if (tags.some((t) => t === 'sic' || t.includes('chf'))) addEdge(messageNode, 'rail:sic');
      else if (tags.some((t) => t.includes('wero'))) {
        addEdge(messageNode, 'rail:wero');
        addEdge(messageNode, 'rail:sctinst');
      } else if (tags.some((t) => t.includes('sct-inst') || t.includes('tips'))) addEdge(messageNode, 'rail:sctinst');
      else if (step.layer === 'clearing') addEdge(messageNode, 'rail:sepa');
    }
  }

  // Explicit scheme ↔ rail links.
  addEdge('standard:wero', 'rail:sctinst', 'SCT Inst settlement');
  addEdge('standard:sct-inst', 'rail:sctinst');
  addEdge('standard:berlin-group', 'rail:sctinst', 'instant-sepa-credit-transfers');
  addEdge('standard:swiss-sps', 'rail:sic');
  addEdge('standard:swiss-sps', 'rail:eurosic');
  addEdge('standard:swiss-sps', 'rail:sicip');

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
            width: '150px',
            height: '48px',
          },
        },
        {
          selector: 'node[kind = "rail"]',
          style: {
            'background-color': '#e4dffb',
            'border-color': '#5b45d6',
            width: '120px',
            height: '44px',
          },
        },
        {
          selector: 'node[kind = "message"]',
          style: {
            'background-color': '#ffffff',
            'border-color': '#5b6779',
            width: '88px',
            height: '32px',
            'font-size': '10px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.2,
            'line-color': '#c8d1de',
            'target-arrow-color': '#c8d1de',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
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
        name: 'cose',
        animate: false,
        padding: 28,
        nodeRepulsion: () => 9000,
        idealEdgeLength: () => 90,
        nestingFactor: 1.2,
      },
      minZoom: 0.35,
      maxZoom: 2.4,
      wheelSensitivity: 0.25,
    });

    cy.on('tap', 'node', (evt) => {
      const href = evt.target.data('href') as string | undefined;
      if (href) navigate(href);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [elements, navigate]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[min(70vh,640px)] w-full border border-rule bg-surface"
        role="img"
        aria-label="Interop map of standards, ISO 20022 messages and clearing rails"
      />
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
        <Legend swatch="bg-signal-soft border-signal" label="API standard" />
        <Legend swatch="bg-violet-soft border-violet" label="Clearing / scheme rail" />
        <Legend swatch="bg-surface border-muted" label="ISO 20022 message" />
        <span>Click a node to open it</span>
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
