import type { PacsBuildInput } from '@/lib/pacsBuilder';
import { cn } from '@/lib/cn';
import { FieldDef } from './FieldDef';
import type { ActivateFn, PatchFn, Translate } from './types';

const CLR_SYS_OPTIONS = ['TIPS', 'RT1', 'STEP2', 'SIC', 'EUROSIC'] as const;

export function ClrSysField({
  value,
  patch,
  t,
  highlighted,
  onActivate,
  compact = false,
}: {
  value: PacsBuildInput['clrSys'];
  patch: PatchFn;
  t: Translate;
  highlighted: boolean;
  onActivate: ActivateFn;
  compact?: boolean;
}) {
  return (
    <label
      data-field-key="clrSys"
      className={cn('block text-[12px] transition-colors', highlighted && 'bg-signal-soft ring-1 ring-signal')}
      onFocusCapture={() => onActivate('clrSys', 'form')}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('try.clearing')}</span>
      <select
        value={value}
        onChange={(e) => patch('clrSys', e.target.value as PacsBuildInput['clrSys'])}
        className="mt-0.5 w-full border border-rule bg-surface px-2 py-1 font-mono text-[12px]"
      >
        {CLR_SYS_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {!compact && <FieldDef>{t('try.clearingDef')}</FieldDef>}
    </label>
  );
}
