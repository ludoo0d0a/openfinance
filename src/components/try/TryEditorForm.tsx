import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Network, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { Pacs002Outcome, PacsBuildInput } from '@/lib/pacsBuilder';
import { EXPERT_SECTIONS, SIMPLE_SECTIONS, type EditorFieldKey } from '@/lib/pacsFields';
import { ClearingFields } from './ClearingFields';
import { FormSection } from './FormSection';
import { OutcomeFields } from './OutcomeFields';
import { SectionFields } from './SectionFields';
import { ToggleTab } from './ToggleTab';
import type { ActivateFn, PatchFn, Translate } from './types';

export function TryEditorForm({
  formRef,
  input,
  outcome,
  rejectReason,
  expert,
  setExpert,
  patch,
  setOutcome,
  setRejectReason,
  highlighted,
  onActivate,
  onReset,
  t,
}: {
  formRef: RefObject<HTMLElement | null>;
  input: PacsBuildInput;
  outcome: Pacs002Outcome;
  rejectReason: string;
  expert: boolean;
  setExpert: (v: boolean) => void;
  patch: PatchFn;
  setOutcome: (v: Pacs002Outcome) => void;
  setRejectReason: (v: string) => void;
  highlighted: EditorFieldKey | null;
  onActivate: ActivateFn;
  onReset: () => void;
  t: Translate;
}) {
  const sections = expert ? EXPERT_SECTIONS : SIMPLE_SECTIONS;
  const sectionProps = {
    input,
    outcome,
    rejectReason,
    patch,
    setOutcome,
    setRejectReason,
    highlighted,
    onActivate,
    t,
  };

  return (
    <aside ref={formRef} className="panel space-y-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow">{t('try.fields')}</h2>
        <div className="flex items-center gap-px">
          <ToggleTab size="sm" active={!expert} onClick={() => setExpert(false)}>
            {t('try.modeSimple')}
          </ToggleTab>
          <ToggleTab size="sm" active={expert} onClick={() => setExpert(true)}>
            <SlidersHorizontal size={11} aria-hidden />
            {t('try.modeExpert')}
          </ToggleTab>
          <button
            type="button"
            onClick={onReset}
            className="ml-1 inline-flex items-center gap-1 border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted hover:border-ink hover:text-ink"
          >
            <RotateCcw size={11} aria-hidden />
            {t('try.reset')}
          </button>
        </div>
      </div>
      {expert && <p className="text-[11px] leading-snug text-muted">{t('try.expertHint')}</p>}

      {!expert && (
        <FormSection icon={Network} title={t('try.sectionClearing')}>
          <ClearingFields
            input={input}
            patch={patch}
            t={t}
            highlighted={highlighted}
            onActivate={onActivate}
          />
        </FormSection>
      )}

      {expert ? (
        sections.map((section) => (
          <SectionFields key={section.id} section={section} expert {...sectionProps} />
        ))
      ) : (
        <>
          {sections.slice(0, 2).map((section) => (
            <SectionFields key={section.id} section={section} {...sectionProps} />
          ))}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
            {sections.slice(2, 4).map((section) => (
              <SectionFields key={section.id} section={section} compact {...sectionProps} />
            ))}
          </div>
          {sections.slice(4).map((section) => (
            <SectionFields key={section.id} section={section} {...sectionProps} />
          ))}
        </>
      )}

      {!expert && (
        <OutcomeFields
          outcome={outcome}
          rejectReason={rejectReason}
          setOutcome={setOutcome}
          setRejectReason={setRejectReason}
          highlighted={highlighted}
          onActivate={onActivate}
          t={t}
        />
      )}

      <p className="text-[12px] leading-relaxed text-muted">
        {t('try.related')}{' '}
        <Link to="/messages/pacs.008" className="text-signal hover:underline">
          pacs.008
        </Link>
        {' · '}
        <Link to="/messages/pacs.002" className="text-signal hover:underline">
          pacs.002
        </Link>
        {' · '}
        <Link to="/flows/sct-inst-happy-path" className="text-signal hover:underline">
          SCT Inst
        </Link>
      </p>
    </aside>
  );
}
