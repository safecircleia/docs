import { currentLocale } from './format';

type Unit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

const MS = { day: 86_400_000, hour: 3_600_000, minute: 60_000, second: 1_000 } as const;

/** Adds calendar months, clamping the day (Jan 31 + 1 month = Feb 28). */
function addMonths(d: Date, months: number): Date {
  const out = new Date(d);
  const day = out.getDate();
  out.setDate(1);
  out.setMonth(out.getMonth() + months);
  const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(day, last));
  return out;
}

/** Whole calendar months from `from` to `to` (to >= from). */
function wholeMonths(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (months > 0 && addMonths(from, months) > to) months--;
  return Math.max(months, 0);
}

/**
 * The largest unit with a magnitude >= 1, truncated: "30 minutes ago", "in 1 month".
 * Same semantics as luxon's toRelative with numeric output.
 */
export function relativeTime(date: Date | string | number, now: Date = new Date(), locale: string = currentLocale()): string {
  const target = date instanceof Date ? date : new Date(date);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'long' });
  const past = target.getTime() <= now.getTime();
  const [from, to] = past ? [target, now] : [now, target];
  const sign = past ? -1 : 1;
  const emit = (n: number, unit: Unit) => rtf.format(sign * n, unit);

  const months = wholeMonths(from, to);
  if (months >= 12) return emit(Math.floor(months / 12), 'year');
  if (months >= 1) return emit(months, 'month');

  const ms = to.getTime() - from.getTime();
  for (const unit of ['day', 'hour', 'minute'] as const) {
    const n = Math.floor(ms / MS[unit]);
    if (n >= 1) return emit(n, unit);
  }
  return emit(Math.floor(ms / MS.second), 'second');
}
