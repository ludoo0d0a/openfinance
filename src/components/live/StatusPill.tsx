import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

export function StatusPill({ tone }: { tone: 'ok' | 'bad' | 'idle' }) {
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
