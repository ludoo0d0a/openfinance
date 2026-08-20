import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import type { LifeSceneId, LocalizedText } from '@/types';
import { useI18n } from '@/i18n';

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
      : screen === 'failed' || failed && (screen === 'processing' || screen === 'incoming')
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

function StatusPill({ tone }: { tone: 'ok' | 'bad' | 'idle' }) {
  const t = useT();
  const label = tone === 'ok' ? t('live.statusOk') : tone === 'bad' ? t('live.statusBad') : t('live.statusIdle');
  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-widest',
        tone === 'ok' && 'text-jade',
        tone === 'bad' && 'text-vermillion',
        tone === 'idle' && 'text-muted',
      )}
    >
      {label}
    </span>
  );
}

function PhoneChrome({ sceneId, children }: { sceneId: LifeSceneId; children: ReactNode }) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-sm flex-1 flex-col border border-ink bg-surface shadow-[4px_4px_0_0_rgba(0,0,0,0.06)]',
        sceneId === 'bank' && 'max-w-md',
      )}
    >
      <div className="flex items-center justify-center border-b border-rule py-2">
        <span className="h-1.5 w-16 rounded-full bg-ink/20" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </div>
  );
}

function ScreenBody({ screen, line, failed }: { screen: string; line: string; failed: boolean }) {
  const t = useT();

  if (screen === 'cart') {
    return (
      <Stack>
        <Label>{t('live.screen.cart')}</Label>
        <Tile>
          <p className="text-[15px] font-semibold">{line}</p>
          <p className="mt-1 font-mono text-[12px] text-muted">SKU · TEE-ORG-M</p>
        </Tile>
        <FakeBtn>{t('live.cta.checkout')}</FakeBtn>
      </Stack>
    );
  }

  if (screen === 'method') {
    return (
      <Stack>
        <Label>{t('live.screen.method')}</Label>
        <p className="text-[14px] leading-relaxed">{line}</p>
        <ul className="space-y-2">
          {[t('live.method.bank'), t('live.method.instant'), t('live.method.wero'), t('live.method.card')].map(
            (m) => (
              <li key={m} className="border border-rule px-3 py-2 font-mono text-[12px]">
                {m}
              </li>
            ),
          )}
        </ul>
      </Stack>
    );
  }

  if (screen === 'sca') {
    return (
      <Stack>
        <Label>{t('live.screen.sca')}</Label>
        <Tile className="border-ochre bg-ochre/10">
          <p className="text-[14px] font-semibold">{t('live.scaTitle')}</p>
          <p className="mt-2 text-[13px] text-muted">{line}</p>
        </Tile>
        <FakeBtn>{t('live.cta.approve')}</FakeBtn>
      </Stack>
    );
  }

  if (screen === 'processing' || screen === 'hub') {
    return (
      <Stack>
        <Label>{screen === 'hub' ? t('live.screen.hub') : t('live.screen.processing')}</Label>
        <div className="flex flex-col items-center gap-3 py-8">
          <span className="h-8 w-8 animate-spin border-2 border-ink border-t-transparent" aria-hidden />
          <p className="text-center text-[14px] leading-relaxed">{line}</p>
        </div>
      </Stack>
    );
  }

  if (screen === 'receipt' || screen === 'credited') {
    return (
      <Stack>
        <Label>{screen === 'credited' ? t('live.screen.credited') : t('live.screen.receipt')}</Label>
        <Tile className="border-jade bg-jade-soft">
          <p className="font-mono text-[11px] uppercase tracking-widest text-jade">{t('live.paid')}</p>
          <p className="mt-2 text-[16px] font-semibold">{line}</p>
        </Tile>
      </Stack>
    );
  }

  if (screen === 'failed') {
    return (
      <Stack>
        <Label>{t('live.screen.failed')}</Label>
        <Tile className="border-vermillion bg-vermillion/10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-vermillion">{t('live.failed')}</p>
          <p className="mt-2 text-[14px]">{line}</p>
        </Tile>
      </Stack>
    );
  }

  if (screen === 'mandate' || screen === 'subscribe') {
    return (
      <Stack>
        <Label>{t('live.screen.mandate')}</Label>
        <Tile>
          <p className="text-[15px] font-semibold">{t('live.noxPlan')}</p>
          <p className="mt-2 text-[13px] text-muted">{line}</p>
        </Tile>
        <FakeBtn>{t('live.cta.mandate')}</FakeBtn>
      </Stack>
    );
  }

  if (screen === 'compose') {
    return (
      <Stack>
        <Label>{t('live.screen.compose')}</Label>
        <Tile>
          <p className="text-[14px]">{line}</p>
        </Tile>
        <FakeBtn>{t('live.cta.send')}</FakeBtn>
      </Stack>
    );
  }

  if (screen === 'notify') {
    return (
      <Stack>
        <Label>{t('live.screen.notify')}</Label>
        <Tile className="border-signal">
          <p className="text-[15px] font-semibold">{line}</p>
          <p className="mt-1 font-mono text-[11px] text-muted">Pocket</p>
        </Tile>
      </Stack>
    );
  }

  if (screen === 'incoming') {
    return (
      <Stack>
        <Label>{t('live.screen.incoming')}</Label>
        <Tile className={failed ? 'border-ochre' : 'border-rule'}>
          <p className="text-[14px]">{line}</p>
        </Tile>
      </Stack>
    );
  }

  if (screen === 'inbox' || screen === 'consent' || screen === 'statement') {
    return (
      <Stack>
        <Label>
          {screen === 'consent'
            ? t('live.screen.consent')
            : screen === 'statement'
              ? t('live.screen.statement')
              : t('live.screen.inbox')}
        </Label>
        <Tile>
          <p className="text-[14px] leading-relaxed">{line}</p>
        </Tile>
      </Stack>
    );
  }

  return (
    <Stack>
      <Label>{screen}</Label>
      <p className="text-[14px]">{line}</p>
    </Stack>
  );
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-3">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border border-rule bg-surface px-3 py-3', className)}>{children}</div>;
}

function FakeBtn({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto border border-ink bg-ink px-3 py-2 text-center font-mono text-[12px] text-paper">
      {children}
    </div>
  );
}
