import type { LifeOutcome } from '@/types';

export function outcomeShort(outcome: LifeOutcome, t: (k: string) => string): string {
  return t(`live.outcome.${outcome}`);
}
