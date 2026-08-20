import { BadgeCheck } from 'lucide-react';
import type { Pacs002Outcome } from '@/lib/pacsBuilder';
import type { EditorFieldKey } from '@/lib/pacsFields';
import { FieldDef } from './FieldDef';
import { OutcomePicker } from './OutcomePicker';
import { ReasonField } from './ReasonField';
import type { ActivateFn, Translate } from './types';

export function OutcomeFields({
  outcome,
  rejectReason,
  setOutcome,
  setRejectReason,
  highlighted,
  onActivate,
  t,
}: {
  outcome: Pacs002Outcome;
  rejectReason: string;
  setOutcome: (v: Pacs002Outcome) => void;
  setRejectReason: (v: string) => void;
  highlighted: EditorFieldKey | null;
  onActivate: ActivateFn;
  t: Translate;
}) {
  return (
    <fieldset className="border-t border-rule-soft pt-3">
      <legend className="eyebrow mb-1 inline-flex items-center gap-1.5">
        <BadgeCheck size={12} aria-hidden />
        {t('try.outcome')}
      </legend>
      <FieldDef className="mb-2">{t('try.outcomeDef')}</FieldDef>
      <OutcomePicker
        outcome={outcome}
        setOutcome={setOutcome}
        highlighted={highlighted === 'outcome'}
        onActivate={onActivate}
        t={t}
      />
      {outcome === 'RJCT' && (
        <ReasonField
          value={rejectReason}
          setRejectReason={setRejectReason}
          highlighted={highlighted === 'rejectReason'}
          onActivate={onActivate}
          t={t}
        />
      )}
    </fieldset>
  );
}
