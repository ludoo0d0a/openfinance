import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sampleById } from '@/data/samples';
import { messageByShort } from '@/data/iso20022';
import { standardById } from '@/data/standards';
import { usagesOfSample } from '@/data/flows';
import { liveScenarioHref, scenariosForSample } from '@/data/lifeScenes';
import { PayloadInspector } from '@/components/PayloadInspector';
import { localizeFlow, useI18n, useT } from '@/i18n';
import { NotFoundView } from './NotFoundView';

export function SampleView() {
  const t = useT();
  const { locale } = useI18n();
  const { sampleId } = useParams();
  const [searchParams] = useSearchParams();
  const tagQuery = searchParams.get('q') ?? '';
  const sample = sampleId ? sampleById(sampleId) : undefined;

  if (!sample) return <NotFoundView />;

  const message = sample.messageShort ? messageByShort(sample.messageShort) : undefined;
  const standard = sample.standardId ? standardById(sample.standardId) : undefined;
  const flowUsages = usagesOfSample(sample.id).map((u) => {
    const flow = localizeFlow(u.flow, locale);
    const steps = u.steps.map((s) => flow.steps.find((ls) => ls.n === s.n) ?? s);
    return { flow, steps };
  });
  const liveHits = scenariosForSample(sample.id);

  return (
    <div className="page-fluid">
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
        {flowUsages.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-2">{t('sample.usedInFlows')}</p>
            <ul className="flex flex-wrap gap-1.5">
              {flowUsages.map(({ flow, steps }) => (
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
        {liveHits.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-2">{t('sample.seeInLive')}</p>
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
      </header>

      <div className="h-[calc(100dvh-10rem)] min-h-[560px]">
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
