import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LiveAppFrame } from '@/components/LiveAppFrame';
import { LiveExplainer } from '@/components/LiveExplainer';
import { OutcomeChip } from '@/components/live/OutcomeChip';
import { outcomeShort } from '@/components/live/outcomeShort';
import { resolveLiveBeat } from '@/components/live/resolveLiveBeat';
import { lifeScenarioById, lifeSceneById, scenariosForScene } from '@/data/lifeScenes';
import { cn } from '@/lib/cn';
import { useI18n, useT } from '@/i18n';
import type { LifeSceneId } from '@/types';

export function LivePlayer({ sceneId, scenarioId }: { sceneId: LifeSceneId; scenarioId: string }) {
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
