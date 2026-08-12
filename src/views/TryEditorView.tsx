import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileCode2, PencilLine, RotateCcw, Zap } from 'lucide-react';
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
  resolveDateOnly,
  resolveDateTime,
  type DateOnlyPreset,
  type DateTimePreset,
} from '@/lib/relativeDates';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

type FieldKey = keyof PacsBuildInput;
type TextFieldKey = Exclude<FieldKey, 'clrSys' | 'instant'>;

type FieldSpec = {
  key: TextFieldKey;
  labelKey: string;
  defKey: string;
  kind?: 'text' | 'date' | 'datetime';
};

type Section = {
  titleKey: string;
  fields: FieldSpec[];
};

const SECTIONS: Section[] = [
  {
    titleKey: 'try.sectionMoney',
    fields: [
      { key: 'amount', labelKey: 'try.fieldAmount', defKey: 'try.defAmount' },
      { key: 'currency', labelKey: 'try.fieldCurrency', defKey: 'try.defCurrency' },
    ],
  },
  {
    titleKey: 'try.sectionIds',
    fields: [
      { key: 'endToEndId', labelKey: 'try.fieldEndToEndId', defKey: 'try.defEndToEndId' },
      { key: 'instructionId', labelKey: 'try.fieldInstructionId', defKey: 'try.defInstructionId' },
      { key: 'txId', labelKey: 'try.fieldTxId', defKey: 'try.defTxId' },
      { key: 'msgId', labelKey: 'try.fieldMsgId', defKey: 'try.defMsgId' },
    ],
  },
  {
    titleKey: 'try.sectionDebtor',
    fields: [
      { key: 'debtorName', labelKey: 'try.fieldDebtorName', defKey: 'try.defDebtorName' },
      { key: 'debtorIban', labelKey: 'try.fieldDebtorIban', defKey: 'try.defDebtorIban' },
      { key: 'debtorBic', labelKey: 'try.fieldDebtorBic', defKey: 'try.defDebtorBic' },
    ],
  },
  {
    titleKey: 'try.sectionCreditor',
    fields: [
      { key: 'creditorName', labelKey: 'try.fieldCreditorName', defKey: 'try.defCreditorName' },
      { key: 'creditorIban', labelKey: 'try.fieldCreditorIban', defKey: 'try.defCreditorIban' },
      { key: 'creditorBic', labelKey: 'try.fieldCreditorBic', defKey: 'try.defCreditorBic' },
    ],
  },
  {
    titleKey: 'try.sectionRemittance',
    fields: [{ key: 'remittance', labelKey: 'try.fieldRemittance', defKey: 'try.defRemittance' }],
  },
  {
    titleKey: 'try.sectionTiming',
    fields: [
      { key: 'settlementDate', labelKey: 'try.fieldSettlementDate', defKey: 'try.defSettlementDate', kind: 'date' },
      { key: 'createdAt', labelKey: 'try.fieldCreatedAt', defKey: 'try.defCreatedAt', kind: 'datetime' },
    ],
  },
];

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

/**
 * Interactive builder: edit payment fields → live pacs.008 XML and a matching
 * pacs.002 acknowledgement (ACSC) or reject (RJCT).
 */
export function TryEditorView() {
  const t = useT();
  const [input, setInput] = useState<PacsBuildInput>(DEFAULT_PACS_INPUT);
  const [outcome, setOutcome] = useState<Pacs002Outcome>('ACSC');
  const [rejectReason, setRejectReason] = useState('AB05');
  const [edited008, setEdited008] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<'008' | '002'>('008');

  const pacs008 = useMemo(() => buildPacs008(input), [input]);
  const pacs002 = useMemo(
    () => buildPacs002(input, outcome, rejectReason),
    [input, outcome, rejectReason],
  );

  const display008 = edited008 ?? pacs008;

  function patch<K extends FieldKey>(key: K, value: PacsBuildInput[K]) {
    setEdited008(null);
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setInput({
      ...DEFAULT_PACS_INPUT,
      settlementDate: resolveDateOnly('today'),
      createdAt: resolveDateTime('now'),
    });
    setOutcome('ACSC');
    setRejectReason('AB05');
    setEdited008(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <PencilLine size={12} aria-hidden />
          {t('try.eyebrow')}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('try.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('try.lead')}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>pacs.008</Tag>
          <Tag>pacs.002 ack</Tag>
          <Tag>XML + JSON</Tag>
          <Tag>synthetic</Tag>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="panel space-y-5 p-4 xl:sticky xl:top-[69px] xl:max-h-[calc(100dvh-85px)] xl:overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <h2 className="eyebrow">{t('try.fields')}</h2>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 border border-rule px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted hover:border-ink hover:text-ink"
            >
              <RotateCcw size={11} aria-hidden />
              {t('try.reset')}
            </button>
          </div>

          <FormSection title={t('try.sectionClearing')}>
            <label className="block">
              <span className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.instant}
                  onChange={(e) => patch('instant', e.target.checked)}
                  className="accent-[var(--color-signal)]"
                />
                <Zap size={14} className="text-ochre" aria-hidden />
                <span className="font-medium">{t('try.instant')}</span>
              </span>
              <FieldDef>{t('try.instantDef')}</FieldDef>
            </label>

            <label className="mt-3 block text-[12px]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('try.clearing')}</span>
              <select
                value={input.clrSys}
                onChange={(e) => patch('clrSys', e.target.value as PacsBuildInput['clrSys'])}
                className="mt-1 w-full border border-rule bg-surface px-2 py-1.5 font-mono text-[12px]"
              >
                {(['TIPS', 'RT1', 'STEP2', 'SIC', 'EUROSIC'] as const).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldDef>{t('try.clearingDef')}</FieldDef>
            </label>
          </FormSection>

          {SECTIONS.map((section) => (
            <FormSection key={section.titleKey} title={t(section.titleKey)}>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    label={t(field.labelKey)}
                    definition={t(field.defKey)}
                    value={String(input[field.key])}
                    onChange={(v) => patch(field.key, v as never)}
                    kind={field.kind ?? 'text'}
                    t={t}
                  />
                ))}
              </div>
            </FormSection>
          ))}

          <fieldset className="border-t border-rule-soft pt-4">
            <legend className="eyebrow mb-1">{t('try.outcome')}</legend>
            <FieldDef className="mb-2">{t('try.outcomeDef')}</FieldDef>
            <div className="flex gap-px">
              <OutcomeTab active={outcome === 'ACSC'} onClick={() => setOutcome('ACSC')}>
                {t('try.ack')}
              </OutcomeTab>
              <OutcomeTab active={outcome === 'RJCT'} onClick={() => setOutcome('RJCT')}>
                {t('try.reject')}
              </OutcomeTab>
            </div>
            {outcome === 'RJCT' && (
              <label className="mt-3 block text-[12px]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('try.reason')}</span>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 w-full border border-rule bg-surface px-2 py-1.5 font-mono text-[12px]"
                >
                  {['AB05', 'AC01', 'AC03', 'AM04', 'AG01', 'AM02', 'TM01'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldDef>{t('try.reasonDef')}</FieldDef>
              </label>
            )}
          </fieldset>

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

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-px lg:hidden">
            <OutcomeTab active={activePane === '008'} onClick={() => setActivePane('008')}>
              <FileCode2 size={12} aria-hidden /> pacs.008
            </OutcomeTab>
            <OutcomeTab active={activePane === '002'} onClick={() => setActivePane('002')}>
              <FileCode2 size={12} aria-hidden /> pacs.002
            </OutcomeTab>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={cn('min-h-[520px]', activePane !== '008' && 'hidden lg:block')}>
              <PayloadInspector
                content={display008}
                format="xml"
                title={t('try.title008')}
                description={t('try.edit008')}
                onContentChange={setEdited008}
              />
            </div>
            <div className={cn('min-h-[520px]', activePane !== '002' && 'hidden lg:block')}>
              <PayloadInspector
                content={pacs002}
                format="xml"
                title={
                  outcome === 'ACSC' ? t('try.title002Ack') : t('try.title002Rjct', { code: rejectReason })
                }
                description={t('try.ack002')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule-soft pt-4 first:border-t-0 first:pt-0">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

function FieldDef({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-1 text-[11px] leading-snug text-muted', className)}>{children}</p>;
}

function FieldRow({
  label,
  definition,
  value,
  onChange,
  kind,
  t,
}: {
  label: string;
  definition: string;
  value: string;
  onChange: (value: string) => void;
  kind: 'text' | 'date' | 'datetime';
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <label className="block text-[12px]">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</span>
      {kind === 'date' && (
        <PresetRow ariaLabel={t('try.datePresets')}>
          {DATE_ONLY_PRESETS.map((p) => (
            <PresetBtn key={p.id} onClick={() => onChange(resolveDateOnly(p.id))}>
              {t(p.labelKey)}
            </PresetBtn>
          ))}
        </PresetRow>
      )}
      {kind === 'datetime' && (
        <PresetRow ariaLabel={t('try.datePresets')}>
          {DATE_TIME_PRESETS.map((p) => (
            <PresetBtn key={p.id} onClick={() => onChange(resolveDateTime(p.id))}>
              {t(p.labelKey)}
            </PresetBtn>
          ))}
        </PresetRow>
      )}
      <input
        type={kind === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-rule bg-surface px-2 py-1.5 font-mono text-[12px]"
      />
      <FieldDef>{definition}</FieldDef>
    </label>
  );
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
