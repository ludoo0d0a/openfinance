import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { messageByShort, AREA_LABELS } from '@/data/iso20022';
import { samplesForMessage } from '@/data/samples';
import { FLOWS } from '@/data/flows';
import { MessageIdPlate } from '@/components/MessageIdPlate';
import { PayloadInspector } from '@/components/PayloadInspector';
import { Tag } from '@/components/Chips';
import { namespaceFor } from '@/lib/messageId';
import { NotFoundView } from './NotFoundView';

const DIRECTION_LABELS: Record<string, string> = {
  'customer-to-bank': 'Customer → bank',
  'bank-to-customer': 'Bank → customer',
  'bank-to-bank': 'Bank → bank',
  'bank-to-csm': 'Bank → clearing',
};

export function MessageView() {
  const { short } = useParams();
  const message = short ? messageByShort(short) : undefined;
  const samples = short ? samplesForMessage(short) : [];
  const [activeSample, setActiveSample] = useState(0);
  const [edited, setEdited] = useState<string | null>(null);

  if (!message) return <NotFoundView />;

  const sample = samples[activeSample];
  const flows = FLOWS.filter((f) => message.flows.includes(f.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">{AREA_LABELS[message.area]}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{message.name}</h1>
        <div className="mt-5">
          <MessageIdPlate id={message.id} />
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{message.purpose}</p>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <section className="panel p-4">
            <h2 className="eyebrow mb-3">Facts</h2>
            <dl className="space-y-2.5 text-[13px]">
              <Fact term="Root element" value={<code>{message.rootElement}</code>} />
              <Fact term="Direction" value={DIRECTION_LABELS[message.direction] ?? message.direction} />
              <Fact
                term="Namespace"
                value={<code className="break-all text-[11px]">{namespaceFor(message.id)}</code>}
              />
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {message.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </section>

          <section className="panel p-4">
            <h2 className="eyebrow mb-2">Elements a validator will insist on</h2>
            <p className="mb-3 text-[12px] leading-relaxed text-muted">
              Not the full XSD — the paths whose absence causes the rejections you actually see in production.
            </p>
            <ul className="space-y-1">
              {message.requiredPaths.map((p) => (
                <li key={p} className="break-all border-l-2 border-rule pl-2 font-mono text-[11px] leading-relaxed">
                  {p}
                </li>
              ))}
            </ul>
          </section>

          {flows.length > 0 && (
            <section className="panel p-4">
              <h2 className="eyebrow mb-2">Appears in</h2>
              <ul className="space-y-1">
                {flows.map((f) => (
                  <li key={f.id}>
                    <Link to={`/flows/${f.id}`} className="text-[13px] text-signal hover:underline">
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="min-w-0">
          {sample ? (
            <>
              {samples.length > 1 && (
                <div className="mb-2 flex flex-wrap gap-px">
                  {samples.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSample(i);
                        setEdited(null);
                      }}
                      className={
                        i === activeSample
                          ? 'border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] text-white'
                          : 'border border-rule bg-surface px-3 py-1.5 font-mono text-[11px] text-muted hover:border-ink'
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="h-[70vh] min-h-[520px]">
                <PayloadInspector
                  content={edited ?? sample.content}
                  format={sample.format}
                  title={sample.label}
                  description={sample.description}
                  onContentChange={setEdited}
                />
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted">
                Edit in the raw tab, then run the check. {edited !== null && 'Modified — '}
                <button type="button" onClick={() => setEdited(null)} className="text-signal hover:underline">
                  reset
                </button>
              </p>
            </>
          ) : (
            <div className="panel px-4 py-8 text-sm text-muted">
              No sample bundled for {message.short} yet. Add one to <code>src/data/samples.ts</code> and it appears here,
              in search, and in any flow step that references it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{term}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
