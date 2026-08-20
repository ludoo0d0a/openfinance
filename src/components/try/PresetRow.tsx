import type { ReactNode } from 'react';

export function PresetRow({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
