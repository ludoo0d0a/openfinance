import type { ReactNode } from 'react';

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-3">{children}</div>;
}
