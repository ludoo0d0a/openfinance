import {
  ClipboardList,
  Code2,
  FileCode2,
  Globe2,
  Network,
} from 'lucide-react';
import type { ActorId } from '@/types';
import { cn } from '@/lib/cn';
import { ACTOR_ICON } from '@/lib/iconMeta';

export function ActorIcon({
  actor,
  size = 16,
  className,
}: {
  actor: ActorId;
  size?: number;
  className?: string;
}) {
  const meta = ACTOR_ICON[actor];
  const Icon = meta.Icon;
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-sm border', className)}
      style={{
        width: size + 10,
        height: size + 10,
        color: meta.color,
        backgroundColor: meta.bg,
        borderColor: meta.color,
      }}
      title={meta.label}
      aria-hidden
    >
      <Icon size={size} strokeWidth={2.25} />
    </span>
  );
}

export function LayerIcon({ layer, size = 14 }: { layer: 'api' | 'clearing'; size?: number }) {
  if (layer === 'api') {
    return <Globe2 size={size} className="text-signal" strokeWidth={2.25} aria-hidden />;
  }
  return <Network size={size} className="text-violet" strokeWidth={2.25} aria-hidden />;
}

export function MessageTypeIcon({ short, size = 14 }: { short?: string; size?: number }) {
  if (!short) return <FileCode2 size={size} className="text-muted" strokeWidth={2.25} aria-hidden />;
  if (short.startsWith('pacs.002')) {
    return <ClipboardList size={size} className="text-jade" strokeWidth={2.25} aria-hidden />;
  }
  if (short.startsWith('pacs.') || short.startsWith('pain.') || short.startsWith('camt.') || short.startsWith('acmt.')) {
    return <FileCode2 size={size} className="text-violet" strokeWidth={2.25} aria-hidden />;
  }
  return <Code2 size={size} className="text-signal" strokeWidth={2.25} aria-hidden />;
}
