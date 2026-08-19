import { describe, expect, it } from 'vitest';
import { QUIZ_QUESTIONS } from '@/data/quiz';
import { ALL_SAMPLES } from '@/data/samples';
import { CODES } from '@/data/codes';

describe('Quiz dataset', () => {
  it('contains at least 5 questions', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it('has valid sample references for each question', () => {
    const sampleIds = new Set(ALL_SAMPLES.map((s) => s.id));
    for (const q of QUIZ_QUESTIONS) {
      expect(sampleIds.has(q.sampleId), `Sample ${q.sampleId} for question ${q.id} exists`).toBe(true);
    }
  });

  it('includes the correct code inside options', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options).toContain(q.correctCode);
    }
  });

  it('has unique options for each question', () => {
    for (const q of QUIZ_QUESTIONS) {
      const uniqueOptions = new Set(q.options);
      expect(uniqueOptions.size).toBe(q.options.length);
    }
  });

  it('references known codes from the CODES registry or GLOSSARY', () => {
    const codeValues = new Set(CODES.map((c) => c.code));
    for (const q of QUIZ_QUESTIONS) {
      expect(codeValues.has(q.correctCode), `Code ${q.correctCode} exists in CODES`).toBe(true);
    }
  });
});
