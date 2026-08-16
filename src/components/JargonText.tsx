import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { glossaryById, glossaryHref } from '@/data/glossary';

const TERMS: { pattern: RegExp; id: string }[] = [
  { pattern: /Verification of Payee/gi, id: 'vop' },
  { pattern: /\bVoP\b/g, id: 'vop' },
  { pattern: /\bIBAN\b/g, id: 'iban' },
  { pattern: /\bTIPS\b/g, id: 'tips' },
  { pattern: /\bRT1\b/g, id: 'rt1' },
  { pattern: /\bSTEP2\b/g, id: 'step2' },
  { pattern: /\bCSM\b/g, id: 'csm' },
  { pattern: /\bSEPA\b/g, id: 'sepa' },
];

/** Link known payment jargon to the glossary. Safe to nest outside a <button>. */
export function JargonText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    let earliest = -1;
    let hit: { start: number; end: number; id: string; lex: string } | undefined;
    for (const term of TERMS) {
      const re = new RegExp(term.pattern.source, term.pattern.flags);
      const m = re.exec(rest);
      if (!m || m.index < 0) continue;
      if (earliest === -1 || m.index < earliest) {
        earliest = m.index;
        hit = { start: m.index, end: m.index + m[0].length, id: term.id, lex: m[0] };
      }
    }
    if (!hit) {
      nodes.push(rest);
      break;
    }
    if (hit.start > 0) nodes.push(rest.slice(0, hit.start));
    const entry = glossaryById(hit.id);
    if (entry) {
      nodes.push(
        <Link
          key={key++}
          to={glossaryHref(entry)}
          className="underline decoration-rule underline-offset-2 hover:decoration-ink"
          title={entry.name.en}
          onClick={(e) => e.stopPropagation()}
        >
          {hit.lex}
        </Link>,
      );
    } else {
      nodes.push(hit.lex);
    }
    rest = rest.slice(hit.end);
  }
  return <Fragment>{nodes}</Fragment>;
}
