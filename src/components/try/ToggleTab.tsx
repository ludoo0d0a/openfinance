import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Shared segmented control tab used by mode switcher and outcome picker. */
export function ToggleTab({
  active,
  onClick,
  children,
  size = 'md',
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 font-mono uppercase tracking-wider',
        size === 'sm'
          ? 'px-2 py-1 text-[10px]'
          : 'flex-1 justify-center gap-1.5 px-3 py-1.5 text-[11px] tracking-widest',
        active ? 'bg-ink text-white' : 'border border-rule bg-surface text-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
