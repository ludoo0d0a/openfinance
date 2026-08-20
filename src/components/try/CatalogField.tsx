import type { PacsFieldSpec } from '@/lib/pacsFields';
import { resolveDateOnly, resolveDateTime } from '@/lib/relativeDates';
import { cn } from '@/lib/cn';
import { DATE_ONLY_PRESETS, DATE_TIME_PRESETS } from './constants';
import { FieldDef } from './FieldDef';
import { PresetBtn } from './PresetBtn';
import { PresetRow } from './PresetRow';
import type { ActivateFn, Translate } from './types';

export function CatalogField({
  spec,
  value,
  onChange,
  highlighted,
  onActivate,
  t,
  compact,
}: {
  spec: PacsFieldSpec;
  value: string;
  onChange: (value: string) => void;
  highlighted: boolean;
  onActivate: ActivateFn;
  t: Translate;
  compact: boolean;
}) {
  const definition = t(spec.defKey);
  return (
    <label
      data-field-key={spec.key}
      className={cn(
        'block min-w-0 text-[12px] transition-colors',
        highlighted && 'bg-signal-soft ring-1 ring-signal',
      )}
      title={definition}
      onFocusCapture={() => onActivate(spec.key, 'form')}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t(spec.labelKey)}</span>
      {spec.kind === 'date' && (
        <PresetRow ariaLabel={t('try.datePresets')}>
          {DATE_ONLY_PRESETS.map((p) => (
            <PresetBtn key={p.id} onClick={() => onChange(resolveDateOnly(p.id))}>
              {t(p.labelKey)}
            </PresetBtn>
          ))}
        </PresetRow>
      )}
      {spec.kind === 'datetime' && (
        <PresetRow ariaLabel={t('try.datePresets')}>
          {DATE_TIME_PRESETS.map((p) => (
            <PresetBtn key={p.id} onClick={() => onChange(resolveDateTime(p.id))}>
              {t(p.labelKey)}
            </PresetBtn>
          ))}
        </PresetRow>
      )}
      {spec.kind === 'select' && spec.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full border border-rule bg-surface px-2 py-1 font-mono text-[12px]"
        >
          {spec.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={spec.kind === 'date' ? 'date' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full border border-rule bg-surface px-2 py-1 font-mono text-[12px]"
        />
      )}
      {!compact && <FieldDef>{definition}</FieldDef>}
    </label>
  );
}
