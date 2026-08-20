import { flowById } from '@/data/flows';
import { paymentById } from '@/data/payments';
import { sampleById } from '@/data/samples';
import type { LifeBeat, LifeScenario } from '@/types';

export interface ResolvedBeat {
  beat: LifeBeat;
  flowName?: string;
  stepLabel?: string;
  stepDetail?: string;
  hopExpert?: { en: string; fr: string };
  hopSimple?: { en: string; fr: string };
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path?: string;
  sample?: ReturnType<typeof sampleById>;
  messageShort?: string;
  flowId?: string;
  step?: number;
  paymentId?: string;
  showTryIt: boolean;
}

export function resolveLiveBeat(beat: LifeBeat, scenario: LifeScenario): ResolvedBeat {
  const flow = beat.flowId ? flowById(beat.flowId) : undefined;
  const step = flow && beat.step ? flow.steps.find((s) => s.n === beat.step) : undefined;
  const payment = beat.paymentId
    ? paymentById(beat.paymentId)
    : scenario.paymentId
      ? paymentById(scenario.paymentId)
      : undefined;
  const hop = beat.hopId && payment ? payment.hops.find((h) => h.id === beat.hopId) : undefined;

  const sampleId = beat.sampleId ?? step?.sampleId ?? hop?.sampleId;
  const sample = sampleId ? sampleById(sampleId) : undefined;
  const messageShort = step?.messageShort ?? hop?.messageShort;
  const method = step?.method;
  const path = step?.path;
  const showTryIt = Boolean(flow?.standardId === 'berlin-group' && step?.layer === 'api' && method && path);

  return {
    beat,
    flowName: flow?.name,
    stepLabel: step?.label,
    stepDetail: step?.detail,
    hopExpert: hop?.expertLabel,
    hopSimple: hop?.simpleText,
    method,
    path,
    sample,
    messageShort,
    flowId: beat.flowId ?? hop?.flowId,
    step: beat.step ?? hop?.step,
    paymentId: beat.paymentId ?? scenario.paymentId,
    showTryIt,
  };
}
