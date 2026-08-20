import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function FieldDef({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('mt-0.5 text-[10px] leading-snug text-muted', className)}>{children}</p>;
}
