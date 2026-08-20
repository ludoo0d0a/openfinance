import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LiveHub } from '@/components/live/LiveHub';
import { LivePlayer } from '@/components/live/LivePlayer';
import { LiveScenePicker } from '@/components/live/LiveScenePicker';
import { lifeScenarioById, lifeSceneById } from '@/data/lifeScenes';
import type { LifeSceneId } from '@/types';
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
