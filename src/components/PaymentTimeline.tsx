import { cn } from '@/lib/cn';
import type { JourneyHopView, JourneyView } from '@/lib/paymentJourney';
import { JargonText } from '@/components/JargonText';
import { useT } from '@/i18n';

export function PaymentTimeline({
  journey,
  selectedHopId,
  onSelectHop,
  compareHops,
}: {
  journey: JourneyView;
  selectedHopId: string | undefined;
  onSelectHop: (id: string) => void;
  compareHops?: JourneyHopView[];
}) {
  const t = useT();

  return (
    <ol className="relative space-y-0">
      {journey.hops.map((hop, i) => {
        const selected = hop.id === selectedHopId;
        const peer = compareHops?.[i];
        return (
          <li key={hop.id} className="relative flex gap-3 pb-6 last:pb-0">
            <div className="flex w-10 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center border font-mono text-[11px]',
                  selected ? 'border-ink bg-ink text-white' : 'border-rule bg-surface text-muted',
                )}
              >
                {String(hop.n).padStart(2, '0')}
              </span>
              {i < journey.hops.length - 1 && <span className="mt-1 w-px flex-1 bg-rule" />}
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelectHop(hop.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectHop(hop.id);
                }
              }}
              className={cn(
                'min-w-0 flex-1 cursor-pointer border px-3 py-2.5 text-left transition-colors',
                selected ? 'border-ink bg-paper-raised' : 'border-rule bg-surface hover:border-ink',
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {t(`explorer.actor.${hop.from}`)}
                  <span className="mx-1 text-rule">→</span>
                  {t(`explorer.actor.${hop.to}`)}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selected && (
                    <span className="border border-jade bg-jade-soft px-1.5 py-0.5 font-mono text-[10px] text-jade">
                      €100
                    </span>
                  )}
                  {hop.tOffset && (
                    <span className="font-mono text-[10px] text-muted">{hop.tOffset}</span>
                  )}
                  {hop.sla && <span className="font-mono text-[10px] text-violet">{hop.sla}</span>}
                </div>
              </div>
              <p className="mt-1.5 text-[14px] leading-snug">
                <JargonText text={hop.label} />
              </p>
              {hop.expert && hop.expert !== hop.label && (
                <p className="mt-1 font-mono text-[12px] text-violet">{hop.expert}</p>
              )}
              {peer && (
                <p className="mt-2 border-t border-rule-soft pt-2 text-[12px] leading-snug text-muted">
                  <span className="font-mono text-[10px] uppercase tracking-widest">{t('explorer.compareVs')} · </span>
                  {peer.label}
                  {peer.expert && peer.expert !== peer.label ? ` (${peer.expert})` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
