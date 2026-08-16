import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleById } from '@/data/samples';
import { codeByValue } from '@/data/glossary';
import { PayloadInspector } from '@/components/PayloadInspector';
import { useT } from '@/i18n';
import { PageAd } from '@/components/PageAd';

const REASONS = ['AC01', 'AM04', 'AG01', 'AB05'] as const;

/** Pedagogue quiz: read a pacs.002 RJCT and pick the remediation. */
export function DebugQuizView() {
  const t = useT();
  const sample = sampleById('pacs-002-rejected');
  const [choice, setChoice] = useState<string | null>(null);
  const correct = 'AC01';
  const entry = codeByValue(correct);

  useEffect(() => {
    document.title = 'Debug this payment — OpenFinance';
  }, []);

  const answered = choice != null;
  const ok = choice === correct;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <p className="eyebrow">{t('quiz.eyebrow')}</p>
      <h1 className="mt-2 text-3xl font-bold">{t('quiz.title')}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('quiz.lead')}</p>

      <PageAd placement="mid" />

      <section className="mt-8">
        <p className="eyebrow mb-2">{t('quiz.prompt')}</p>
        <ul className="mt-3 space-y-2">
          {REASONS.map((code) => {
            const c = codeByValue(code);
            return (
              <li key={code}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => setChoice(code)}
                  className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left text-[14px] ${
                    answered && code === correct
                      ? 'border-jade bg-jade-soft'
                      : answered && code === choice
                        ? 'border-vermillion bg-vermillion-soft'
                        : 'border-rule bg-surface hover:border-ink'
                  }`}
                >
                  <span className="shrink-0 font-mono text-[12px] font-medium text-vermillion">{code}</span>
                  <span className="min-w-0">
                    <span className="font-medium">{c?.name.en ?? code}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{c?.definition.en}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {answered && (
        <div
          className={`mt-6 border-l-2 pl-3 text-[14px] leading-relaxed ${ok ? 'border-jade' : 'border-vermillion'}`}
        >
          <p className="font-medium">{ok ? t('quiz.correct') : t('quiz.incorrect')}</p>
          <p className="mt-2 text-muted">{entry?.action ?? t('quiz.ac01Hint')}</p>
          <p className="mt-3">
            <Link to="/payment/sepa-instant?outcome=reject&focus=pacs.002" className="text-signal hover:underline">
              {t('quiz.openExplorer')}
            </Link>
            {' · '}
            <Link to="/messages/pacs.002" className="text-signal hover:underline">
              pacs.002
            </Link>
          </p>
        </div>
      )}

      {sample && (
        <div className="mt-10">
          <p className="eyebrow mb-3">{t('quiz.payload')}</p>
          <PayloadInspector
            title={sample.label}
            content={sample.content}
            format={sample.format}
            description={sample.description}
          />
        </div>
      )}
    </div>
  );
}
