import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border border-rule bg-surface px-3 py-3', className)}>{children}</div>;
}
