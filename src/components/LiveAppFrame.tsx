import { PhoneChrome } from '@/components/live/PhoneChrome';
import { ScreenBody } from '@/components/live/ScreenBody';
import { StatusPill } from '@/components/live/StatusPill';
import { useI18n, useT } from '@/i18n';
import type { LifeSceneId, LocalizedText } from '@/types';

interface Props {
  sceneId: LifeSceneId;
  brand: LocalizedText;
  screen: string;
  consumer: LocalizedText;
  outcome: string;
  stepLabel?: string;
}

/** Lightweight fake-app chrome driven by beat.screen. */
export function LiveAppFrame({ sceneId, brand, screen, consumer, outcome, stepLabel }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const failed = outcome === 'reject' || outcome === 'timeout' || outcome === 'cancel' || outcome === 'recall';
  const statusTone =
    screen === 'receipt' || screen === 'credited'
      ? 'ok'
      : screen === 'failed' || (failed && (screen === 'processing' || screen === 'incoming'))
        ? 'bad'
        : 'idle';

  return (
    <section className="panel flex h-full min-h-[28rem] flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div>
          <p className="eyebrow">{t(`live.scene.${sceneId}`)}</p>
          <h3 className="text-sm font-semibold">{brand[locale]}</h3>
        </div>
        <StatusPill tone={statusTone} />
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-paper-raised/40 p-4">
        <PhoneChrome sceneId={sceneId}>
          <ScreenBody screen={screen} line={consumer[locale]} failed={failed} />
        </PhoneChrome>
        {stepLabel && (
          <p className="font-mono text-[11px] text-muted">
            {t('live.beat')} · {stepLabel}
          </p>
        )}
      </div>
    </section>
  );
}
