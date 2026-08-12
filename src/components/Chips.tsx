import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { codeByValue } from '@/data/codes';
import { cn } from '@/lib/cn';
import type { CodeEntry, Endpoint } from '@/types';

const severityClass: Record<CodeEntry['severity'], string> = {
  success: 'border-jade bg-jade-soft text-jade',
  pending: 'border-ochre bg-ochre-soft text-ochre',
  error: 'border-vermillion bg-vermillion-soft text-vermillion',
  info: 'border-rule bg-paper-raised text-muted',
};

/**
 * Codes are the currency of payments debugging, so every one that appears
 * anywhere in the app links back to the registry entry that explains it.
 */
export function CodeChip({ code, size = 'sm' }: { code: string; size?: 'sm' | 'md' }) {
  const entry = codeByValue(code);
  const cls = entry ? severityClass[entry.severity] : 'border-rule bg-paper-raised text-muted';

  return (
    <Link
      to={`/codes?q=${encodeURIComponent(code)}`}
      title={entry ? `${entry.name} — ${entry.description}` : 'Not in the registry'}
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
        'border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        layer === 'api' ? 'border-signal bg-signal-soft text-signal' : 'border-violet bg-violet-soft text-violet',
      )}
    >
      {layer === 'api' ? 'API layer' : 'Clearing layer'}
    </span>
  );
}
