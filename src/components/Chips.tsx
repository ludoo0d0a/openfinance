import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { codeByValue } from '@/data/thesaurus';
import { cn } from '@/lib/cn';
import { LayerIcon } from '@/lib/icons';
import type { CodeEntry, Endpoint } from '@/types';

const severityClass: Record<CodeEntry['severity'], string> = {
  success: 'border-jade bg-jade-soft text-jade',
  pending: 'border-ochre bg-ochre-soft text-ochre',
  error: 'border-vermillion bg-vermillion-soft text-vermillion',
  info: 'border-rule bg-paper-raised text-muted',
};

/**
 * Codes are the currency of payments debugging, so every one that appears
 * anywhere in the app links back to the thesaurus entry that explains it.
 */
export function CodeChip({ code, size = 'sm' }: { code: string; size?: 'sm' | 'md' }) {
  const entry = codeByValue(code);
  const cls = entry?.severity ? severityClass[entry.severity] : 'border-rule bg-paper-raised text-muted';
  const href = entry
    ? `/thesaurus?category=code&id=${encodeURIComponent(entry.id)}`
    : `/thesaurus?category=code&q=${encodeURIComponent(code)}`;

  return (
    <Link
      to={href}
      title={entry ? `${entry.name.en} — ${entry.definition.en}` : 'Not in the thesaurus'}
      className={cn(
        'inline-block border font-mono leading-none transition-opacity hover:opacity-75',
        cls,
        size === 'sm' ? 'px-1.5 py-1 text-[11px]' : 'px-2 py-1.5 text-xs',
      )}
    >
      {code}
    </Link>
  );
}

const methodClass: Record<Endpoint['method'], string> = {
  GET: 'text-signal',
  POST: 'text-jade',
  PUT: 'text-ochre',
  PATCH: 'text-ochre',
  DELETE: 'text-vermillion',
};

export function MethodLabel({ method }: { method: Endpoint['method'] }) {
  return <span className={cn('font-mono text-[11px] font-semibold', methodClass[method])}>{method}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-rule bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

export function LayerTag({ layer }: { layer: 'api' | 'clearing' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        layer === 'api' ? 'border-signal bg-signal-soft text-signal' : 'border-violet bg-violet-soft text-violet',
      )}
    >
      <LayerIcon layer={layer} size={12} />
      {layer === 'api' ? 'API layer' : 'Clearing layer'}
    </span>
  );
}
