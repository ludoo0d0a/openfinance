import type { PacsBuildInput } from '@/lib/pacsBuilder';
import type { EditorFieldKey } from '@/lib/pacsFields';

export type FieldKey = keyof PacsBuildInput;

export type PatchFn = <K extends FieldKey>(key: K, value: PacsBuildInput[K]) => void;

export type ActivateFn = (key: EditorFieldKey, source: 'form' | 'xml') => void;

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

export type Selection = {
  source: 'form' | 'xml';
  fieldKey: EditorFieldKey;
  paths: string[];
};
