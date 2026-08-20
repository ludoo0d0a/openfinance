import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Building2,
  Clock,
  Coins,
  FileCode2,
  Hash,
  MessageSquareText,
  Network,
  PencilLine,
  RotateCcw,
  SlidersHorizontal,
  UserRound,
  Zap,
} from 'lucide-react';
import { PayloadInspector } from '@/components/PayloadInspector';
import { Tag } from '@/components/Chips';
import {
  DEFAULT_PACS_INPUT,
  buildPacs002,
  buildPacs008,
  type Pacs002Outcome,
  type PacsBuildInput,
} from '@/lib/pacsBuilder';
import {
  EXPERT_SECTIONS,
  SIMPLE_SECTIONS,
  SIMPLE_SYNC,
  fieldByKey,
  highlightSelectors,
  resolveXmlClick,
  type EditorFieldKey,
  type PacsFieldSpec,
  type PacsSection,
} from '@/lib/pacsFields';
import {
  resolveDateOnly,
  resolveDateTime,
  type DateOnlyPreset,
  type DateTimePreset,
} from '@/lib/relativeDates';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

type FieldKey = keyof PacsBuildInput;

const SECTION_ICONS: Record<string, LucideIcon> = {
  money: Coins,
  ids: Hash,
  debtor: UserRound,
  creditor: Building2,
  remittance: MessageSquareText,
  timing: Clock,
  clearing: Network,
  document: FileCode2,
  grphdr: Hash,
  pmtid: Hash,
  pmttp: Zap,
  tx: Coins,
  status: BadgeCheck,
};

const DATE_ONLY_PRESETS: { id: DateOnlyPreset; labelKey: string }[] = [
  { id: 'yesterday', labelKey: 'try.dateYesterday' },
  { id: 'today', labelKey: 'try.dateToday' },
  { id: 'tomorrow', labelKey: 'try.dateTomorrow' },
];

const DATE_TIME_PRESETS: { id: DateTimePreset; labelKey: string }[] = [
  { id: 'now', labelKey: 'try.dateNow' },
  { id: 'minus1h', labelKey: 'try.dateMinus1h' },
  { id: 'plus1h', labelKey: 'try.datePlus1h' },
  { id: 'minus1d', labelKey: 'try.dateMinus1d' },
  { id: 'plus1d', labelKey: 'try.datePlus1d' },
  { id: 'startToday', labelKey: 'try.dateStartToday' },
  { id: 'noonToday', labelKey: 'try.dateNoonToday' },
];

type Selection = { source: 'form' | 'xml'; fieldKey: EditorFieldKey; paths: string[] };

function freshInput(): PacsBuildInput {
  const settlementDate = resolveDateOnly('today');
  const createdAt = resolveDateTime('now');
  return {
    ...DEFAULT_PACS_INPUT,
    settlementDate,
    createdAt,
    grpSettlementDate: settlementDate,
    accptncDtTm: createdAt,
  };
}

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
  const [activePane, setActivePane] = useState<'008' | '002'>('008');
  const [expert, setExpert] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const pacs008 = useMemo(() => buildPacs008(input), [input]);
  const pacs002 = useMemo(
    () => buildPacs002(input, outcome, rejectReason),
    [input, outcome, rejectReason],
  );

  const display008 = edited008 ?? pacs008;
  const selectedPaths = selection?.paths ?? [];
  const sections = expert ? EXPERT_SECTIONS : SIMPLE_SECTIONS;

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

  const highlighted = selection?.fieldKey ?? null;

  return (
    <div className="page-fluid flex min-h-0 flex-col gap-4 xl:h-[calc(100dvh-11rem)] xl:overflow-hidden xl:py-4">
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

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(18rem,26%)_minmax(0,1fr)]">
        <aside
          ref={formRef}
          className="panel scroll-paper space-y-3 overflow-y-auto p-3 xl:min-h-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="eyebrow">{t('try.fields')}</h2>
            <div className="flex items-center gap-px">
              <ModeTab active={!expert} onClick={() => setExpert(false)}>
                {t('try.modeSimple')}
              </ModeTab>
              <ModeTab active={expert} onClick={() => setExpert(true)}>
                <SlidersHorizontal size={11} aria-hidden />
                {t('try.modeExpert')}
              </ModeTab>
              <button
                type="button"
                onClick={reset}
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
                onActivate={activateField}
              />
            </FormSection>
          )}

          {expert ? (
            sections.map((section) => (
              <SectionFields
                key={section.id}
                section={section}
                expert
                input={input}
                outcome={outcome}
                rejectReason={rejectReason}
                patch={patch}
                setOutcome={setOutcome}
                setRejectReason={setRejectReason}
                highlighted={highlighted}
                onActivate={activateField}
                t={t}
              />
            ))
          ) : (
            <>
              {sections.slice(0, 2).map((section) => (
                <SectionFields
                  key={section.id}
                  section={section}
                  input={input}
                  outcome={outcome}
                  rejectReason={rejectReason}
                  patch={patch}
                  setOutcome={setOutcome}
                  setRejectReason={setRejectReason}
                  highlighted={highlighted}
                  onActivate={activateField}
                  t={t}
                />
              ))}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
                {sections.slice(2, 4).map((section) => (
                  <SectionFields
                    key={section.id}
                    section={section}
                    compact
                    input={input}
                    outcome={outcome}
                    rejectReason={rejectReason}
                    patch={patch}
                    setOutcome={setOutcome}
                    setRejectReason={setRejectReason}
                    highlighted={highlighted}
                    onActivate={activateField}
                    t={t}
                  />
                ))}
              </div>
              {sections.slice(4).map((section) => (
                <SectionFields
                  key={section.id}
                  section={section}
                  input={input}
                  outcome={outcome}
                  rejectReason={rejectReason}
                  patch={patch}
                  setOutcome={setOutcome}
                  setRejectReason={setRejectReason}
                  highlighted={highlighted}
                  onActivate={activateField}
                  t={t}
                />
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
              onActivate={activateField}
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

        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-px lg:hidden">
            <OutcomeTab active={activePane === '008'} onClick={() => setActivePane('008')}>
              <FileCode2 size={12} aria-hidden /> pacs.008
            </OutcomeTab>
            <OutcomeTab active={activePane === '002'} onClick={() => setActivePane('002')}>
              <FileCode2 size={12} aria-hidden /> pacs.002
            </OutcomeTab>
          </div>

          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
            <div className={cn('min-h-[420px] lg:min-h-0', activePane !== '008' && 'hidden lg:block')}>
              <PayloadInspector
                content={display008}
                format="xml"
                title={t('try.title008')}
                description={t('try.edit008')}
                onContentChange={setEdited008}
                selectedPaths={selectedPaths}
                onSelectPath={selectFromXml}
              />
            </div>
            <div className={cn('min-h-[420px] lg:min-h-0', activePane !== '002' && 'hidden lg:block')}>
              <PayloadInspector
                content={pacs002}
                format="xml"
                title={
                  outcome === 'ACSC' ? t('try.title002Ack') : t('try.title002Rjct', { code: rejectReason })
                }
                description={t('try.ack002')}
                selectedPaths={selectedPaths}
                onSelectPath={selectFromXml}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionFields({
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
  expert = false,
}: {
  section: PacsSection;
  input: PacsBuildInput;
  outcome: Pacs002Outcome;
  rejectReason: string;
  patch: <K extends FieldKey>(key: K, value: PacsBuildInput[K]) => void;
  setOutcome: (v: Pacs002Outcome) => void;
  setRejectReason: (v: string) => void;
  highlighted: EditorFieldKey | null;
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  compact?: boolean;
  expert?: boolean;
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
                compact={compact || expert}
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
                compact={compact || expert}
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
              compact={compact || expert}
              showPath={expert}
            />
          );
        })}
      </div>
    </FormSection>
  );
}

function CatalogField({
  spec,
  value,
  onChange,
  highlighted,
  onActivate,
  t,
  compact,
  showPath,
}: {
  spec: PacsFieldSpec;
  value: string;
  onChange: (value: string) => void;
  highlighted: boolean;
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  compact: boolean;
  showPath: boolean;
}) {
  const definition = t(spec.defKey);
  const path = spec.xmlSelectors[0];
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
      {showPath && path && <span className="mt-0.5 block truncate font-mono text-[9px] text-muted">{path}</span>}
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

function ClearingFields({
  input,
  patch,
  t,
  highlighted,
  onActivate,
}: {
  input: PacsBuildInput;
  patch: <K extends FieldKey>(key: K, value: PacsBuildInput[K]) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  highlighted: EditorFieldKey | null;
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <InstantField
        checked={input.instant}
        patch={patch}
        t={t}
        highlighted={highlighted === 'instant'}
        onActivate={onActivate}
      />
      <ClrSysField
        value={input.clrSys}
        patch={patch}
        t={t}
        highlighted={highlighted === 'clrSys'}
        onActivate={onActivate}
      />
    </div>
  );
}

function InstantField({
  checked,
  patch,
  t,
  highlighted,
  onActivate,
  compact = false,
}: {
  checked: boolean;
  patch: <K extends FieldKey>(key: K, value: PacsBuildInput[K]) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  highlighted: boolean;
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
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

function ClrSysField({
  value,
  patch,
  t,
  highlighted,
  onActivate,
  compact = false,
}: {
  value: PacsBuildInput['clrSys'];
  patch: <K extends FieldKey>(key: K, value: PacsBuildInput[K]) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  highlighted: boolean;
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
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
        {(['TIPS', 'RT1', 'STEP2', 'SIC', 'EUROSIC'] as const).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {!compact && <FieldDef>{t('try.clearingDef')}</FieldDef>}
    </label>
  );
}

function OutcomeFields({
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
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
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

function OutcomePicker({
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
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
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
        <OutcomeTab
          active={outcome === 'ACSC'}
          onClick={() => {
            setOutcome('ACSC');
            onActivate('outcome', 'form');
          }}
        >
          {t('try.ack')}
        </OutcomeTab>
        <OutcomeTab
          active={outcome === 'RJCT'}
          onClick={() => {
            setOutcome('RJCT');
            onActivate('outcome', 'form');
          }}
        >
          {t('try.reject')}
        </OutcomeTab>
      </div>
    </div>
  );
}

function ReasonField({
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
  onActivate: (key: EditorFieldKey, source: 'form' | 'xml') => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
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
        {['AB05', 'AC01', 'AC03', 'AM04', 'AG01', 'AM02', 'TM01'].map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {!compact && <FieldDef>{t('try.reasonDef')}</FieldDef>}
    </label>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-rule-soft pt-3 first:border-t-0 first:pt-0">
      <h3 className="eyebrow mb-2 inline-flex items-center gap-1.5">
        <Icon size={12} aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldDef({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-0.5 text-[10px] leading-snug text-muted', className)}>{children}</p>;
}

function PresetRow({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function PresetBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="border border-rule bg-paper-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}

function OutcomeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest',
        active ? 'bg-ink text-white' : 'border border-rule bg-surface text-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider',
        active ? 'bg-ink text-white' : 'border border-rule bg-surface text-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
