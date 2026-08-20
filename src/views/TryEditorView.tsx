import { useEffect, useMemo, useRef, useState } from 'react';
import { PencilLine } from 'lucide-react';
import { Tag } from '@/components/Chips';
import { TryEditorForm } from '@/components/try/TryEditorForm';
import { TryEditorPanes, type PaneMode } from '@/components/try/TryEditorPanes';
import { freshInput } from '@/components/try/freshInput';
import type { FieldKey, Selection } from '@/components/try/types';
import {
  buildPacs002,
  buildPacs008,
  type Pacs002Outcome,
  type PacsBuildInput,
} from '@/lib/pacsBuilder';
import {
  SIMPLE_SYNC,
  highlightSelectors,
  resolveXmlClick,
  type EditorFieldKey,
} from '@/lib/pacsFields';
import { useT } from '@/i18n';

/**
 * Interactive builder: edit payment fields → live pacs.008 XML and a matching
 * pacs.002 acknowledgement (ACSC) or reject (RJCT).
 */
export function TryEditorView() {
  const t = useT();
  const formRef = useRef<HTMLElement>(null);
  const [input, setInput] = useState<PacsBuildInput>(freshInput);
  const [outcome, setOutcome] = useState<Pacs002Outcome>('ACSC');
  const [rejectReason, setRejectReason] = useState('AB05');
  const [edited008, setEdited008] = useState<string | null>(null);
  const [paneMode, setPaneMode] = useState<PaneMode>('both');
  const [expert, setExpert] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const pacs008 = useMemo(() => buildPacs008(input), [input]);
  const pacs002 = useMemo(
    () => buildPacs002(input, outcome, rejectReason),
    [input, outcome, rejectReason],
  );

  const display008 = edited008 ?? pacs008;
  const selectedPaths = selection?.paths ?? [];

  useEffect(() => {
    if (selection?.source !== 'xml') return;
    const el = formRef.current?.querySelector(`[data-field-key="${selection.fieldKey}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    el?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
  }, [selection, expert]);

  function patch<K extends FieldKey>(key: K, value: PacsBuildInput[K]) {
    setEdited008(null);
    setInput((prev) => {
      const next: PacsBuildInput = { ...prev, [key]: value };
      if (key === 'instant') {
        next.lclInstrm = value ? prev.lclInstrm.trim() || 'INST' : '';
      }
      if (key === 'lclInstrm') {
        next.instant = String(value).trim().toUpperCase() === 'INST';
      }
      if (key === 'msgId' && !expert) {
        next.statusMsgId = String(value).replace(/PACS8/i, 'PACS2');
      }
      if (!expert) {
        for (const mirror of SIMPLE_SYNC[key] ?? []) {
          (next[mirror] as PacsBuildInput[typeof mirror]) = value as never;
        }
      }
      return next;
    });
  }

  function activateField(key: EditorFieldKey, source: 'form' | 'xml') {
    setSelection((prev) =>
      prev?.fieldKey === key && prev.source === 'xml' && source === 'form'
        ? prev
        : { fieldKey: key, source, paths: highlightSelectors(key) },
    );
  }

  function selectFromXml(selector: string) {
    const hit = resolveXmlClick(selector, expert);
    if (!hit) {
      setSelection(null);
      return;
    }
    if (hit.enableExpert) setExpert(true);
    setSelection({
      fieldKey: hit.field.key,
      source: 'xml',
      paths: [...new Set([selector, ...hit.field.xmlSelectors])],
    });
  }

  function reset() {
    setInput(freshInput());
    setOutcome('ACSC');
    setRejectReason('AB05');
    setEdited008(null);
    setSelection(null);
  }

  return (
    <div className="page-fluid flex flex-col gap-4">
      <header className="shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 max-w-4xl">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <PencilLine size={12} aria-hidden />
              {t('try.eyebrow')}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t('try.title')}</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{t('try.lead')}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag>pacs.008</Tag>
            <Tag>pacs.002 ack</Tag>
            <Tag>XML + JSON</Tag>
            <Tag>synthetic</Tag>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(18rem,26%)_minmax(0,1fr)] xl:items-start">
        <TryEditorForm
          formRef={formRef}
          input={input}
          outcome={outcome}
          rejectReason={rejectReason}
          expert={expert}
          setExpert={setExpert}
          patch={patch}
          setOutcome={setOutcome}
          setRejectReason={setRejectReason}
          highlighted={selection?.fieldKey ?? null}
          onActivate={activateField}
          onReset={reset}
          t={t}
        />
        <TryEditorPanes
          display008={display008}
          pacs002={pacs002}
          outcome={outcome}
          rejectReason={rejectReason}
          paneMode={paneMode}
          setPaneMode={setPaneMode}
          selectedPaths={selectedPaths}
          onSelectPath={selectFromXml}
          onEdit008={setEdited008}
          t={t}
        />
      </div>
    </div>
  );
}
