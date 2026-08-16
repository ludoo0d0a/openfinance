import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { messageByShort, versionsFor } from '@/data/iso20022';
import { useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { cn } from '@/lib/cn';
import { Tag } from '@/components/Chips';

/**
 * Side-by-side comparison of two schema revisions of the same ISO message
 * (e.g. pacs.008.001.08 vs pacs.008.001.13).
 */
export function VersionCompareView() {
  const t = useT();
  const { locale } = useI18n();
  const { short } = useParams();
  const [params, setParams] = useSearchParams();
  const message = short ? messageByShort(short.replace(/-/g, '.')) : undefined;
  const versions = message ? versionsFor(message) : [];

  const leftId = params.get('from') ?? versions[0]?.id;
  const rightId = params.get('to') ?? versions[versions.length - 1]?.id;
  const left = versions.find((v) => v.id === leftId) ?? versions[0];
  const right = versions.find((v) => v.id === rightId) ?? versions[versions.length - 1];

  const [diffNotes, setDiffNotes] = useState<string[]>([]);

  useEffect(() => {
    if (message) document.title = `${message.short} versions — OpenFinance`;
  }, [message]);

  const marketsLeft = useMemo(() => new Set(left?.markets ?? []), [left]);
  const marketsRight = useMemo(() => new Set(right?.markets ?? []), [right]);

  useEffect(() => {
    if (!left || !right) return;
    const added = [...marketsRight].filter((m) => !marketsLeft.has(m));
    const removed = [...marketsLeft].filter((m) => !marketsRight.has(m));
    const notes: string[] = [];
    if (left.id === right.id) notes.push(t('compare.sameVersion'));
    else {
      notes.push(t('compare.xmlnsDiff', { from: left.id, to: right.id }));
      if (left.schemaName !== right.schemaName) {
        notes.push(t('compare.schemaDiff', { from: left.schemaName, to: right.schemaName }));
      }
      if (added.length) notes.push(t('compare.marketsAdded', { list: added.join(', ') }));
      if (removed.length) notes.push(t('compare.marketsRemoved', { list: removed.join(', ') }));
      if (left.status !== right.status) {
        notes.push(t('compare.statusDiff', { from: left.status, to: right.status }));
      }
    }
    setDiffNotes(notes);
  }, [left, right, marketsLeft, marketsRight, t]);

  if (!message || versions.length < 2 || !left || !right) return <NotFoundView />;

  function pick(side: 'from' | 'to', id: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(side, id);
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <p className="eyebrow">{t('compare.eyebrow')}</p>
      <h1 className="mt-2 text-3xl font-bold">
        {message.short} — {t('compare.title')}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t('compare.lead')}</p>
      <p className="mt-2 text-[13px]">
        <Link to={`/messages/${message.short}`} className="text-signal hover:underline">
          {t('compare.backMessage')}
        </Link>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <VersionPicker
          label={t('compare.from')}
          versions={versions}
          selected={left.id}
          onSelect={(id) => pick('from', id)}
          locale={locale}
        />
        <VersionPicker
          label={t('compare.to')}
          versions={versions}
          selected={right.id}
          onSelect={(id) => pick('to', id)}
          locale={locale}
        />
      </div>

      <section className="mt-8 panel p-4">
        <p className="eyebrow mb-3">{t('compare.diff')}</p>
        <ul className="space-y-2 text-[14px] leading-relaxed">
          {diffNotes.map((n) => (
            <li key={n} className="border-l-2 border-violet pl-3">
              {n}
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <NoteBlock title={left.id} body={left.notes[locale]} status={left.status} />
          <NoteBlock title={right.id} body={right.notes[locale]} status={right.status} />
        </div>
      </section>
    </div>
  );
}

function VersionPicker({
  label,
  versions,
  selected,
  onSelect,
  locale,
}: {
  label: string;
  versions: ReturnType<typeof versionsFor>;
  selected: string;
  onSelect: (id: string) => void;
  locale: 'en' | 'fr';
}) {
  return (
    <div className="panel p-3">
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {versions.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className={cn(
              'border px-2 py-1 font-mono text-[12px]',
              selected === v.id ? 'border-ink bg-ink text-white' : 'border-rule hover:border-ink',
            )}
            title={v.notes[locale]}
          >
            {v.id}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoteBlock({ title, body, status }: { title: string; body: string; status: string }) {
  return (
    <div className="border border-rule-soft p-3">
      <div className="flex items-center gap-2">
        <p className="font-mono text-[13px] font-medium">{title}</p>
        <Tag>{status}</Tag>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}
