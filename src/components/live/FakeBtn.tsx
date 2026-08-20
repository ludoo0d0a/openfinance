import type { ReactNode } from 'react';

export function FakeBtn({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto border border-ink bg-ink px-3 py-2 text-center font-mono text-[12px] text-paper">
      {children}
    </div>
  );
}
