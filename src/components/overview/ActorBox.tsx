import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ActorBox({
  Icon,
  title,
  lines,
  tone,
  highlight,
}: {
  Icon: LucideIcon;
  title: string;
  lines: string[];
  tone: 'jade' | 'signal' | 'violet';
  highlight?: boolean;
}) {
  const color =
    tone === 'jade'
      ? 'text-jade border-jade bg-jade-soft'
      : tone === 'violet'
        ? 'text-violet border-violet bg-violet-soft'
        : 'text-signal border-signal bg-signal-soft';
  return (
    <div
      className={cn(
        'flex w-[7.5rem] shrink-0 flex-col border px-2.5 py-2.5 sm:w-36',
        highlight ? 'border-violet bg-violet-soft' : 'border-rule bg-paper-raised',
      )}
    >
      <span
        className={cn('mb-2 inline-flex h-7 w-7 items-center justify-center border', color)}
        aria-hidden
      >
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <p className="text-[12px] leading-snug font-semibold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-0.5 font-mono text-[10px] text-muted">
          {line}
        </p>
      ))}
    </div>
  );
}
