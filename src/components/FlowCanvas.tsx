import { useMemo } from 'react';
import type { ActorId, Flow, FlowStep } from '@/types';
import { ACTORS } from '@/data/flows';

interface Props {
  flow: Flow;
  selectedStep: number;
  onSelectStep: (n: number) => void;
}

const LANE_WIDTH = 152;
const HEADER_HEIGHT = 66;
const ROW_HEIGHT = 62;
const PADDING_X = 24;
const PADDING_BOTTOM = 28;

const layerStroke: Record<FlowStep['layer'], string> = {
  api: 'var(--color-signal)',
  clearing: 'var(--color-violet)',
};

/**
 * A hand-rolled sequence diagram rather than a generic graph library.
 * Payments people read swimlanes: who sent what to whom, in order, with the
 * layer boundary visible. A force-directed blob would lose all of that.
 */
export function FlowCanvas({ flow, selectedStep, onSelectStep }: Props) {
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

        {/* Lane headers */}
        {lanes.map((id) => {
          const actor = ACTORS[id];
          return (
            <g key={`head-${id}`}>
              <rect
                x={xOf(id) - LANE_WIDTH / 2 + 8}
                y={12}
                width={LANE_WIDTH - 16}
                height={38}
                fill="var(--color-ink)"
              />
              <text
                x={xOf(id)}
                y={30}
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="var(--font-display)"
                fontSize="13"
                fontWeight="600"
              >
                {actor.label}
              </text>
              <text
                x={xOf(id)}
                y={43}
                textAnchor="middle"
                fill="var(--color-muted-dark)"
                fontFamily="var(--font-mono)"
                fontSize="8"
                letterSpacing="0.08em"
              >
                {actor.sublabel.toUpperCase()}
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
