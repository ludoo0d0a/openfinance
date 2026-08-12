import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { flowById, CATEGORY_LABELS } from '@/data/flows';
import { standardById } from '@/data/standards';
import { sampleById } from '@/data/samples';
import { FlowCanvas } from '@/components/FlowCanvas';
import { PayloadInspector } from '@/components/PayloadInspector';
import { CodeChip, LayerTag, MethodLabel, Tag } from '@/components/Chips';
import { TryItPanel } from '@/components/TryItPanel';
import { NotFoundView } from './NotFoundView';

export function FlowView() {
  const { flowId } = useParams();
  const flow = flowId ? flowById(flowId) : undefined;
  const [selected, setSelected] = useState(1);

  useEffect(() => setSelected(1), [flowId]);

  const step = useMemo(() => flow?.steps.find((s) => s.n === selected) ?? flow?.steps[0], [flow, selected]);
  const sample = step?.sampleId ? sampleById(step.sampleId) : undefined;
  const standard = flow ? standardById(flow.standardId) : undefined;

  if (!flow || !step) return <NotFoundView />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">{CATEGORY_LABELS[flow.category]}</p>
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
          {flow.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
        <div className="min-w-0 space-y-6">
          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="eyebrow">Sequence</h2>
              <p className="font-mono text-[10px] text-muted">Click a step, or tab to it and press enter</p>
            </div>
            <FlowCanvas flow={flow} selectedStep={selected} onSelectStep={setSelected} />
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
                  <h3 className="eyebrow mb-1.5">Headers that matter</h3>
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
                  <h3 className="eyebrow mb-1.5">Codes you can see here</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {step.codes.map((c) => (
                      <CodeChip key={c} code={c} />
                    ))}
                  </div>
                </div>
              )}

              {step.messageShort && (
                <p className="text-sm">
                  Message:{' '}
                  <Link to={`/messages/${step.messageShort}`} className="font-mono text-signal hover:underline">
                    {step.messageShort}
                  </Link>
                </p>
              )}

              <nav className="flex gap-2 border-t border-rule-soft pt-4">
                <button
                  type="button"
                  disabled={selected <= 1}
                  onClick={() => setSelected(selected - 1)}
                  className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest disabled:opacity-35"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={selected >= flow.steps.length}
                  onClick={() => setSelected(selected + 1)}
                  className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest disabled:opacity-35"
                >
                  Next step →
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
              <Link to={`/samples/${sample.id}`} className="mt-2 inline-block font-mono text-[11px] text-signal hover:underline">
                Open this sample on its own page →
              </Link>
            </div>
          ) : (
            <div className="panel px-4 py-6 text-sm text-muted">
              <p className="eyebrow mb-2">No payload</p>
              <p>
                This step is a redirect, a wait or an out-of-band event — there is no message on the wire to inspect.
                Steps with a payload are marked with a method or a message id in the diagram.
              </p>
            </div>
          )}

          {flow.standardId === 'berlin-group' && step.layer === 'api' && step.method && step.path && (
            <TryItPanel method={step.method} path={step.path} body={sample?.format === 'json' ? sample.content : undefined} />
          )}
        </div>
      </div>
    </div>
  );
}
