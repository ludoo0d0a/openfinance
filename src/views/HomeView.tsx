import { Link } from 'react-router-dom';
import { STANDARDS } from '@/data/standards';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { CODES } from '@/data/codes';
import { MessageIdPlate } from '@/components/MessageIdPlate';
import { CodeChip, Tag } from '@/components/Chips';
import { UI_ICONS } from '@/lib/icons';
import { localizeFlows, useI18n, useT } from '@/i18n';

/**
 * The hero is the thesis: PSD2 debugging is hard because a payment crosses a
 * boundary between two worlds with different vocabularies. Everything else in
 * the app exists to help you cross it.
 */
export function HomeView() {
  const t = useT();
  const { locale } = useI18n();
  const flows = localizeFlows(FLOWS, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="mt-3 text-4xl leading-[1.05] font-bold sm:text-5xl">
          {t('home.title1')}
          <br />
          {t('home.title2')}
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{t('home.lead')}</p>
      </header>

      <LayerDiagram />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/try"
          className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <UI_ICONS.try size={16} aria-hidden />
          {t('home.ctaTry')}
        </Link>
        <Link
          to="/map"
          className="inline-flex items-center gap-2 border border-rule bg-surface px-4 py-2 text-sm font-medium hover:border-ink"
        >
          <UI_ICONS.map size={16} aria-hidden />
          {t('home.ctaMap')}
          <span className="font-mono text-[11px] text-muted">{t('home.ctaMapHint')}</span>
        </Link>
        <Link
          to="/flows/sct-inst-happy-path"
          className="inline-flex items-center gap-2 border border-rule bg-surface px-4 py-2 text-sm font-medium hover:border-ink"
        >
          <UI_ICONS.instant size={16} aria-hidden />
          {t('home.ctaSct')}
        </Link>
        <Link
          to="/messages/pacs.002"
          className="inline-flex items-center gap-2 border border-rule bg-surface px-4 py-2 text-sm font-medium hover:border-ink"
        >
          <UI_ICONS.xml size={16} aria-hidden />
          {t('home.ctaAck')}
        </Link>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <section>
          <h2 className="eyebrow mb-3 inline-flex items-center gap-2">
            <UI_ICONS.flow size={14} aria-hidden />
            {t('home.traceFlow')}
          </h2>
          <ul className="panel divide-y divide-rule-soft">
            {flows.map((flow) => (
              <li key={flow.id}>
                <Link to={`/flows/${flow.id}`} className="block px-4 py-3 transition-colors hover:bg-paper-raised">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[15px] font-semibold">{flow.name}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {t(`category.${flow.category}`)} · {t('home.steps', { count: flow.steps.length })}
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
            <h2 className="eyebrow mb-3">{t('home.standards')}</h2>
            <ul className="panel divide-y divide-rule-soft">
              {STANDARDS.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/standards/${s.id}`}
                    className="flex items-baseline gap-3 px-4 py-2.5 hover:bg-paper-raised"
                  >
                    <span className="flex-1 text-sm font-medium">{s.name}</span>
                    <span className="font-mono text-[11px] text-muted">v{s.version}</span>
                    <Tag>{s.region}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow mb-3 inline-flex items-center gap-2">
              <UI_ICONS.instant size={14} aria-hidden />
              {t('home.instant')}
            </h2>
            <ul className="panel divide-y divide-rule-soft">
              {(
                [
                  { id: 'sct-inst-happy-path', key: 'home.instantHappy' },
                  { id: 'sct-inst-vop', key: 'home.instantVop' },
                  { id: 'sct-inst-reject', key: 'home.instantReject' },
                  { id: 'sepa-instant-timeout', key: 'home.instantTimeout' },
                  { id: 'sct-inst-recall', key: 'home.instantRecall' },
                  { id: 'sic-ip-instant', key: 'home.instantSic' },
                ] as const
              ).map((f) => (
                <li key={f.id}>
                  <Link to={`/flows/${f.id}`} className="block px-4 py-2.5 text-sm hover:bg-paper-raised">
                    {t(f.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/standards/sct-inst" className="mt-3 inline-block font-mono text-xs text-signal hover:underline">
              {t('home.sctStandard')}
            </Link>
          </section>

          <section>
            <h2 className="eyebrow mb-3 inline-flex items-center gap-2">
              <UI_ICONS.xml size={14} aria-hidden />
              {t('home.inspectXml')}
            </h2>
            <ul className="panel divide-y divide-rule-soft">
              {(
                [
                  { short: 'pacs.008', blurb: 'home.blurb008' },
                  { short: 'pacs.002', blurb: 'home.blurb002' },
                  { short: 'pain.001', blurb: 'home.blurb001' },
                  { short: 'camt.056', blurb: 'home.blurb056' },
                ] as const
              ).map((m) => (
                <li key={m.short}>
                  <Link to={`/messages/${m.short}`} className="flex items-start gap-3 px-4 py-3 hover:bg-paper-raised">
                    <UI_ICONS.xml size={16} className="mt-0.5 shrink-0 text-violet" aria-hidden />
                    <span>
                      <span className="font-mono text-sm font-semibold text-signal">{m.short}</span>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{t(m.blurb)}</p>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/flows/clearing-sct-happy-path"
              className="mt-3 inline-block font-mono text-xs text-signal hover:underline"
            >
              {t('home.traceClearing')}
            </Link>
          </section>

          <section>
            <h2 className="eyebrow mb-3">{t('home.readId')}</h2>
            <div className="panel p-4">
              <MessageIdPlate id="pacs.008.001.08" />
              <p className="mt-4 text-[13px] leading-relaxed text-muted">{t('home.idHint')}</p>
              <Link to="/messages/pacs.008" className="mt-3 inline-block font-mono text-xs text-signal hover:underline">
                {t('home.open008')}
              </Link>
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3">{t('home.lookCode')}</h2>
            <div className="panel p-4">
              <div className="flex flex-wrap gap-1.5">
                {['ACSC', 'RJCT', 'AC01', 'AM04', 'MS03', 'PDNG', 'CONSENT_INVALID', 'UK.OBIE.Signature.Invalid'].map(
                  (c) => (
                    <CodeChip key={c} code={c} />
                  ),
                )}
              </div>
              <Link to="/codes" className="mt-4 inline-block font-mono text-xs text-signal hover:underline">
                {t('home.allCodes', { count: CODES.length })}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-16 border-t border-rule pt-5">
        <p className="font-mono text-[11px] text-muted">
          {t('home.footer', {
            standards: STANDARDS.length,
            flows: FLOWS.length,
            messages: ISO_MESSAGES.length,
            codes: CODES.length,
          })}
        </p>
      </footer>
    </div>
  );
}

function LayerDiagram() {
  const t = useT();
  return (
    <div className="mt-10 overflow-x-auto scroll-paper">
      <svg
        viewBox="0 0 900 200"
        width="900"
        height="200"
        className="max-w-none"
        role="img"
        aria-label={t('home.apiLayer')}
      >
        <text x="8" y="18" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.16em" fill="var(--color-signal)">
          {t('home.apiLayer')}
        </text>
        <text
          x="470"
          y="18"
          fontFamily="var(--font-mono)"
          fontSize="10"
          letterSpacing="0.16em"
          fill="var(--color-violet)"
        >
          {t('home.clearingLayer')}
        </text>

        <line x1="455" y1="8" x2="455" y2="192" stroke="var(--color-ink)" strokeWidth="1.5" />
        <text x="449" y="188" textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-muted)">
          {t('home.reasonStop')}
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
          {t('home.samePayment')}
        </text>
      </svg>
    </div>
  );
}
