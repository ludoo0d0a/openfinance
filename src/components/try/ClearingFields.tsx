import type { PacsBuildInput } from '@/lib/pacsBuilder';
import type { EditorFieldKey } from '@/lib/pacsFields';
import { InstantField } from './InstantField';
import { ClrSysField } from './ClrSysField';
import type { ActivateFn, PatchFn, Translate } from './types';

export function ClearingFields({
  input,
  patch,
  t,
  highlighted,
  onActivate,
}: {
  input: PacsBuildInput;
  patch: PatchFn;
  t: Translate;
  highlighted: EditorFieldKey | null;
  onActivate: ActivateFn;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <InstantField
        checked={input.instant}
        patch={patch}
        t={t}
        highlighted={highlighted === 'instant'}
        onActivate={onActivate}
      />
      <ClrSysField
        value={input.clrSys}
        patch={patch}
        t={t}
        highlighted={highlighted === 'clrSys'}
        onActivate={onActivate}
      />
    </div>
  );
}
