import { relativeTime } from '@/lib/relativeTime';
import type { SeasonId, SeasonResolution } from '@/lib/seasons';

export interface SeasonInfoRow {
  key: 'current' | 'start' | 'end' | 'next';
  /** i18n key (seasonal namespace) for the row label */
  labelKey: string;
  /** Set on the rows whose value is a season name + icon (current, next shows relative time only). */
  seasonId?: SeasonId;
  /** relative time text; absent on the "current season" row */
  value?: string;
  /** exact date behind a relative value, for tooltips */
  date?: Date;
}

/**
 * Rows under the timeline: Current season / Start date / End date, or just
 * Next season when nothing is active.
 */
export function seasonInfoRows(resolution: SeasonResolution, now: Date = resolution.now): SeasonInfoRow[] {
  const { current, next } = resolution;
  if (!current) {
    return [{ key: 'next', labelKey: 'seasonal.next_season', seasonId: next.season.id, value: relativeTime(next.start, now), date: next.start }];
  }
  return [
    { key: 'current', labelKey: 'seasonal.current_season', seasonId: current.season.id },
    { key: 'start', labelKey: 'seasonal.start_date', value: relativeTime(current.start, now), date: current.start },
    { key: 'end', labelKey: 'seasonal.end_date', value: relativeTime(current.end, now), date: current.end },
  ];
}
