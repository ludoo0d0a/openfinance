import { cn } from '@/lib/cn';
import { FieldDef } from './FieldDef';
import type { ActivateFn, Translate } from './types';

const REASON_CODES = ['AB05', 'AC01', 'AC03', 'AM04', 'AG01', 'AM02', 'TM01'];

export function ReasonField({
  value,
  setRejectReason,
  highlighted,
  onActivate,
  t,
  compact = false,
}: {
  value: string;
  setRejectReason: (v: string) => void;
  highlighted: boolean;
  onActivate: ActivateFn;
  t: Translate;
  compact?: boolean;
}) {
  return (
    <label
      data-field-key="rejectReason"
      className={cn(
        'block text-[12px] transition-colors',
        compact ? 'mt-0' : 'mt-2',
        highlighted && 'bg-signal-soft ring-1 ring-signal',
      )}
      onFocusCapture={() => onActivate('rejectReason', 'form')}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('try.reason')}</span>
      <select
        value={value}
        onChange={(e) => setRejectReason(e.target.value)}
        className="mt-0.5 w-full border border-rule bg-surface px-2 py-1 font-mono text-[12px]"
      >
        {REASON_CODES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {!compact && <FieldDef>{t('try.reasonDef')}</FieldDef>}
    </label>
  );
}
