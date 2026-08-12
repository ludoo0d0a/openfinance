import { describe, expect, it } from 'vitest';
import {
  formatDateOnly,
  formatDateTime,
  resolveDateOnly,
  resolveDateTime,
} from '../src/lib/relativeDates';

describe('relativeDates', () => {
  const fixed = new Date('2026-08-12T15:30:00.000Z');

  it('formats date-only and datetime', () => {
    expect(formatDateOnly(fixed)).toBe('2026-08-12');
    expect(formatDateTime(fixed)).toBe('2026-08-12T15:30:00Z');
  });

  it('resolves date-only presets', () => {
    expect(resolveDateOnly('yesterday', fixed)).toBe('2026-08-11');
    expect(resolveDateOnly('today', fixed)).toBe('2026-08-12');
    expect(resolveDateOnly('tomorrow', fixed)).toBe('2026-08-13');
  });

  it('resolves datetime presets', () => {
    expect(resolveDateTime('now', fixed)).toBe('2026-08-12T15:30:00Z');
    expect(resolveDateTime('minus1h', fixed)).toBe('2026-08-12T14:30:00Z');
    expect(resolveDateTime('plus1h', fixed)).toBe('2026-08-12T16:30:00Z');
    expect(resolveDateTime('startToday', fixed)).toBe('2026-08-12T00:00:00Z');
    expect(resolveDateTime('noonToday', fixed)).toBe('2026-08-12T12:00:00Z');
  });
});
