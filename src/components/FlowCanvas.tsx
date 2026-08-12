import { useMemo } from 'react';
import type { ActorId, Flow, FlowStep } from '@/types';
import { ACTORS } from '@/data/flows';
import { ACTOR_ICON } from '@/lib/iconMeta';
import { ACTORS_FR, useI18n } from '@/i18n';

interface Props {
  flow: Flow;
  selectedStep: number;
  onSelectStep: (n: number) => void;
}

const LANE_WIDTH = 152;
const HEADER_HEIGHT = 72;
const ROW_HEIGHT = 62;
const PADDING_X = 24;
const PADDING_BOTTOM = 28;

const layerStroke: Record<FlowStep['layer'], string> = {
  api: 'var(--color-signal)',
  clearing: 'var(--color-violet)',
};

const ACTOR_SVG_PATH: Record<ActorId, string> = {
  psu: 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-4 3.5-7 8-7s8 3 8 7',
  tpp: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  aspsp: 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6',
  beneficiary: 'M6 22V9l6-5 6 5v13M10 22v-5h4v5',
  sca: 'M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4zM9 12l2 2 4-4',
  csm: 'M9 9h6v6H9zM9 12H4m16 0h-5M12 9V4m0 16v-5',
  rail: 'M6 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.2 11l7.3-3.8M8.2 13l7.3 3.8',
  scheme: 'M19 7V5a2 2 0 0 0-2-2H5a2 2 0 1 0 0 4h14a2 2 0 1 1 0 4H5a2 2 0 1 0 0 4h12a2 2 0 0 0 2-2v-2',
};


/**
 * A hand-rolled sequence diagram rather than a generic graph library.
 * Payments people read swimlanes: who sent what to whom, in order, with the
 * layer boundary visible. A force-directed blob would lose all of that.
 */
export function FlowCanvas({ flow, selectedStep, onSelectStep }: Props) {
  const { locale } = useI18n();
  const actorCopy = locale === 'fr' ? ACTORS_FR : ACTORS;
  const lanes = flow.actors;
  const laneX = useMemo(() => {
    const map = new Map<ActorId, number>();
    lanes.forEach((id, i) => map.set(id, PADDING_X + LANE_WIDTH / 2 + i * LANE_WIDTH));
    return map;
  }, [lanes]);

  const width = PADDING_X * 2 + lanes.length * LANE_WIDTH;
  const height = HEADER_HEIGHT + flow.steps.length * ROW_HEIGHT + PADDING_BOTTOM;

  // Steps can reference an actor that isn't in the lane list (the PSU appearing
  // in a clearing flow, for instance). Fall back to the nearest lane so the
  // arrow still renders instead of collapsing to x=0.
  const xOf = (actor: ActorId) => laneX.get(actor) ?? PADDING_X + LANE_WIDTH / 2 + (lanes.length - 1) * LANE_WIDTH;

  return (
    <div className="overflow-x-auto scroll-paper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="list"
        aria-label={`${flow.name} — ${flow.steps.length} steps`}
        className="max-w-none"
      >
        <defs>
          <marker id="arrow-api" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L9,5 L0,9 z" fill={layerStroke.api} />
          </marker>
          <marker id="arrow-clearing" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L9,5 L0,9 z" fill={layerStroke.clearing} />
          </marker>
        </defs>

        {/* Lifelines */}
        {lanes.map((id) => (
          <line
            key={`life-${id}`}
            x1={xOf(id)}
            y1={HEADER_HEIGHT - 8}
            x2={xOf(id)}
            y2={height - PADDING_BOTTOM / 2}
            stroke="var(--color-rule)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        {/* Lane headers with icons */}
        {lanes.map((id) => {
          const actor = actorCopy[id] ?? ACTORS[id];
          const meta = ACTOR_ICON[id];
          const x = xOf(id);
          return (
            <g key={`head-${id}`}>
              <rect x={x - LANE_WIDTH / 2 + 8} y={8} width={LANE_WIDTH - 16} height={52} fill="var(--color-ink)" rx="2" />
              <circle cx={x} cy={24} r={11} fill={meta.bg} stroke={meta.color} strokeWidth="1.5" />
              <g
                transform={`translate(${x - 7}, 17) scale(0.58)`}
                fill="none"
                stroke={meta.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={ACTOR_SVG_PATH[id]} />
              </g>
              <text
                x={x}
                y={46}
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="var(--font-display)"
                fontSize="12"
                fontWeight="600"
              >
                {actor.label}
              </text>
              <text
                x={x}
                y={56}
                textAnchor="middle"
                fill="var(--color-muted-dark)"
                fontFamily="var(--font-mono)"
                fontSize="7.5"
                letterSpacing="0.06em"
              >
                {meta.label.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Steps */}
        {flow.steps.map((step, i) => {
          const y = HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2;
          const from = xOf(step.from);
          const to = xOf(step.to);
          const selected = step.n === selectedStep;
          const stroke = layerStroke[step.layer];
          const selfCall = from === to;

          const midX = (from + to) / 2;
          const labelAnchor = selfCall ? 'start' : 'middle';
          const labelX = selfCall ? from + 26 : midX;

          return (
            <g
              key={step.n}
              role="listitem"
              tabIndex={0}
              aria-current={selected}
              aria-label={`Step ${step.n}: ${step.label}`}
              onClick={() => onSelectStep(step.n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStep(step.n);
                }
              }}
              className="cursor-pointer"
            >
              <rect
                x={PADDING_X - 12}
                y={y - ROW_HEIGHT / 2 + 4}
                width={width - PADDING_X * 2 + 24}
                height={ROW_HEIGHT - 8}
                fill={selected ? 'var(--color-signal-soft)' : 'transparent'}
                stroke={selected ? stroke : 'transparent'}
                strokeWidth="1"
              />

              {/* Step number, outside the lanes */}
              <text
                x={PADDING_X - 4}
                y={y + 4}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--color-muted)"
              >
                {String(step.n).padStart(2, '0')}
              </text>

              {selfCall ? (
                <path
                  d={`M ${from} ${y - 12} C ${from + 34} ${y - 12}, ${from + 34} ${y + 12}, ${from} ${y + 12}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={selected ? 2 : 1.25}
                  markerEnd={`url(#arrow-${step.layer})`}
                />
              ) : (
                <line
                  x1={from}
                  y1={y}
                  x2={to + (to > from ? -8 : 8)}
                  y2={y}
                  stroke={stroke}
                  strokeWidth={selected ? 2 : 1.25}
                  markerEnd={`url(#arrow-${step.layer})`}
                />
              )}

              <text
                x={labelX}
                y={y - 9}
                textAnchor={labelAnchor}
                fontFamily="var(--font-sans)"
                fontSize="11.5"
                fontWeight={selected ? 600 : 450}
                fill="var(--color-ink)"
              >
                {truncate(step.label, selfCall ? 26 : Math.max(18, Math.abs(to - from) / 6.4))}
              </text>

              {(step.method || step.messageShort) && (
                <text
                  x={labelX}
                  y={y + 17}
                  textAnchor={labelAnchor}
                  fontFamily="var(--font-mono)"
                  fontSize="9.5"
                  fill={stroke}
                >
                  {step.method ? `${step.method} ${truncate(step.path ?? '', 30)}` : step.messageShort}
                </text>
              )}

              <circle cx={from} cy={y} r={selected ? 3.5 : 2.5} fill={stroke} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(text: string, max: number) {
  const limit = Math.floor(max);
  return text.length <= limit ? text : `${text.slice(0, Math.max(3, limit - 1))}…`;
}
