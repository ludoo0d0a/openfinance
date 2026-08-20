import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { flowById, isoMessagesInFlow, sampleIdsInFlow, flowSupportsTryEditor, usagesOfMessage } from '@/data/flows';
import { messageByShort } from '@/data/iso20022';
import { standardById } from '@/data/standards';
import { sampleById, samplesForMessage } from '@/data/samples';
import {
  liveScenarioHref,
  scenariosForFlow,
  scenariosForFlowStep,
} from '@/data/lifeScenes';
import { outcomeForFlow, paymentExplorerHref, paymentsForFlow } from '@/lib/paymentJourney';
import { FlowCanvas } from '@/components/FlowCanvas';
import { EntityFlowDiagram } from '@/components/EntityFlowDiagram';
import { PayloadInspector } from '@/components/PayloadInspector';
import { CodeChip, LayerTag, MethodLabel, Tag } from '@/components/Chips';
import { TryItPanel } from '@/components/TryItPanel';
import { cn } from '@/lib/cn';
import { ActorIcon, MessageTypeIcon } from '@/lib/icons';
import { UI_ICONS } from '@/lib/iconMeta';
import { localizeFlow, useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';

type DiagramMode = 'sequence' | 'entities';

export function FlowView() {
  const t = useT();
  const { locale } = useI18n();
  const { flowId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogFlow = flowId ? flowById(flowId) : undefined;
  const flow = catalogFlow ? localizeFlow(catalogFlow, locale) : undefined;

  const [fullscreen, setFullscreen] = useState(false);
  const diagram: DiagramMode = searchParams.get('diagram') === 'sequence' ? 'sequence' : 'entities';
  const requestedStep = Number(searchParams.get('step'));
  const selected =
    flow && Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= flow.steps.length
      ? requestedStep
      : 1;

  useEffect(() => {
    if (!flow) return;
    if (Number.isInteger(requestedStep) && (requestedStep < 1 || requestedStep > flow.steps.length)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('step');
          return next;
        },
        { replace: true },
      );
    }
  }, [flow, requestedStep, setSearchParams]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullscreen]);

  function selectStep(n: number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (n <= 1) next.delete('step');
        else next.set('step', String(n));
        return next;
      },
      { replace: true },
    );
  }

  function setDiagram(mode: DiagramMode) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (mode === 'entities') next.delete('diagram');
        else next.set('diagram', mode);
        return next;
      },
      { replace: true },
    );
  }

  const step = useMemo(() => flow?.steps.find((s) => s.n === selected) ?? flow?.steps[0], [flow, selected]);
  const sample = useMemo(() => {
    if (!step) return undefined;
    if (step.sampleId) return sampleById(step.sampleId);
    if (step.messageShort) return samplesForMessage(step.messageShort)[0];
    return undefined;
  }, [step]);
  const standard = flow ? standardById(flow.standardId) : undefined;
  const hopMessage = step?.messageShort ? messageByShort(step.messageShort) : undefined;
  const flowMessages = flow ? isoMessagesInFlow(flow) : [];
  const pairedPayments = flow ? paymentsForFlow(flow.id) : [];
  const pairedOutcome = flow ? outcomeForFlow(flow.id) : 'happy';
  const liveHits = flow ? scenariosForFlow(flow.id) : [];
  const stepLiveHits = flow ? scenariosForFlowStep(flow.id, selected) : [];
  const flowSampleIds = flow ? sampleIdsInFlow(flow) : [];
  const showTryEditor = flow ? flowSupportsTryEditor(flow) : false;
  const stepShowsTry =
    step?.messageShort === 'pacs.008' || step?.messageShort === 'pacs.002';

  if (!flow || !step) return <NotFoundView />;

  return (
    <div className="page-fluid">
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">{t(`category.${flow.category}`)}</p>
          {standard && (
            <Link to={`/standards/${standard.id}`} className="font-mono text-[11px] text-signal hover:underline">
              {standard.name}
            </Link>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{flow.name}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{flow.summary}</p>
        <div className="mt-3 border-l-2 border-ochre pl-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('flow.useCase')}</p>
          <p className="mt-1 text-[13px] leading-relaxed">{flow.useCase}</p>
        </div>
        {(showTryEditor || flowSampleIds.length > 0) && (
          <div className="mt-3 space-y-3">
            {showTryEditor && (
              <p className="font-mono text-[12px]">
                <Link to="/try" className="text-signal hover:underline">
                  {t('flow.openTry')}
                </Link>
              </p>
            )}
            {flowSampleIds.length > 0 && (
              <div>
                <p className="eyebrow mb-2">{t('flow.samples')}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {flowSampleIds.map((id) => {
                    const s = sampleById(id);
                    if (!s) return null;
                    return (
                      <li key={id}>
                        <Link
                          to={`/samples/${id}`}
                          className="border border-rule bg-surface px-2 py-1 text-[13px] hover:border-ink"
                        >
                          {s.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
        {liveHits.length > 0 && (
          <div className="mt-3">
            <p className="eyebrow mb-2">{t('flow.tryInLive')}</p>
            <ul className="flex flex-wrap gap-1.5">
              {liveHits.map(({ scenario, beatIndex }) => (
                <li key={scenario.id}>
                  <Link
                    to={liveScenarioHref(scenario, beatIndex)}
                    className="border border-rule bg-surface px-2 py-1 text-[13px] hover:border-ink"
                  >
                    {scenario.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {pairedPayments.length > 0 && (
          <p className="mt-3 border-l-2 border-jade pl-3 text-[13px] leading-relaxed">
            {t('flow.technicalViewOf')}{' '}
            {pairedPayments.map((p, i) => (
              <span key={p.id}>
                {i > 0 ? ', ' : ''}
                <Link
                  to={paymentExplorerHref(p.id, {
                    outcome: pairedOutcome,
                    focus: step.messageShort,
                  })}
                  className="text-signal hover:underline"
                >
                  {p.name[locale]}
                </Link>
              </span>
            ))}
          </p>
        )}
        {flowMessages.length > 0 && (
          <p className="mt-3 font-mono text-[12px] text-violet">
            {t('flow.messages')}
            {' · '}
            {flowMessages.map((short, i) => (
              <span key={short}>
                {i > 0 ? ' → ' : ''}
                <Link to={`/messages/${short}`} className="hover:underline">
                  {short}
                </Link>
              </span>
            ))}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {flow.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
        <div className="min-w-0 space-y-6">
          <section
            className={cn(
              'panel p-4',
              fullscreen && 'fixed inset-0 z-[70] flex h-dvh w-full flex-col rounded-none border-0',
            )}
          >
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
              <h2 className="eyebrow">{diagram === 'entities' ? t('flow.txFlow') : t('flow.sequence')}</h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-px" role="tablist" aria-label={t('flow.diagramType')}>
                  <DiagramTab active={diagram === 'entities'} onClick={() => setDiagram('entities')}>
                    <UI_ICONS.entities size={13} aria-hidden />
                    {t('flow.entities')}
                  </DiagramTab>
                  <DiagramTab active={diagram === 'sequence'} onClick={() => setDiagram('sequence')}>
                    <UI_ICONS.sequence size={13} aria-hidden />
                    {t('flow.sequence')}
                  </DiagramTab>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreen((open) => !open)}
                  aria-pressed={fullscreen}
                  aria-label={fullscreen ? t('flow.exitFullscreen') : t('flow.fullscreen')}
                  title={fullscreen ? t('flow.exitFullscreen') : t('flow.fullscreen')}
                  className="inline-flex items-center gap-1.5 border border-rule bg-surface px-2 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted hover:border-ink hover:text-ink"
                >
                  {fullscreen ? <Minimize2 size={13} aria-hidden /> : <Maximize2 size={13} aria-hidden />}
                  <span className="hidden sm:inline">
                    {fullscreen ? t('flow.exitFullscreen') : t('flow.fullscreen')}
                  </span>
                </button>
              </div>
            </div>
            {diagram === 'entities' ? (
              <EntityFlowDiagram
                flow={flow}
                selectedStep={selected}
                onSelectStep={selectStep}
                fill={fullscreen}
              />
            ) : (
              <div className={fullscreen ? 'flex min-h-0 flex-1 flex-col' : undefined}>
                <p className="mb-3 shrink-0 font-mono text-[10px] text-muted">{t('flow.clickStep')}</p>
                <FlowCanvas
                  flow={flow}
                  selectedStep={selected}
                  onSelectStep={selectStep}
                  fill={fullscreen}
                />
              </div>
            )}
            {flowMessages.length > 0 && (
              <div className="mt-3 flex shrink-0 flex-wrap items-center gap-1.5 border-t border-rule-soft pt-3">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted">{t('flow.messages')}</span>
                {flowMessages.map((short) => {
                  const first = flow.steps.find((s) => s.messageShort === short);
                  const active = step.messageShort === short;
                  return (
                    <button
                      key={short}
                      type="button"
                      onClick={() => first && selectStep(first.n)}
                      className={cn(
                        'inline-flex items-center gap-1 border px-2 py-1 font-mono text-[11px]',
                        active ? 'border-ink bg-ink text-white' : 'border-rule bg-surface text-ink hover:border-ink',
                      )}
                    >
                      <MessageTypeIcon short={short} size={12} />
                      {short}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel" id="step-detail">
            <header className="flex flex-wrap items-center gap-3 border-b border-rule px-4 py-3">
              <span className="font-mono text-lg font-medium tnum text-muted">{String(step.n).padStart(2, '0')}</span>
              <h2 className="flex-1 text-base font-semibold">{step.label}</h2>
              <LayerTag layer={step.layer} />
            </header>

            <div className="space-y-4 px-4 py-4">
              {step.method && step.path && (
                <p className="flex flex-wrap items-baseline gap-2 border border-rule bg-paper-raised px-3 py-2 font-mono text-[13px]">
                  <MethodLabel method={step.method} />
                  <span className="break-all">{step.path}</span>
                  {step.httpStatus && <span className="ml-auto text-muted">→ {step.httpStatus}</span>}
                </p>
              )}

              <p className="text-sm leading-relaxed">{step.detail}</p>

              {hopMessage && (
                <MessageHopCard
                  short={hopMessage.short}
                  purpose={hopMessage.purpose}
                  currentFlowId={flow.id}
                  currentStep={step.n}
                  onSelectStep={selectStep}
                />
              )}

              {step.headers && step.headers.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-1.5">{t('flow.headers')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {step.headers.map((h) => (
                      <code key={h} className="border border-rule bg-surface px-1.5 py-1 text-[11px]">
                        {h}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {step.codes && step.codes.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-1.5">{t('flow.codesHere')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {step.codes.map((c) => (
                      <CodeChip key={c} code={c} />
                    ))}
                  </div>
                </div>
              )}

              <p className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                <ActorIcon actor={step.from} size={12} />
                <span className="font-mono uppercase tracking-wider">{step.from}</span>
                <span aria-hidden>→</span>
                <ActorIcon actor={step.to} size={12} />
                <span className="font-mono uppercase tracking-wider">{step.to}</span>
              </p>

              <nav className="flex gap-2 border-t border-rule-soft pt-4">
                <button
                  type="button"
                  disabled={selected <= 1}
                  onClick={() => selectStep(selected - 1)}
                  className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest disabled:opacity-35"
                >
                  {t('flow.prev')}
                </button>
                <button
                  type="button"
                  disabled={selected >= flow.steps.length}
                  onClick={() => selectStep(selected + 1)}
                  className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest disabled:opacity-35"
                >
                  {t('flow.next')}
                </button>
              </nav>
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          {sample ? (
            <div className="xl:sticky xl:top-[69px]" id="step-sample">
              <div className="h-[min(70vh,720px)] min-h-[480px]">
                <PayloadInspector
                  key={sample.id}
                  content={sample.content}
                  format={sample.format}
                  title={sample.label}
                  description={sample.description}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <Link to={`/samples/${sample.id}`} className="font-mono text-[11px] text-signal hover:underline">
                  {t('flow.openSample')}
                </Link>
                {step.messageShort && (
                  <Link
                    to={`/messages/${step.messageShort}`}
                    className="font-mono text-[11px] text-signal hover:underline"
                  >
                    {t('flow.allSamples', { short: step.messageShort })}
                  </Link>
                )}
                {stepShowsTry && (
                  <Link to="/try" className="font-mono text-[11px] text-signal hover:underline">
                    {t('flow.openTry')}
                  </Link>
                )}
                {stepLiveHits[0] && (
                  <Link
                    to={liveScenarioHref(stepLiveHits[0].scenario, stepLiveHits[0].beatIndex)}
                    className="font-mono text-[11px] text-signal hover:underline"
                  >
                    {t('flow.seeStepInLive')}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="panel px-4 py-6 text-sm text-muted">
              <p className="eyebrow mb-2">{t('flow.noPayload')}</p>
              <p>{t('flow.noPayloadBody')}</p>
              {stepLiveHits[0] && (
                <Link
                  to={liveScenarioHref(stepLiveHits[0].scenario, stepLiveHits[0].beatIndex)}
                  className="mt-3 inline-block font-mono text-[11px] text-signal hover:underline"
                >
                  {t('flow.seeStepInLive')}
                </Link>
              )}
            </div>
          )}

          {flow.standardId === 'berlin-group' && step.layer === 'api' && step.method && step.path && (
            <TryItPanel
              method={step.method}
              path={step.path}
              body={sample?.format === 'json' ? sample.content : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageHopCard({
  short,
  purpose,
  currentFlowId,
  currentStep,
  onSelectStep,
}: {
  short: string;
  purpose: string;
  currentFlowId: string;
  currentStep: number;
  onSelectStep: (n: number) => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const usages = usagesOfMessage(short);
  const here = usages.find((u) => u.flow.id === currentFlowId);
  const elsewhere = usages.filter((u) => u.flow.id !== currentFlowId);

  return (
    <div className="border border-violet bg-violet-soft px-3 py-3">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <MessageTypeIcon short={short} size={16} />
        <span className="eyebrow !text-violet">{t('flow.message')}</span>
        <Link to={`/messages/${short}`} className="font-mono text-signal hover:underline">
          {short}
        </Link>
        <Link to={`/messages/${short}`} className="ml-auto font-mono text-[11px] text-signal hover:underline">
          {t('flow.messagePage')}
        </Link>
      </p>
      <p className="mt-2 text-[13px] leading-relaxed">{purpose}</p>
      {here && here.steps.length > 1 && (
        <div className="mt-2">
          <p className="eyebrow mb-1">{t('flow.usageHere')}</p>
          <div className="flex flex-wrap gap-1">
            {here.steps.map((s) => {
              const label = localizeFlow(here.flow, locale).steps.find((ls) => ls.n === s.n)?.label ?? s.label;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => onSelectStep(s.n)}
                  className={cn(
                    'border px-2 py-0.5 font-mono text-[11px]',
                    s.n === currentStep ? 'border-ink bg-ink text-white' : 'border-rule bg-surface hover:border-ink',
                  )}
                >
                  {String(s.n).padStart(2, '0')} · {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {elsewhere.length > 0 && (
        <div className="mt-2">
          <p className="eyebrow mb-1">{t('flow.usageOther')}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {elsewhere.map(({ flow, steps }) => (
              <li key={flow.id}>
                <Link
                  to={`/flows/${flow.id}?step=${steps[0].n}`}
                  className="font-mono text-[11px] text-signal hover:underline"
                >
                  {localizeFlow(flow, locale).name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DiagramTab({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest',
        active ? 'bg-ink text-white' : 'border border-rule bg-surface text-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
