import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { messageByShort } from '@/data/iso20022';
import { samplesForMessage } from '@/data/samples';
import { FLOWS } from '@/data/flows';
import { MessageIdPlate } from '@/components/MessageIdPlate';
import { PayloadInspector } from '@/components/PayloadInspector';
import { Tag } from '@/components/Chips';
import { namespaceFor } from '@/lib/messageId';
import { useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';

const DIRECTION_KEYS: Record<string, string> = {
  'customer-to-bank': 'message.dirCustomerBank',
  'bank-to-customer': 'message.dirBankCustomer',
  'bank-to-bank': 'message.dirBankBank',
  'bank-to-csm': 'message.dirBankCsm',
};

export function MessageView() {
  const t = useT();
  const { short } = useParams();
  const [searchParams] = useSearchParams();
  const tagQuery = searchParams.get('q') ?? '';
  const message = short ? messageByShort(short) : undefined;
  const samples = short
    ? samplesForMessage(short).filter((s) => !s.id.endsWith('-json'))
    : [];
  const [activeSample, setActiveSample] = useState(0);
  const [edited, setEdited] = useState<string | null>(null);

  useEffect(() => {
    setActiveSample(0);
    setEdited(null);
  }, [short]);

  if (!message) return <NotFoundView />;

  const sample = samples[activeSample];
  const flows = FLOWS.filter((f) => message.flows.includes(f.id));
  const isAck = message.short === 'pacs.002';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">
          {t(`area.${message.area}`)}
          {isAck && ' · acknowledgement'}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{message.name}</h1>
        <div className="mt-5">
          <MessageIdPlate id={message.id} />
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{message.purpose}</p>
        {isAck && (
          <p className="mt-3 border-l-2 border-jade pl-3 text-[13px] leading-relaxed">
            This is the clearing acknowledgement: <code className="font-mono text-[12px]">TxSts</code> carries{' '}
            <code className="font-mono text-[12px]">ACSC</code> (settled), <code className="font-mono text-[12px]">RJCT</code>{' '}
            (refused) and friends. Pair it with the original{' '}
            <Link to="/messages/pacs.008" className="text-signal hover:underline">
              pacs.008
            </Link>
            , or{' '}
            <Link to="/try" className="text-signal hover:underline">
              build both in the Try editor
            </Link>
            .
          </p>
        )}
        {message.short === 'pacs.008' && (
          <p className="mt-3 border-l-2 border-signal pl-3 text-[13px] leading-relaxed">
            Build a custom pacs.008 and see the matching{' '}
            <Link to="/try" className="text-signal hover:underline">
              pacs.002 acknowledgement in the Try editor
            </Link>
            .
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <section className="panel p-4">
            <h2 className="eyebrow mb-3">{t('message.facts')}</h2>
            <dl className="space-y-2.5 text-[13px]">
              <Fact term={t('message.root')} value={<code>{message.rootElement}</code>} />
              <Fact term={t('message.direction')} value={DIRECTION_KEYS[message.direction] ? t(DIRECTION_KEYS[message.direction]) : message.direction} />
              <Fact
                term={t('message.namespace')}
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
            <h2 className="eyebrow mb-2">{t('message.required')}</h2>
            <p className="mb-3 text-[12px] leading-relaxed text-muted">{t('message.requiredHint')}</p>
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
              <h2 className="eyebrow mb-2">{t('message.appearsIn')}</h2>
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
                      {s.format.toUpperCase()} · {s.label.replace(/\s*\(JSON\)\s*$/i, '')}
                    </button>
                  ))}
                </div>
              )}
              <div className="h-[70vh] min-h-[520px]">
                <PayloadInspector
                  content={edited ?? sample.content}
                  format={sample.format}
                  title={sample.label}
                  description={
                    sample.format === 'xml'
                      ? `${sample.description} Switch XML | JSON in the inspector without leaving this sample.`
                      : sample.description
                  }
                  onContentChange={setEdited}
                  allowAltFormat={sample.format === 'xml' || sample.format === 'json'}
                  initialFilter={tagQuery}
                />
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted">
                {t('message.editHint')} {edited !== null && `${t('message.modified')} `}
                <button type="button" onClick={() => setEdited(null)} className="text-signal hover:underline">
                  {t('message.reset')}
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
