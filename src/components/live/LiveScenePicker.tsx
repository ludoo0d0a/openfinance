import { Link } from 'react-router-dom';
import { OutcomeChip } from '@/components/live/OutcomeChip';
import { lifeSceneById, scenariosForScene } from '@/data/lifeScenes';
import { useI18n, useT } from '@/i18n';
import type { LifeSceneId } from '@/types';

export function LiveScenePicker({ sceneId }: { sceneId: LifeSceneId }) {
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
