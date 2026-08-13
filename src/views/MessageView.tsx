import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  MESSAGE_MARKET_LABELS,
  messageByShort,
  versionById,
  versionsFor,
} from '@/data/iso20022';
import { samplesForMessage } from '@/data/samples';
import { usagesOfMessage } from '@/data/flows';
import { MessageIdPlate } from '@/components/MessageIdPlate';
import { PayloadInspector } from '@/components/PayloadInspector';
import { Tag } from '@/components/Chips';
import { messageIdFromPayload, namespaceFor, parseMessageId } from '@/lib/messageId';
import { cn } from '@/lib/cn';
import { localizeFlow, useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';

const DIRECTION_KEYS: Record<string, string> = {
  'customer-to-bank': 'message.dirCustomerBank',
  'bank-to-customer': 'message.dirBankCustomer',
  'bank-to-bank': 'message.dirBankBank',
  'bank-to-csm': 'message.dirBankCsm',
};

const STATUS_KEYS = {
  current: 'message.versionCurrent',
  legacy: 'message.versionLegacy',
  upcoming: 'message.versionUpcoming',
} as const;

export function MessageView() {
  const t = useT();
  const { locale } = useI18n();
  const { short } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagQuery = searchParams.get('q') ?? '';
  const versionParam = searchParams.get('v');

  const message = short ? messageByShort(short) : undefined;
  const versions = message ? versionsFor(message) : [];
  const selectedVersion =
    (versionParam && message ? versionById(message, versionParam) : undefined) ??
    versions.find((v) => v.id === message?.id) ??
    versions[0];

  const samples = useMemo(() => {
    if (!short) return [];
    const all = samplesForMessage(short).filter((s) => !s.id.endsWith('-json'));
    if (!selectedVersion) return all;
    const matching = all.filter((s) => messageIdFromPayload(s.content) === selectedVersion.id);
    return matching.length > 0 ? matching : all;
  }, [short, selectedVersion]);

  const [activeSample, setActiveSample] = useState(0);
  const [edited, setEdited] = useState<string | null>(null);

  useEffect(() => {
    setActiveSample(0);
    setEdited(null);
  }, [short, selectedVersion?.id]);

  if (!message || !selectedVersion) return <NotFoundView />;

  const sample = samples[activeSample];
  const usages = usagesOfMessage(message.short).map((u) => {
    const flow = localizeFlow(u.flow, locale);
    const steps = u.steps.map((s) => flow.steps.find((ls) => ls.n === s.n) ?? s);
    return { flow, steps };
  });
  const isAck = message.short === 'pacs.002';
  const parts = parseMessageId(selectedVersion.id);
  const sampleMatchesVersion =
    !sample || messageIdFromPayload(sample.content) === selectedVersion.id;

  function selectVersion(id: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === message!.id) next.delete('v');
        else next.set('v', id);
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">
          {t(`area.${message.area}`)}
          {isAck && ` · ${t('message.ackEyebrow')}`}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{selectedVersion.schemaName}</h1>
        <div className="mt-5">
          <MessageIdPlate id={selectedVersion.id} />
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{message.purpose}</p>
        {isAck && (
          <p className="mt-3 border-l-2 border-jade pl-3 text-[13px] leading-relaxed">{t('message.ackNote')}</p>
        )}
        {message.short === 'pacs.008' && (
          <p className="mt-3 border-l-2 border-signal pl-3 text-[13px] leading-relaxed">{t('message.build008')}</p>
        )}
        {usages.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-2">{t('message.appearsIn')}</p>
            <ul className="flex flex-wrap gap-1.5">
              {usages.map(({ flow, steps }) => (
                <li key={flow.id}>
                  <Link
                    to={`/flows/${flow.id}?step=${steps[0].n}`}
                    className="inline-flex items-center gap-1.5 border border-rule bg-surface px-2 py-1 text-[13px] hover:border-ink"
                  >
                    <span>{flow.name}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {steps.map((s) => String(s.n).padStart(2, '0')).join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {versions.length > 1 && (
        <section className="mt-8 max-w-4xl">
          <h2 className="eyebrow mb-1">{t('message.versions')}</h2>
          <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-muted">{t('message.versionsLead')}</p>
          <div className="flex flex-wrap gap-2">
            {versions.map((v) => {
              const vp = parseMessageId(v.id);
              const active = v.id === selectedVersion.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVersion(v.id)}
                  className={cn(
                    'min-w-[10.5rem] border px-3 py-2 text-left transition-colors',
                    active ? 'border-ink bg-ink text-white' : 'border-rule bg-surface hover:border-ink',
                  )}
                >
                  <span className="block font-mono text-[13px] font-medium tnum">{v.id}</span>
                  <span
                    className={cn(
                      'mt-1 block font-mono text-[10px] uppercase tracking-wider',
                      active ? 'text-white/70' : 'text-muted',
                    )}
                  >
                    {t(STATUS_KEYS[v.status])}
                    {vp.version ? ` · v${vp.version}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="panel mt-3 space-y-2 p-4">
            <p className="text-[13px] leading-relaxed">{selectedVersion.notes[locale] ?? selectedVersion.notes.en}</p>
            {selectedVersion.markets.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {t('message.markets')}
                </span>
                {selectedVersion.markets.map((m) => (
                  <Tag key={m}>{MESSAGE_MARKET_LABELS[m]?.[locale] ?? MESSAGE_MARKET_LABELS[m]?.en ?? m}</Tag>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <section className="panel p-4">
            <h2 className="eyebrow mb-3">{t('message.facts')}</h2>
            <dl className="space-y-2.5 text-[13px]">
              <Fact term={t('message.root')} value={<code>{message.rootElement}</code>} />
              <Fact
                term={t('message.direction')}
                value={DIRECTION_KEYS[message.direction] ? t(DIRECTION_KEYS[message.direction]) : message.direction}
              />
              <Fact
                term={t('message.namespace')}
                value={<code className="break-all text-[11px]">{namespaceFor(selectedVersion.id)}</code>}
              />
              {parts.valid && (
                <>
                  <Fact term={t('message.variant')} value={<code>{parts.variant}</code>} />
                  <Fact term={t('message.version')} value={<code>{parts.version}</code>} />
                </>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {message.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
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

          {usages.length > 0 && (
            <section className="panel p-4">
              <h2 className="eyebrow mb-2">{t('message.usage')}</h2>
              <ul className="space-y-3">
                {usages.map(({ flow, steps }) => (
                  <li key={flow.id}>
                    <Link to={`/flows/${flow.id}?step=${steps[0].n}`} className="text-[13px] font-medium text-signal hover:underline">
                      {flow.name}
                    </Link>
                    <ul className="mt-1 space-y-0.5">
                      {steps.map((s) => (
                        <li key={s.n}>
                          <Link
                            to={`/flows/${flow.id}?step=${s.n}`}
                            className="font-mono text-[11px] text-muted hover:text-ink hover:underline"
                          >
                            {String(s.n).padStart(2, '0')} · {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="min-w-0">
          {sample ? (
            <>
              {!sampleMatchesVersion && (
                <p className="mb-2 border border-ochre bg-ochre/10 px-3 py-2 text-[12px] leading-relaxed text-ink">
                  {t('message.sampleVersionMismatch', { version: selectedVersion.id })}
                </p>
              )}
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
                      ? `${sample.description} ${t('message.xmlJsonHint')}`
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
            <div className="panel px-4 py-8 text-sm text-muted">{t('message.noSample', { short: message.short })}</div>
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
