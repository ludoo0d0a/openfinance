import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sampleById } from '@/data/samples';
import { messageByShort } from '@/data/iso20022';
import { standardById } from '@/data/standards';
import { PayloadInspector } from '@/components/PayloadInspector';
import { NotFoundView } from './NotFoundView';

export function SampleView() {
  const { sampleId } = useParams();
  const sample = sampleId ? sampleById(sampleId) : undefined;
  const [content, setContent] = useState(sample?.content ?? '');

  if (!sample) return <NotFoundView />;

  const message = sample.messageShort ? messageByShort(sample.messageShort) : undefined;
  const standard = sample.standardId ? standardById(sample.standardId) : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-6">
        <p className="eyebrow">{sample.format === 'xml' ? 'ISO 20022 sample' : 'API sample'}</p>
        <h1 className="mt-2 text-3xl font-bold">{sample.label}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{sample.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px]">
          {message && (
            <Link to={`/messages/${message.short}`} className="text-signal hover:underline">
              {message.short} · {message.name} →
            </Link>
          )}
          {standard && (
            <Link to={`/standards/${standard.id}`} className="text-signal hover:underline">
              {standard.name} →
            </Link>
          )}
        </div>
      </header>

      <div className="h-[74vh] min-h-[540px]">
        <PayloadInspector
          content={content}
          format={sample.format}
          title={sample.label}
          onContentChange={setContent}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(content)}
          className="border border-rule px-3 py-1.5 uppercase tracking-widest hover:border-ink"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => setContent(sample.content)}
          className="border border-rule px-3 py-1.5 uppercase tracking-widest hover:border-ink"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
