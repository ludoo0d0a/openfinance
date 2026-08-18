import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { glossaryById, glossaryHref } from '@/data/glossary';

type Term = { pattern: RegExp; id: string | ((lex: string) => string) };

const TERMS: Term[] = [
  { pattern: /Verification of Payee/gi, id: 'vop' },
  { pattern: /Vérification du bénéficiaire/gi, id: 'vop' },
  { pattern: /\bVoP\b/g, id: 'vop' },
  { pattern: /SEPA Instant Credit Transfer/gi, id: 'sct-inst' },
  { pattern: /Virement SEPA instantané/gi, id: 'sct-inst' },
  { pattern: /SEPA Credit Transfer/gi, id: 'sct' },
  { pattern: /Virement SEPA/gi, id: 'sct' },
  { pattern: /SEPA Direct Debit/gi, id: 'sdd' },
  { pattern: /Prélèvement SEPA/gi, id: 'sdd' },
  { pattern: /\bIBAN\b/g, id: 'iban' },
  { pattern: /\bTIPS\b/g, id: 'tips' },
  { pattern: /\bRT1\b/g, id: 'rt1' },
  { pattern: /\bSTEP2\b/g, id: 'step2' },
  { pattern: /\beuroSIC\b/g, id: 'eurosic' },
  { pattern: /\bSIC IP\b/g, id: 'sic-ip' },
  { pattern: /\bSIC\b/g, id: 'sic' },
  { pattern: /SWIFT CBPR\+/gi, id: 'cbpr-plus' },
  { pattern: /\bCBPR\+/g, id: 'cbpr-plus' },
  { pattern: /Wero platform/gi, id: 'wero' },
  { pattern: /Plateforme Wero/gi, id: 'wero' },
  { pattern: /\bWero\b/g, id: 'wero' },
  { pattern: /Card schemes?/gi, id: 'card-scheme' },
  { pattern: /Schémas? cartes?/gi, id: 'card-scheme' },
  { pattern: /Card payment/gi, id: 'card-scheme' },
  { pattern: /Paiement par carte/gi, id: 'card-scheme' },
  { pattern: /Clearing \/ settlement/gi, id: 'csm' },
  { pattern: /Compensation \/ règlement/gi, id: 'csm' },
  { pattern: /ISO 20022/gi, id: 'iso-20022' },
  { pattern: /\bPISP\b/g, id: 'pisp' },
  { pattern: /\bCSM\b/g, id: 'csm' },
  { pattern: /\b(?:pain|pacs|camt|acmt)\.\d{3}\b/gi, id: (lex) => lex.toLowerCase().replace(/\./g, '-') },
  { pattern: /\bSEPA\b/g, id: 'sepa' },
  { pattern: /\bAML\b/g, id: 'aml' },
];

/** Link known payment jargon to the glossary. Safe to nest outside a <button>. */
export function JargonText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    let hit: { start: number; end: number; id: string; lex: string } | undefined;
    for (const term of TERMS) {
      const re = new RegExp(term.pattern.source, term.pattern.flags);
      const m = re.exec(rest);
      if (!m || m.index < 0) continue;
      const lex = m[0];
      const longerSameStart = hit && m.index === hit.start && lex.length > hit.lex.length;
      if (!hit || m.index < hit.start || longerSameStart) {
        const id = typeof term.id === 'function' ? term.id(lex) : term.id;
        hit = { start: m.index, end: m.index + lex.length, id, lex };
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
