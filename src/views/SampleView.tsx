import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sampleById } from '@/data/samples';
import { messageByShort } from '@/data/iso20022';
import { standardById } from '@/data/standards';
import { PayloadInspector } from '@/components/PayloadInspector';
import { useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';
import { PageAd } from '@/components/PageAd';

export function SampleView() {
  const t = useT();
  const { sampleId } = useParams();
  const [searchParams] = useSearchParams();
  const tagQuery = searchParams.get('q') ?? '';
  const sample = sampleId ? sampleById(sampleId) : undefined;

  if (!sample) return <NotFoundView />;

  const message = sample.messageShort ? messageByShort(sample.messageShort) : undefined;
  const standard = sample.standardId ? standardById(sample.standardId) : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-6">
        <p className="eyebrow">{sample.format === 'xml' ? t('sample.iso') : t('sample.api')}</p>
        <h1 className="mt-2 text-3xl font-bold">{sample.label}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{sample.description}</p>
        {tagQuery && (
          <p className="mt-2 font-mono text-[12px] text-signal">
            {t('sample.highlighting', { tag: tagQuery })}
          </p>
        )}
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

      <PageAd placement="mid" />

      <div className="h-[74vh] min-h-[540px]">
        <PayloadInspector
          key={sample.id}
          content={sample.content}
          format={sample.format}
          title={sample.label}
          initialFilter={tagQuery}
        />
      </div>
    </div>
  );
}
