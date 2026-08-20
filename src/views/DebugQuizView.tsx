import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '@/data/quiz';
import { sampleById } from '@/data/samples';
import { codeByValue } from '@/data/glossary';
import { PayloadInspector } from '@/components/PayloadInspector';
import { useI18n } from '@/i18n';

export function DebugQuizView() {
  const { t, locale } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Payment Debugging Quiz — OpenFinance';
  }, []);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const currentChoice = currentQuestion ? answers[currentQuestion.id] : undefined;
  const sample = currentQuestion ? sampleById(currentQuestion.sampleId) : undefined;
  const answeredCount = Object.keys(answers).length;

  const score = QUIZ_QUESTIONS.reduce((acc, q) => {
    return answers[q.id] === q.correctCode ? acc + 1 : acc;
  }, 0);

  const handleSelectOption = (code: string) => {
    if (!currentQuestion || answers[currentQuestion.id] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: code }));
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
  };

  const percentScore = Math.round((score / totalQuestions) * 100);

  return (
    <div className="page-fluid">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-rule pb-4">
        <div>
          <p className="eyebrow">{t('quiz.eyebrow')}</p>
          <h1 className="mt-1 text-3xl font-bold">{t('quiz.title')}</h1>
        </div>
        <div className="text-right sm:text-right">
          <p className="font-mono text-sm font-semibold text-signal">
            {t('quiz.score', { score, total: totalQuestions })}
          </p>
          <p className="text-xs text-muted">
            {t('quiz.progress', { current: currentIndex + 1, total: totalQuestions })}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-muted">{t('quiz.lead')}</p>

      {/* Progress bar */}
      <div className="mt-6 h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-signal transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {currentQuestion && (
        <div className="mt-8">
          <div className="rounded-lg border border-rule bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              {currentQuestion.title[locale] ?? currentQuestion.title.en}
            </h2>
            <p className="mt-2 text-[14px] text-muted">
              {currentQuestion.prompt[locale] ?? currentQuestion.prompt.en}
            </p>

            <ul className="mt-6 space-y-3">
              {currentQuestion.options.map((code) => {
                const c = codeByValue(code);
                const isSelected = currentChoice === code;
                const isCorrectCode = code === currentQuestion.correctCode;
                const isAnswered = currentChoice !== undefined;

                let btnStyle = 'border-rule bg-surface hover:border-ink';
                if (isAnswered) {
                  if (isCorrectCode) {
                    btnStyle = 'border-jade bg-jade-soft font-medium';
                  } else if (isSelected) {
                    btnStyle = 'border-vermillion bg-vermillion-soft';
                  } else {
                    btnStyle = 'border-rule bg-surface opacity-60';
                  }
                }

                return (
                  <li key={code}>
                    <button
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(code)}
                      className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-[14px] transition-colors ${btnStyle}`}
                    >
                      <span className="shrink-0 font-mono text-[13px] font-bold text-vermillion">
                        {code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-ink">
                          {typeof c?.name === 'string'
                            ? c.name
                            : (c?.name?.[locale] ?? c?.name?.en ?? code)}
                        </span>
                        {c?.definition && (
                          <span className="mt-0.5 block text-[13px] text-muted line-clamp-2">
                            {c.definition[locale] ?? c.definition.en}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {currentChoice !== undefined && (
              <div
                className={`mt-6 rounded-md border-l-4 p-4 text-[14px] leading-relaxed ${
                  currentChoice === currentQuestion.correctCode
                    ? 'border-jade bg-jade-soft/50 text-jade-dark'
                    : 'border-vermillion bg-vermillion-soft/50 text-vermillion-dark'
                }`}
              >
                <p className="font-semibold text-[15px]">
                  {currentChoice === currentQuestion.correctCode
                    ? t('quiz.correct')
                    : t('quiz.incorrect')}
                </p>
                <p className="mt-1 text-muted">
                  {currentQuestion.explanation[locale] ?? currentQuestion.explanation.en}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
                  {currentQuestion.explorerLink && (
                    <Link
                      to={currentQuestion.explorerLink.path}
                      className="font-medium text-signal hover:underline"
                    >
                      {currentQuestion.explorerLink.label[locale] ??
                        currentQuestion.explorerLink.label.en}
                    </Link>
                  )}
                  {currentQuestion.messageLink && (
                    <>
                      <span className="text-muted">·</span>
                      <Link
                        to={currentQuestion.messageLink.path}
                        className="font-medium text-signal hover:underline"
                      >
                        Message page: {currentQuestion.messageLink.label}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="rounded border border-rule px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {t('quiz.prev')}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded border border-rule px-3 py-2 text-xs font-medium text-muted hover:bg-surface-hover hover:text-ink"
              >
                {t('quiz.restart')}
              </button>

              <button
                type="button"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="rounded bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-hover disabled:opacity-40"
              >
                {t('quiz.next')}
              </button>
            </div>
          </div>

          {/* Summary Box if all answered */}
          {answeredCount === totalQuestions && (
            <div className="mt-8 rounded-lg border border-jade bg-jade-soft/30 p-6">
              <h3 className="text-lg font-bold text-ink">{t('quiz.completedTitle')}</h3>
              <p className="mt-1 text-sm text-muted">
                {t('quiz.completedLead', {
                  score,
                  total: totalQuestions,
                  percent: percentScore,
                })}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="mt-4 rounded bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal-hover"
              >
                {t('quiz.restart')}
              </button>
            </div>
          )}

          {/* Sample Payload Inspector */}
          {sample && (
            <div className="mt-10 h-[min(70vh,640px)]">
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
      )}
    </div>
  );
}
