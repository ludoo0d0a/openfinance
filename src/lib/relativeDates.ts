/** Date / datetime helpers for the Try editor relative pickers. */

export function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO-8601 without milliseconds (matches AccptncDtTm / CreDtTm samples). */
export function formatDateTime(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

export function startOfUtcDay(base: Date = new Date()): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0));
}

export type DateOnlyPreset = 'yesterday' | 'today' | 'tomorrow';
export type DateTimePreset =
  | 'now'
  | 'minus1h'
  | 'plus1h'
  | 'minus1d'
  | 'plus1d'
  | 'startToday'
  | 'noonToday';

export function resolveDateOnly(preset: DateOnlyPreset, now = new Date()): string {
  if (preset === 'yesterday') return formatDateOnly(addDays(now, -1));
  if (preset === 'tomorrow') return formatDateOnly(addDays(now, 1));
  return formatDateOnly(now);
}

export function resolveDateTime(preset: DateTimePreset, now = new Date()): string {
  switch (preset) {
    case 'now':
      return formatDateTime(now);
    case 'minus1h':
      return formatDateTime(addHours(now, -1));
    case 'plus1h':
      return formatDateTime(addHours(now, 1));
    case 'minus1d':
      return formatDateTime(addDays(now, -1));
    case 'plus1d':
      return formatDateTime(addDays(now, 1));
    case 'startToday':
      return formatDateTime(startOfUtcDay(now));
    case 'noonToday': {
      const noon = startOfUtcDay(now);
      noon.setUTCHours(12, 0, 0, 0);
      return formatDateTime(noon);
    }
  }
}
