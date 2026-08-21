import { JargonText } from '@/components/JargonText';
import { useT } from '@/i18n';
import { FakeBtn } from './FakeBtn';
import { Label } from './Label';
import { Stack } from './Stack';
import { Tile } from './Tile';

export function ScreenBody({ screen, line, failed }: { screen: string; line: string; failed: boolean }) {
  const t = useT();
  const lineNode = <JargonText text={line} />;

  if (screen === 'cart') {
    return (
      <Stack>
        <Label>{t('live.screen.cart')}</Label>
        <Tile>
          <p className="text-[15px] font-semibold">{lineNode}</p>
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
        <p className="text-[14px] leading-relaxed">{lineNode}</p>
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
          <p className="mt-2 text-[13px] text-muted">{lineNode}</p>
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
          <p className="text-center text-[14px] leading-relaxed">{lineNode}</p>
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
          <p className="mt-2 text-[16px] font-semibold">{lineNode}</p>
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
          <p className="mt-2 text-[14px]">{lineNode}</p>
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
          <p className="mt-2 text-[13px] text-muted">{lineNode}</p>
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
          <p className="text-[14px]">{lineNode}</p>
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
          <p className="text-[15px] font-semibold">{lineNode}</p>
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
          <p className="text-[14px]">{lineNode}</p>
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
          <p className="text-[14px] leading-relaxed">{lineNode}</p>
        </Tile>
      </Stack>
    );
  }

  return (
    <Stack>
      <Label>{screen}</Label>
      <p className="text-[14px]">{lineNode}</p>
    </Stack>
  );
}
