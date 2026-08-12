import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { flowById } from '@/data/flows';
import { standardById } from '@/data/standards';
import { sampleById, samplesForMessage } from '@/data/samples';
import { FlowCanvas } from '@/components/FlowCanvas';
import { EntityFlowDiagram } from '@/components/EntityFlowDiagram';
import { PayloadInspector } from '@/components/PayloadInspector';
import { CodeChip, LayerTag, MethodLabel, Tag } from '@/components/Chips';
import { TryItPanel } from '@/components/TryItPanel';
import { cn } from '@/lib/cn';
import { ActorIcon, MessageTypeIcon, UI_ICONS } from '@/lib/icons';
import { localizeFlow, useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';

type DiagramMode = 'sequence' | 'entities';

export function FlowView() {
  const t = useT();
  const { locale } = useI18n();
  const { flowId } = useParams();
  const catalogFlow = flowId ? flowById(flowId) : undefined;
  const flow = catalogFlow ? localizeFlow(catalogFlow, locale) : undefined;
  const [selected, setSelected] = useState(1);
  const [diagram, setDiagram] = useState<DiagramMode>('entities');

  useEffect(() => {
    setSelected(1);
    setDiagram('entities');
  }, [flowId]);

  const step = useMemo(() => flow?.steps.find((s) => s.n === selected) ?? flow?.steps[0], [flow, selected]);
  const sample = useMemo(() => {
    if (!step) return undefined;
    if (step.sampleId) return sampleById(step.sampleId);
    if (step.messageShort) return samplesForMessage(step.messageShort)[0];
    return undefined;
  }, [step]);
  const standard = flow ? standardById(flow.standardId) : undefined;

  if (!flow || !step) return <NotFoundView />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
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
        <p className="mt-3 border-l-2 border-ochre pl-3 text-[13px] leading-relaxed">{flow.useCase}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {flow.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
        <div className="min-w-0 space-y-6">
          <section className="panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="eyebrow">{diagram === 'entities' ? t('flow.txFlow') : t('flow.sequence')}</h2>
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
            </div>
            {diagram === 'entities' ? (
              <EntityFlowDiagram flow={flow} selectedStep={selected} onSelectStep={setSelected} />
            ) : (
              <>
                <p className="mb-3 font-mono text-[10px] text-muted">{t('flow.clickStep')}</p>
                <FlowCanvas flow={flow} selectedStep={selected} onSelectStep={setSelected} />
              </>
            )}
          </section>

          <section className="panel">
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

              {step.messageShort && (
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <MessageTypeIcon short={step.messageShort} size={16} />
                  <span>{t('flow.message')}:</span>
                  <Link to={`/messages/${step.messageShort}`} className="font-mono text-signal hover:underline">
                    {step.messageShort}
                  </Link>
                </p>
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
                  onClick={() => setSelected(selected - 1)}
                  className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest disabled:opacity-35"
                >
                  {t('flow.prev')}
                </button>
                <button
                  type="button"
                  disabled={selected >= flow.steps.length}
                  onClick={() => setSelected(selected + 1)}
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
            <div className="xl:sticky xl:top-[69px]">
              <PayloadInspector
                content={sample.content}
                format={sample.format}
                title={sample.label}
                description={sample.description}
              />
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
              </div>
            </div>
          ) : (
            <div className="panel px-4 py-6 text-sm text-muted">
              <p className="eyebrow mb-2">{t('flow.noPayload')}</p>
              <p>{t('flow.noPayloadBody')}</p>
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
