import type { ReactNode } from 'react';

export function Label({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
