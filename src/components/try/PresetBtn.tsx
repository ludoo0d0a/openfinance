import type { ReactNode } from 'react';

export function PresetBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="border border-rule bg-paper-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}
