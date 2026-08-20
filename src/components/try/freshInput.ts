import { DEFAULT_PACS_INPUT, type PacsBuildInput } from '@/lib/pacsBuilder';
import { resolveDateOnly, resolveDateTime } from '@/lib/relativeDates';

export function freshInput(): PacsBuildInput {
  const settlementDate = resolveDateOnly('today');
  const createdAt = resolveDateTime('now');
  return {
    ...DEFAULT_PACS_INPUT,
    settlementDate,
    createdAt,
    grpSettlementDate: settlementDate,
    accptncDtTm: createdAt,
  };
}
