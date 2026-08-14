import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActorId, Flow } from '@/types';
import { ACTORS } from '@/data/flows';
import { ActorIcon } from '@/lib/icons';
import { ACTOR_ICON, actorIconDataUri } from '@/lib/iconMeta';
import { ACTOR_H, ACTOR_W, layoutEntityFlow, tokenOnHop } from '@/lib/entityFlowLayout';
import { ENTITY_LABEL_FR, useI18n, useT } from '@/i18n';

interface Props {
  flow: Flow;
  selectedStep: number;
  onSelectStep: (n: number) => void;
}

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

const HOPS_PER_SEC = 0.85;

/**
 * Entity / transaction diagram: actors as boxes, each hop as an arrow with a
 * compact numbered tag (pacs.008, POST, …). A request token can replay the path.
 */
export function EntityFlowDiagram({ flow, selectedStep, onSelectStep }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const entityLabel = locale === 'fr' ? ENTITY_LABEL_FR : ENTITY_LABEL_EN;
  const layout = useMemo(() => layoutEntityFlow(flow), [flow]);
  const maxProgress = layout.hops.length;

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);
  const lastHopRef = useRef(0);
  const onSelectRef = useRef(onSelectStep);
  onSelectRef.current = onSelectStep;
  progressRef.current = progress;

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
    lastHopRef.current = 0;
  }, [flow.id]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = Math.min(maxProgress, progressRef.current + dt * HOPS_PER_SEC);
      setProgress(next);
      const hopN = hopAtProgress(next, maxProgress);
      if (hopN && hopN !== lastHopRef.current) {
        lastHopRef.current = hopN;
        onSelectRef.current(hopN);
      }
      if (next >= maxProgress) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, maxProgress]);

  const activeHopIndex =
    layout.hops.length === 0
      ? -1
      : Math.min(layout.hops.length - 1, Math.floor(Math.min(progress, Math.max(0, maxProgress - 0.0001))));
  const tokenT = progress >= maxProgress ? 1 : progress % 1;
  const token =
    activeHopIndex >= 0 && (playing || progress > 0)
      ? tokenOnHop(layout.hops[activeHopIndex], progress === 0 ? 0 : tokenT)
      : null;

  function play() {
    if (progressRef.current >= maxProgress) {
      progressRef.current = 0;
      setProgress(0);
    }
    setPlaying(true);
  }

  function seek(value: number) {
    setPlaying(false);
    setProgress(value);
    const hopN = hopAtProgress(value, maxProgress);
    if (hopN) {
      lastHopRef.current = hopN;
      onSelectStep(hopN);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto scroll-paper">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          role="img"
          aria-label={`${flow.name} transaction flow between entities`}
          className="max-w-none"
        >
          <defs>
            <marker
              id={`${flow.id}-arrow-api`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,1 L9,5 L0,9 z" fill={LAYER_COLOR.api} />
            </marker>
            <marker
              id={`${flow.id}-arrow-clearing`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,1 L9,5 L0,9 z" fill={LAYER_COLOR.clearing} />
            </marker>
            <marker
              id={`${flow.id}-arrow-selected`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,1 L9,5 L0,9 z" fill="#0d1420" />
            </marker>
          </defs>

          {layout.hops.map((hop) => {
            const selected = hop.step.n === selectedStep;
            const color = selected ? '#0d1420' : LAYER_COLOR[hop.step.layer];
            const marker = selected
              ? `url(#${flow.id}-arrow-selected)`
              : `url(#${flow.id}-arrow-${hop.step.layer})`;
            return (
              <g
                key={`arrow-${hop.step.n}`}
                className="cursor-pointer"
                onClick={() => {
                  setPlaying(false);
                  onSelectStep(hop.step.n);
                }}
              >
                <path d={hop.path} fill="none" stroke="transparent" strokeWidth="14" />
                <path
                  d={hop.path}
                  fill="none"
                  stroke={color}
                  strokeWidth={selected ? 2.4 : 1.5}
                  markerEnd={marker}
                />
              </g>
            );
          })}

          {layout.actors.map((actor) => {
            const meta = entityLabel[actor.id] ?? {
              title: ACTORS[actor.id]?.label ?? actor.id,
              role: ACTORS[actor.id]?.sublabel ?? '',
            };
            const kind = nodeKind(actor.id);
            const palette = kindColor(kind);
            return (
              <g key={actor.id}>
                <rect
                  x={actor.x - ACTOR_W / 2}
                  y={actor.y - ACTOR_H / 2}
                  width={ACTOR_W}
                  height={ACTOR_H}
                  rx={4}
                  fill={palette.bg}
                  stroke={palette.border}
                  strokeWidth="1.5"
                />
                <image
                  href={actorIconDataUri(actor.id)}
                  x={actor.x - 18}
                  y={actor.y - 28}
                  width={36}
                  height={36}
                />
                <text
                  x={actor.x}
                  y={actor.y + 22}
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                  fontSize="11"
                  fontWeight="600"
                  fill="#0d1420"
                >
                  {meta.title}
                </text>
              </g>
            );
          })}

          {layout.hops.map((hop) => {
            const selected = hop.step.n === selectedStep;
            const color = selected ? '#0d1420' : LAYER_COLOR[hop.step.layer];
            return (
              <g
                key={`tag-${hop.step.n}`}
                className="cursor-pointer"
                onClick={() => {
                  setPlaying(false);
                  onSelectStep(hop.step.n);
                }}
              >
                <title>{`${String(hop.step.n).padStart(2, '0')} ${hop.step.label}`}</title>
                <rect
                  x={hop.tag.x - hop.tagWidth / 2}
                  y={hop.tag.y - 10}
                  width={hop.tagWidth}
                  height={20}
                  rx={3}
                  fill={selected ? '#0d1420' : '#ffffff'}
                  stroke={color}
                  strokeWidth="1.25"
                />
                <text
                  x={hop.tag.x}
                  y={hop.tag.y + 4}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fontWeight={selected ? 700 : 600}
                  fill={selected ? '#ffffff' : color}
                >
                  {hop.tagLabel}
                </text>
              </g>
            );
          })}

          {token && (
            <g>
              <circle cx={token.x} cy={token.y} r={9} fill="#0d1420" stroke="#ffffff" strokeWidth="2" />
              <circle cx={token.x} cy={token.y} r={3.5} fill="#d5f0e5" />
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => (playing ? setPlaying(false) : play())}
          className="border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white"
        >
          {playing ? t('flow.pause') : t('flow.runScenario')}
        </button>
        <button
          type="button"
          onClick={() => seek(0)}
          className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest"
        >
          {t('flow.restart')}
        </button>
        <label className="flex min-w-[180px] flex-1 items-center gap-2 text-[11px] text-muted">
          <span className="font-mono uppercase tracking-wider">{t('flow.playback')}</span>
          <input
            type="range"
            min={0}
            max={maxProgress}
            step={0.01}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1.5 w-full accent-ink"
            aria-label={t('flow.playback')}
          />
          <span className="w-10 font-mono tnum">
            {String(hopAtProgress(progress, maxProgress) ?? 0).padStart(2, '0')}
          </span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {layout.actors.map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <ActorIcon actor={a.id} size={12} />
            <span className="font-medium text-ink">{ACTOR_ICON[a.id].label}</span>
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
        <span>{t('flow.clickMessage')}</span>
      </div>
    </div>
  );
}

function hopAtProgress(progress: number, max: number): number | undefined {
  if (max <= 0) return undefined;
  if (progress <= 0) return 1;
  if (progress >= max) return max;
  return Math.min(max, Math.floor(progress) + 1);
}

function nodeKind(id: ActorId): string {
  if (id === 'psu') return 'user';
  if (id === 'csm' || id === 'rail') return 'csm';
  if (id === 'scheme' || id === 'tpp' || id === 'sca') return 'scheme';
  return 'bank';
}

function kindColor(kind: string): { border: string; bg: string } {
  if (kind === 'bank') return { border: '#1f4fd8', bg: '#dde5fb' };
  if (kind === 'csm') return { border: '#5b45d6', bg: '#e4dffb' };
  if (kind === 'user') return { border: '#0b8f63', bg: '#d5f0e5' };
  return { border: '#b26b00', bg: '#f9ecd4' };
}
