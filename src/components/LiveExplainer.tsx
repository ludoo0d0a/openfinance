import { Link } from 'react-router-dom';
import { PayloadInspector } from '@/components/PayloadInspector';
import { TryItPanel } from '@/components/TryItPanel';
import { flowById } from '@/data/flows';
import type { ResolvedBeat } from '@/components/live/resolveLiveBeat';
import { localizeFlow, useI18n, useT } from '@/i18n';
import type { LifeScenario } from '@/types';

interface Props {
  scenario: LifeScenario;
  resolved: ResolvedBeat;
  bankDeepLinkId?: string;
}

export function LiveExplainer({ scenario, resolved, bankDeepLinkId }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const flow = resolved.flowId ? flowById(resolved.flowId) : undefined;
  const localized = flow ? localizeFlow(flow, locale) : undefined;
  const step =
    localized && resolved.step ? localized.steps.find((s) => s.n === resolved.step) : undefined;

  return (
    <section className="flex h-full min-h-[28rem] flex-col gap-4">
      <div className="panel px-4 py-3">
        <p className="eyebrow">{t('live.explainer')}</p>
        <h3 className="mt-1 text-sm font-semibold">
          {step?.label ?? resolved.hopExpert?.[locale] ?? resolved.stepLabel ?? scenario.title[locale]}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {step?.detail ?? resolved.hopSimple?.[locale] ?? resolved.stepDetail ?? scenario.blurb[locale]}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {resolved.flowId && (
            <li>
              <Link
                to={resolved.step ? `/flows/${resolved.flowId}?step=${resolved.step}` : `/flows/${resolved.flowId}`}
                className="text-signal hover:underline"
              >
                {t('live.openFlow')}
              </Link>
            </li>
          )}
          {resolved.paymentId && (
            <li>
              <Link to={`/payment/${resolved.paymentId}`} className="text-signal hover:underline">
                {t('live.openPayment')}
              </Link>
            </li>
          )}
          {resolved.sample && (
            <li>
              <Link to={`/samples/${resolved.sample.id}`} className="text-signal hover:underline">
                {t('live.openSample')}
              </Link>
            </li>
          )}
          {resolved.messageShort && (
            <li>
              <Link to={`/messages/${resolved.messageShort}`} className="text-signal hover:underline">
                {resolved.messageShort}
              </Link>
            </li>
          )}
          {scenario.pairScenarioId && (
            <li>
              <Link
                to={pairHref(scenario)}
                className="text-signal hover:underline"
              >
                {scenario.sceneId === 'receive' ? t('live.alexSide') : t('live.marieSide')}
              </Link>
            </li>
          )}
          {bankDeepLinkId && (
            <li>
              <Link to={`/live/bank/${bankDeepLinkId}`} className="text-signal hover:underline">
                {t('live.seeBanks')}
              </Link>
            </li>
          )}
        </ul>
      </div>

      {resolved.sample && (
        <div className="min-h-0 flex-1">
          <PayloadInspector
            content={resolved.sample.content}
            format={resolved.sample.format}
            title={resolved.sample.label}
            description={resolved.sample.description}
          />
        </div>
      )}

      {resolved.showTryIt && resolved.method && resolved.path && (
        <TryItPanel
          method={resolved.method}
          path={resolved.path}
          body={resolved.sample?.format === 'json' ? resolved.sample.content : undefined}
        />
      )}

      {!resolved.sample && !resolved.showTryIt && (
        <div className="panel px-4 py-6 text-sm text-muted">
          <p className="eyebrow mb-2">{t('live.noPayload')}</p>
          <p>{t('live.noPayloadBody')}</p>
        </div>
      )}
    </section>
  );
}

function pairHref(scenario: LifeScenario): string {
  const pairId = scenario.pairScenarioId!;
  // Pair scenarios live on wallet ↔ receive
  if (scenario.sceneId === 'receive') return `/live/wallet/${pairId}`;
  if (scenario.sceneId === 'wallet') return `/live/receive/${pairId}`;
  return `/live`;
}
