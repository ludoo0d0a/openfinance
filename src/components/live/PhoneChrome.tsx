import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { LifeSceneId } from '@/types';

export function PhoneChrome({ sceneId, children }: { sceneId: LifeSceneId; children: ReactNode }) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-sm flex-1 flex-col border border-ink bg-surface shadow-[4px_4px_0_0_rgba(0,0,0,0.06)]',
        sceneId === 'bank' && 'max-w-md',
      )}
    >
      <div className="flex items-center justify-center border-b border-rule py-2">
        <span className="h-1.5 w-16 rounded-full bg-ink/20" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </div>
  );
}
