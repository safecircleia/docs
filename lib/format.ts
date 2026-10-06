import { useEffect, useState } from 'react';

type DateInput = Date | string | number;
export type DateStyle = 'medium' | 'long' | 'huge';

const DEFAULT_NOW_INTERVAL_MS = 30_000;

export function currentLocale(): string {
  return (typeof document !== 'undefined' && document.documentElement.lang) || 'en';
}

const toDate = (d: DateInput): Date => (d instanceof Date ? d : new Date(d));

function hourCycle(): { hourCycle?: 'h12' | 'h23' } {
  return {};
}

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  medium: { dateStyle: 'medium' },
  long: { dateStyle: 'long' },
  huge: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
};

/** "2:12 PM" or "14:12", following the time_format setting and the UI language. */
export function formatTime(d: DateInput): string {
  return new Intl.DateTimeFormat(currentLocale(), { ...TIME, ...hourCycle() }).format(toDate(d));
}

/** "Sep 10, 2026" (medium), "September 10, 2026" (long), "Thursday, September 10, 2026" (huge). */
export function formatDate(d: DateInput, style: DateStyle = 'medium'): string {
  return new Intl.DateTimeFormat(currentLocale(), DATE_STYLES[style]).format(toDate(d));
}

/** "Sep 10, 2026, 2:12 AM" */
export function formatDateTime(d: DateInput): string {
  return new Intl.DateTimeFormat(currentLocale(), { year: 'numeric', month: 'short', day: 'numeric', ...TIME, ...hourCycle() }).format(toDate(d));
}

/** A clock that re-renders its consumer; also refreshes when the tab becomes visible again. */
export function useNow(intervalMs: number = DEFAULT_NOW_INTERVAL_MS): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, intervalMs);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
