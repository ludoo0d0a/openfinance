import { Link, useParams } from 'react-router-dom';
import { standardById } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { samplesForStandard } from '@/data/samples';
import { MethodLabel, Tag } from '@/components/Chips';
import { useT, useI18n, localizeFlows } from '@/i18n';
import { NotFoundView } from './NotFoundView';

export function StandardView() {
  const t = useT();
  const { locale } = useI18n();
  const { standardId } = useParams();
  const standard = standardId ? standardById(standardId) : undefined;

  if (!standard) return <NotFoundView />;

  const flows = localizeFlows(
    FLOWS.filter((f) => f.standardId === standard.id),
    locale,
  );
  const samples = samplesForStandard(standard.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">{standard.publisher}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{standard.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag>{standard.region}</Tag>
          <Tag>v{standard.version}</Tag>
          <Tag>{standard.status}</Tag>
          <a
            href={standard.docsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[11px] text-signal hover:underline"
          >
            {t('standard.publisherDocs')}
          </a>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{standard.summary}</p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="panel p-4">
          <h2 className="eyebrow mb-3">{t('standard.security')}</h2>
          <dl className="space-y-3 text-[13px]">
            {(
              [
                [t('standard.clientAuth'), standard.security.clientAuth],
                [t('standard.messageSigning'), standard.security.messageSigning],
                [t('standard.tokens'), standard.security.tokens],
                [t('standard.certificates'), standard.security.certificates],
              ] as const
            ).map(([term, def]) => (
              <div key={term}>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{term}</dt>
                <dd className="mt-0.5 leading-relaxed">{def}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h2 className="eyebrow mb-2">{t('standard.sca')}</h2>
            <div className="flex flex-wrap gap-1.5">
              {standard.scaApproaches.map((a) => (
                <Tag key={a}>{a}</Tag>
              ))}
            </div>
          </div>

          <div className="panel border-ochre p-4">
            <h2 className="eyebrow mb-2 text-ochre">{t('standard.gotchas')}</h2>
            <ul className="space-y-2 text-[13px] leading-relaxed">
              {standard.gotchas.map((g, i) => (
                <li key={i} className="border-l-2 border-ochre pl-3">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="eyebrow mb-3">{t('standard.apisEndpoints')}</h2>
        <div className="space-y-5">
          {standard.apis.map((api) => (
            <div key={api.id} id={api.id} className="panel scroll-mt-20">
              <header className="border-b border-rule px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-semibold">{api.name}</h3>
                  <Tag>{api.role}</Tag>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{api.summary}</p>
              </header>
              <ul className="divide-y divide-rule-soft">
                {api.endpoints.map((ep) => (
                  <li key={`${ep.method}-${ep.path}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2">
                    <span className="w-14 shrink-0">
                      <MethodLabel method={ep.method} />
                    </span>
                    <code className="min-w-0 flex-1 break-all text-[12.5px]">{ep.path}</code>
                    <span className="w-full text-[12.5px] text-muted sm:w-auto sm:max-w-[46%]">{ep.summary}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {flows.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3">{t('standard.flowsUsing')}</h2>
          <ul className="panel divide-y divide-rule-soft">
            {flows.map((f) => (
              <li key={f.id}>
                <Link to={`/flows/${f.id}`} className="block px-4 py-2.5 hover:bg-paper-raised">
                  <span className="text-sm font-medium">{f.name}</span>
                  <span className="ml-2 font-mono text-[10px] text-muted">{t('standard.steps', { count: f.steps.length })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {samples.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3">{t('standard.samplePayloads')}</h2>
          <ul className="panel divide-y divide-rule-soft">
            {samples.map((s) => (
              <li key={s.id}>
                <Link to={`/samples/${s.id}`} className="block px-4 py-2.5 hover:bg-paper-raised">
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="ml-2 font-mono text-[10px] uppercase text-muted">{s.format}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
