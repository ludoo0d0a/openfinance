import { parseXml, collectPaths } from '../../src/lib/xml';
import { ISO_MESSAGES } from '../../src/data/iso20022';
import { parseMessageId } from '../../src/lib/messageId';
import type { ValidationIssue, ValidationResult } from '../../src/types';

interface Body {
  xml?: string;
  /** Override the message type instead of deriving it from the namespace */
  messageId?: string;
}

/**
 * Deliberately not called "validate against the XSD" anywhere in the UI: the
 * schema files are not bundled and pretending otherwise would be worse than
 * useless. What this does check catches the large majority of real rejections —
 * malformed XML, a namespace that does not match the payload, missing mandatory
 * elements, and the count/sum mismatches that kill bulk files.
 */
export const onRequestPost: PagesFunction = async ({ request }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return error('Request body must be JSON with an "xml" property.', 400);
  }

  const xml = body.xml;
  if (typeof xml !== 'string' || xml.trim() === '') {
    return error('Provide the document to check in the "xml" property.', 400);
  }
  if (xml.length > 2_000_000) {
    return error('Document exceeds the 2 MB limit for this endpoint.', 413);
  }

  const parsed = parseXml(xml);
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!parsed.wellFormed) {
    const result: ValidationResult = {
      wellFormed: false,
      messageShort: null,
      detectedNamespace: null,
      errors: [{ path: '/', rule: 'well-formedness', message: parsed.error ?? 'Document is not well-formed XML.' }],
      warnings: [],
      stats: parsed.stats,
    };
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const declaredId = body.messageId ?? parsed.messageId ?? null;
  const parts = declaredId ? parseMessageId(declaredId) : null;
  const known = parts?.valid ? ISO_MESSAGES.find((m) => m.short === parts.short) : undefined;

  if (!parsed.namespace) {
    warnings.push({
      path: '/Document',
      rule: 'namespace',
      message: 'No xmlns on the root element. Most schemes reject documents without a declared namespace.',
    });
  }

  if (!known) {
    warnings.push({
      path: '/Document/@xmlns',
      rule: 'message-type',
      message: declaredId
        ? `${declaredId} is not in this catalog, so only well-formedness was checked. Add it to src/data/iso20022.ts to get element checks.`
        : 'Could not derive a message type from the namespace, so only well-formedness was checked.',
    });
  }

  if (parsed.root && parsed.root.name !== 'Document') {
    errors.push({
      path: `/${parsed.root.name}`,
      rule: 'root-element',
      message: `Root element is <${parsed.root.name}>. ISO 20022 documents are wrapped in <Document>.`,
    });
  }

  const present = collectPaths(parsed.root);

  if (known) {
    const rootChild = parsed.root?.children[0]?.name;
    if (rootChild && rootChild !== known.rootElement) {
      errors.push({
        path: `/Document/${rootChild}`,
        rule: 'message-root',
        message: `Expected <${known.rootElement}> for ${known.short} but found <${rootChild}>. The namespace and the payload disagree.`,
      });
    }

    for (const required of known.requiredPaths) {
      const satisfied = [...present].some((p) => p === required || p.startsWith(`${required}/`) || matchesRepeating(p, required));
      if (!satisfied) {
        errors.push({
          path: required,
          rule: 'mandatory-element',
          message: `Missing mandatory element: ${required.split('/').pop()}`,
        });
      }
    }
  }

  // Group-level arithmetic. Cheap to check, expensive to get wrong.
  checkCounts(xml, warnings, errors);

  const result: ValidationResult = {
    wellFormed: true,
    messageShort: known?.short ?? null,
    detectedNamespace: parsed.namespace,
    errors,
    warnings,
    stats: parsed.stats,
  };

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

/** Present paths may repeat an ancestor; treat any suffix match as satisfied. */
function matchesRepeating(present: string, required: string): boolean {
  return present.endsWith(required);
}

function checkCounts(xml: string, warnings: ValidationIssue[], errors: ValidationIssue[]) {
  const declared = /<NbOfTxs>(\d+)<\/NbOfTxs>/.exec(xml);
  if (!declared) return;

  const txCount =
    countTag(xml, 'CdtTrfTxInf') || countTag(xml, 'DrctDbtTxInf') || countTag(xml, 'TxInf') || countTag(xml, 'TxInfAndSts');

  if (txCount === 0) {
    warnings.push({
      path: '/GrpHdr/NbOfTxs',
      rule: 'transaction-count',
      message: 'NbOfTxs is declared but no transaction blocks were recognised.',
    });
    return;
  }

  const declaredCount = Number(declared[1]);
  if (declaredCount !== txCount) {
    errors.push({
      path: '/GrpHdr/NbOfTxs',
      rule: 'transaction-count',
      message: `NbOfTxs says ${declaredCount} but ${txCount} transaction blocks are present. Schemes reject this as AM18.`,
    });
  }

  const ctrlSum = /<CtrlSum>([\d.]+)<\/CtrlSum>/.exec(xml);
  const amounts = [...xml.matchAll(/<(?:InstdAmt|IntrBkSttlmAmt)[^>]*>([\d.]+)</g)].map((m) => Number(m[1]));
  if (ctrlSum && amounts.length > 0) {
    const total = amounts.reduce((a, b) => a + b, 0);
    const declaredSum = Number(ctrlSum[1]);
    if (Math.abs(total - declaredSum) > 0.005) {
      errors.push({
        path: '/GrpHdr/CtrlSum',
        rule: 'control-sum',
        message: `CtrlSum is ${declaredSum.toFixed(2)} but the amounts total ${total.toFixed(2)}.`,
      });
    }
  }
}

function countTag(xml: string, tag: string): number {
  return (xml.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length;
}

function error(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
