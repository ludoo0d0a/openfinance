import { Link } from 'react-router-dom';
import { STANDARDS } from '@/data/standards';
import { FLOWS, CATEGORY_LABELS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { CODES } from '@/data/codes';
import { MessageIdPlate } from '@/components/MessageIdPlate';
import { CodeChip, Tag } from '@/components/Chips';

/**
 * The hero is the thesis: PSD2 debugging is hard because a payment crosses a
 * boundary between two worlds with different vocabularies. Everything else in
 * the app exists to help you cross it.
 */
export function HomeView() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
      <header className="max-w-3xl">
        <p className="eyebrow">Open Finance reference</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-bold sm:text-5xl">
          A payment crosses a border
          <br />
          halfway through its life.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">
          On one side, JSON over HTTPS with consents, tokens and HTTP status codes. On the other, ISO 20022 XML with
          reason codes and settlement dates. The same payment, two vocabularies, and almost every hard bug lives at the
          seam. This explorer holds both sides in one place.
        </p>
      </header>

      <LayerDiagram />

      <div className="mt-8">
        <Link
          to="/map"
          className="inline-flex items-center gap-2 border border-rule bg-surface px-4 py-2 text-sm font-medium hover:border-ink"
        >
          Open interop map
          <span className="font-mono text-[11px] text-muted">Cytoscape · standards × rails</span>
        </Link>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <section>
          <h2 className="eyebrow mb-3">Trace a flow</h2>
          <ul className="panel divide-y divide-rule-soft">
            {FLOWS.map((flow) => (
              <li key={flow.id}>
                <Link to={`/flows/${flow.id}`} className="block px-4 py-3 transition-colors hover:bg-paper-raised">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[15px] font-semibold">{flow.name}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {CATEGORY_LABELS[flow.category]} · {flow.steps.length} steps
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{flow.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-8">
          <section>
            <h2 className="eyebrow mb-3">Standards covered</h2>
            <ul className="panel divide-y divide-rule-soft">
              {STANDARDS.map((s) => (
                <li key={s.id}>
                  <Link to={`/standards/${s.id}`} className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-paper-raised">
                    <span className="flex-1 text-sm font-medium">{s.name}</span>
                    <span className="font-mono text-[11px] text-muted">v{s.version}</span>
                    <Tag>{s.region}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow mb-3">Read an identifier</h2>
            <div className="panel p-4">
              <MessageIdPlate id="pacs.008.001.08" />
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                Variant and version are different things. A bank on variant 001 version 09 will reject your version 08
                payload, and the error you get back will rarely say so.
              </p>
              <Link to="/messages/pacs.008" className="mt-3 inline-block font-mono text-xs text-signal hover:underline">
                Open pacs.008 →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3">Look up a code</h2>
            <div className="panel p-4">
              <div className="flex flex-wrap gap-1.5">
                {['ACSC', 'RJCT', 'AC01', 'AM04', 'MS03', 'PDNG', 'CONSENT_INVALID', 'UK.OBIE.Signature.Invalid'].map((c) => (
                  <CodeChip key={c} code={c} />
                ))}
              </div>
              <Link to="/codes" className="mt-4 inline-block font-mono text-xs text-signal hover:underline">
                All {CODES.length} codes →
              </Link>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-16 border-t border-rule pt-5">
        <p className="font-mono text-[11px] text-muted">
          {STANDARDS.length} standards · {FLOWS.length} flows · {ISO_MESSAGES.length} messages · {CODES.length} codes.
          Press <kbd className="border border-rule px-1">⌘K</kbd> to search all of it.
        </p>
      </footer>
    </div>
  );
}

/**
 * The one deliberately loud element on this page. It is not decoration: the
 * vertical rule is the actual boundary where an HTTP error stops being
 * available and an ISO reason code takes over.
 */
function LayerDiagram() {
  return (
    <div className="mt-10 overflow-x-auto scroll-paper">
      <svg viewBox="0 0 900 200" width="900" height="200" className="max-w-none" role="img" aria-label="The API layer and the clearing layer, and what a payment is called on each side">
        <text x="8" y="18" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.16em" fill="var(--color-signal)">
          API LAYER — WHAT THE TPP SEES
        </text>
        <text x="470" y="18" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.16em" fill="var(--color-violet)">
          CLEARING LAYER — WHAT THE BANK SEES
        </text>

        <line x1="455" y1="8" x2="455" y2="192" stroke="var(--color-ink)" strokeWidth="1.5" />
        <text
          x="449"
          y="188"
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--color-muted)"
        >
          reason codes stop here
        </text>

        {[
          { x: 8, label: 'POST /v1/payments', sub: 'HTTP 201 · RCVD', color: 'var(--color-signal)' },
          { x: 160, label: 'SCA', sub: 'redirect · decoupled', color: 'var(--color-signal)' },
          { x: 300, label: 'GET /status', sub: 'ACSP → ACSC', color: 'var(--color-signal)' },
          { x: 470, label: 'pacs.008', sub: 'interbank transfer', color: 'var(--color-violet)' },
          { x: 610, label: 'pacs.002', sub: 'ACSC or RJCT + AC01', color: 'var(--color-violet)' },
          { x: 750, label: 'camt.054', sub: 'credit notification', color: 'var(--color-violet)' },
        ].map((box) => (
          <g key={box.label}>
            <rect x={box.x} y={44} width={132} height={54} fill="var(--color-surface)" stroke={box.color} strokeWidth="1" />
            <text x={box.x + 12} y={68} fontFamily="var(--font-mono)" fontSize="12" fontWeight="500" fill="var(--color-ink)">
              {box.label}
            </text>
            <text x={box.x + 12} y={85} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--color-muted)">
              {box.sub}
            </text>
          </g>
        ))}

        {[140, 292, 432, 602, 742].map((x) => (
          <line key={x} x1={x} y1={71} x2={x + 18} y2={71} stroke="var(--color-rule)" strokeWidth="1" markerEnd="none" />
        ))}

        <path
          d="M 74 110 L 74 140 L 536 140 L 536 110"
          fill="none"
          stroke="var(--color-vermillion)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <text
          x="305"
          y="158"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11.5"
          fill="var(--color-vermillion)"
        >
          The same payment. A TPP sees &quot;rejected&quot;; the bank sees AC01 and knows the IBAN is wrong.
        </text>
      </svg>
    </div>
  );
}
