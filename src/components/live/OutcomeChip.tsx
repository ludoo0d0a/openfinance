import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import type { LifeOutcome } from '@/types';

export function outcomeShort(outcome: LifeOutcome, t: (k: string) => string): string {
  return t(`live.outcome.${outcome}`);
}

export function OutcomeChip({ outcome }: { outcome: LifeOutcome }) {
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
