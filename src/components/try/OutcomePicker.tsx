import type { Pacs002Outcome } from '@/lib/pacsBuilder';
import { cn } from '@/lib/cn';
import { ToggleTab } from './ToggleTab';
import type { ActivateFn, Translate } from './types';

export function OutcomePicker({
  outcome,
  setOutcome,
  highlighted,
  onActivate,
  t,
  compact = false,
}: {
  outcome: Pacs002Outcome;
  setOutcome: (v: Pacs002Outcome) => void;
  highlighted: boolean;
  onActivate: ActivateFn;
  t: Translate;
  compact?: boolean;
}) {
  return (
    <div
      data-field-key="outcome"
      className={cn('transition-colors', highlighted && 'bg-signal-soft ring-1 ring-signal')}
      onFocusCapture={() => onActivate('outcome', 'form')}
    >
      {!compact && <span className="sr-only">{t('try.outcome')}</span>}
      <div className="flex gap-px">
        <ToggleTab
          active={outcome === 'ACSC'}
          onClick={() => {
            setOutcome('ACSC');
            onActivate('outcome', 'form');
          }}
        >
          {t('try.ack')}
        </ToggleTab>
        <ToggleTab
          active={outcome === 'RJCT'}
          onClick={() => {
            setOutcome('RJCT');
            onActivate('outcome', 'form');
          }}
        >
          {t('try.reject')}
        </ToggleTab>
      </div>
    </div>
  );
}
