import { Hash } from 'lucide-react';
import type { Pacs002Outcome, PacsBuildInput } from '@/lib/pacsBuilder';
import { fieldByKey, type EditorFieldKey, type PacsSection } from '@/lib/pacsFields';
import { cn } from '@/lib/cn';
import { SECTION_ICONS } from './constants';
import { CatalogField } from './CatalogField';
import { ClrSysField } from './ClrSysField';
import { FormSection } from './FormSection';
import { InstantField } from './InstantField';
import { OutcomePicker } from './OutcomePicker';
import { ReasonField } from './ReasonField';
import type { ActivateFn, FieldKey, PatchFn, Translate } from './types';

export function SectionFields({
  section,
  input,
  outcome,
  rejectReason,
  patch,
  setOutcome,
  setRejectReason,
  highlighted,
  onActivate,
  t,
  compact = false,
}: {
  section: PacsSection;
  input: PacsBuildInput;
  outcome: Pacs002Outcome;
  rejectReason: string;
  patch: PatchFn;
  setOutcome: (v: Pacs002Outcome) => void;
  setRejectReason: (v: string) => void;
  highlighted: EditorFieldKey | null;
  onActivate: ActivateFn;
  t: Translate;
  compact?: boolean;
}) {
  const cols = section.columns ?? 1;
  const icon = SECTION_ICONS[section.id] ?? Hash;
  return (
    <FormSection icon={icon} title={t(section.titleKey)}>
      <div className={cn(cols === 2 ? 'grid grid-cols-2 gap-2' : compact ? 'space-y-2' : 'space-y-2.5')}>
        {section.keys.map((key) => {
          if (key === 'clrSys') {
            return (
              <ClrSysField
                key={key}
                value={input.clrSys}
                patch={patch}
                t={t}
                highlighted={highlighted === 'clrSys'}
                onActivate={onActivate}
                compact={compact}
              />
            );
          }
          if (key === 'instant') {
            return (
              <InstantField
                key={key}
                checked={input.instant}
                patch={patch}
                t={t}
                highlighted={highlighted === 'instant'}
                onActivate={onActivate}
                compact={compact}
              />
            );
          }
          if (key === 'outcome') {
            return (
              <OutcomePicker
                key={key}
                outcome={outcome}
                setOutcome={setOutcome}
                highlighted={highlighted === 'outcome'}
                onActivate={onActivate}
                t={t}
                compact
              />
            );
          }
          if (key === 'rejectReason') {
            if (outcome !== 'RJCT') return null;
            return (
              <ReasonField
                key={key}
                value={rejectReason}
                setRejectReason={setRejectReason}
                highlighted={highlighted === 'rejectReason'}
                onActivate={onActivate}
                t={t}
                compact
              />
            );
          }
          const spec = fieldByKey(key);
          if (!spec || spec.kind === 'checkbox') return null;
          return (
            <CatalogField
              key={key}
              spec={spec}
              value={String(input[key as FieldKey] ?? '')}
              onChange={(v) => patch(key as FieldKey, v as never)}
              highlighted={highlighted === key}
              onActivate={onActivate}
              t={t}
              compact={compact}
            />
          );
        })}
      </div>
    </FormSection>
  );
}
