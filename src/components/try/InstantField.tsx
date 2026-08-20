import { Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FieldDef } from './FieldDef';
import type { ActivateFn, PatchFn, Translate } from './types';

export function InstantField({
  checked,
  patch,
  t,
  highlighted,
  onActivate,
  compact = false,
}: {
  checked: boolean;
  patch: PatchFn;
  t: Translate;
  highlighted: boolean;
  onActivate: ActivateFn;
  compact?: boolean;
}) {
  return (
    <label
      data-field-key="instant"
      className={cn('block text-[12px] transition-colors', highlighted && 'bg-signal-soft ring-1 ring-signal')}
      onFocusCapture={() => onActivate('instant', 'form')}
    >
      <span className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => patch('instant', e.target.checked)}
          className="accent-[var(--color-signal)]"
        />
        <Zap size={14} className="text-ochre" aria-hidden />
        <span className="font-medium">{t('try.instant')}</span>
      </span>
      {!compact && <FieldDef>{t('try.instantDef')}</FieldDef>}
    </label>
  );
}
