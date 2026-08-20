import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LiveAppFrame } from '@/components/LiveAppFrame';
import { LiveExplainer, resolveLiveBeat } from '@/components/LiveExplainer';
import {
  LIFE_SCENES,
  lifeScenarioById,
  lifeSceneById,
  scenariosForScene,
} from '@/data/lifeScenes';
import { cn } from '@/lib/cn';
import { useI18n, useT } from '@/i18n';
import type { LifeOutcome, LifeSceneId } from '@/types';
import { NotFoundView } from './NotFoundView';

const SCENE_IDS: LifeSceneId[] = ['shop', 'stream', 'wallet', 'receive', 'bank'];

export function LiveView() {
  const { sceneId, scenarioId } = useParams();

  useEffect(() => {
    document.title = 'OpenFinance — Live showcase';
  }, []);

  if (!sceneId) return <LiveHub />;

  if (!SCENE_IDS.includes(sceneId as LifeSceneId)) return <NotFoundView />;

  const scene = lifeSceneById(sceneId)!;
  if (!scenarioId) {
    return <LiveScenePicker sceneId={scene.id} />;
  }

  const scenario = lifeScenarioById(scenarioId);
  if (!scenario || scenario.sceneId !== scene.id) return <NotFoundView />;

  return <LivePlayer sceneId={scene.id} scenarioId={scenario.id} />;
}

function LiveHub() {
  const t = useT();
  const { locale } = useI18n();

  return (
    <div className="page-fluid lg:py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('live.eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t('live.title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('live.lead')}</p>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LIFE_SCENES.map((scene) => (
          <li key={scene.id}>
            <Link
              to={`/live/${scene.id}`}
              className="block h-full border border-rule bg-surface px-4 py-4 hover:border-ink"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {scene.brand[locale]}
              </p>
              <h2 className="mt-1 text-[16px] font-semibold">{scene.title[locale]}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{scene.blurb[locale]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveScenePicker({ sceneId }: { sceneId: LifeSceneId }) {
  const t = useT();
  const { locale } = useI18n();
  const scene = lifeSceneById(sceneId)!;
  const scenarios = scenariosForScene(sceneId);

  return (
    <div className="page-fluid lg:py-10">
      <p className="text-[13px]">
        <Link to="/live" className="text-signal hover:underline">
          {t('live.backHub')}
        </Link>
      </p>
      <header className="mt-4 max-w-3xl">
        <p className="eyebrow">{scene.brand[locale]}</p>
        <h1 className="mt-2 text-3xl font-bold">{scene.title[locale]}</h1>
        <p className="mt-3 text-[15px] text-muted">{scene.blurb[locale]}</p>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {scenarios.map((s) => (
          <li key={s.id}>
            <Link
              to={`/live/${sceneId}/${s.id}`}
              className="block h-full border border-rule bg-surface px-4 py-4 hover:border-ink"
            >
              <div className="flex items-center gap-2">
                <OutcomeChip outcome={s.outcome} />
                <h2 className="text-[15px] font-semibold">{s.title[locale]}</h2>
              </div>
              <p className="mt-2 text-[13px] text-muted">{s.blurb[locale]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LivePlayer({ sceneId, scenarioId }: { sceneId: LifeSceneId; scenarioId: string }) {
  const t = useT();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const scene = lifeSceneById(sceneId)!;
  const scenario = lifeScenarioById(scenarioId)!;
  const siblings = scenariosForScene(sceneId);

  const beatIndex = useMemo(() => {
    const raw = Number(searchParams.get('beat'));
    if (!Number.isInteger(raw) || raw < 0) return 0;
    return Math.min(raw, scenario.beats.length - 1);
  }, [searchParams, scenario.beats.length]);

  const beat = scenario.beats[beatIndex]!;
  const resolved = useMemo(() => resolveLiveBeat(beat, scenario), [beat, scenario]);

  function goBeat(n: number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (n <= 0) next.delete('beat');
        else next.set('beat', String(n));
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="page-fluid lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px]">
          <Link to="/live" className="text-signal hover:underline">
            {t('live.backHub')}
          </Link>
          <span className="text-muted"> · </span>
          <Link to={`/live/${sceneId}`} className="text-signal hover:underline">
            {scene.title[locale]}
          </Link>
        </p>
        <OutcomeChip outcome={scenario.outcome} />
      </div>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">{scenario.title[locale]}</h1>
        <p className="mt-2 text-[14px] text-muted">{scenario.blurb[locale]}</p>
      </header>

      {siblings.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {siblings.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate(`/live/${sceneId}/${s.id}`)}
              className={cn(
                'border px-2.5 py-1 font-mono text-[11px]',
                s.id === scenarioId ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink',
              )}
            >
              {outcomeShort(s.outcome, t)} · {s.title[locale]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LiveAppFrame
          sceneId={sceneId}
          brand={scene.brand}
          screen={beat.screen}
          consumer={beat.consumer}
          outcome={scenario.outcome}
          stepLabel={
            resolved.flowId && resolved.step
              ? `${resolved.flowId} · ${resolved.step}`
              : resolved.beat.hopId
          }
        />
        <LiveExplainer
          scenario={scenario}
          resolved={resolved}
          bankDeepLinkId={
            beat.screen === 'receipt' || beat.screen === 'credited'
              ? scenario.bankDeepLinkId
              : undefined
          }
        />
      </div>

      <nav
        className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border border-rule bg-surface px-4 py-3"
        aria-label={t('live.beatsNav')}
      >
        <button
          type="button"
          disabled={beatIndex <= 0}
          onClick={() => goBeat(beatIndex - 1)}
          className="border border-rule px-3 py-1.5 text-[13px] disabled:opacity-40 hover:border-ink"
        >
          {t('live.prev')}
        </button>
        <ol className="flex flex-wrap justify-center gap-1.5">
          {scenario.beats.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                aria-label={t('live.beatN', { n: i + 1 })}
                aria-current={i === beatIndex ? 'step' : undefined}
                onClick={() => goBeat(i)}
                className={cn(
                  'h-2.5 w-2.5 border border-ink',
                  i === beatIndex ? 'bg-ink' : 'bg-transparent hover:bg-ink/20',
                )}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={beatIndex >= scenario.beats.length - 1}
          onClick={() => goBeat(beatIndex + 1)}
          className="border border-rule px-3 py-1.5 text-[13px] disabled:opacity-40 hover:border-ink"
        >
          {t('live.next')}
        </button>
      </nav>
    </div>
  );
}

function OutcomeChip({ outcome }: { outcome: LifeOutcome }) {
  const t = useT();
  const color =
    outcome === 'happy'
      ? 'border-jade text-jade'
      : outcome === 'reject' || outcome === 'cancel'
        ? 'border-vermillion text-vermillion'
        : outcome === 'timeout' || outcome === 'recall'
          ? 'border-ochre text-ochre'
          : 'border-rule text-muted';
  return (
    <span className={cn('border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest', color)}>
      {outcomeShort(outcome, t)}
    </span>
  );
}

function outcomeShort(outcome: LifeOutcome, t: (k: string) => string): string {
  return t(`live.outcome.${outcome}`);
}
