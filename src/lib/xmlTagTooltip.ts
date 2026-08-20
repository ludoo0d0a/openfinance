import { isoElementTip } from '@/data/isoElements';
import type { Locale } from '@/types';
import { resolveXmlField } from './pacsFields';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Tooltip text for an XML tree tag or attribute.
 * Prefer Try form field definitions when the path maps; else ISO element dict.
 */
export function xmlTagTooltip(args: {
  selector?: string;
  localName: string;
  t: Translate;
  locale: Locale;
}): string | undefined {
  if (args.selector) {
    const field = resolveXmlField(args.selector);
    if (field) return args.t(field.defKey);
  }
  return isoElementTip(args.localName, args.locale);
}
