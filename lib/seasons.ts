export type SeasonId = 'new_years' | 'easter' | 'pride' | 'summer' | 'halloween' | 'pre_fall' | 'fall' | 'christmas';

interface Moment { m: number; d: number; h?: number }

export interface Season {
  id: SeasonId;
  labelKey: string;
  /** 1-based month. A start without `h` is 00:00:00. */
  start: Moment;
  /** An end without `h` is the last millisecond of that day. */
  end: Moment;
  hue: number;
  sat: number;
  lit: number;
  /** Winter ids also recolour the positive status hue. */
  huePos?: number;
  particles: number;
  overlay: 'cobweb' | 'ice' | null;
  iceHeight?: number;
}

export interface SeasonInstance { season: Season; start: Date; end: Date }
export interface SeasonResolution { now: Date; current: SeasonInstance | null; prev: SeasonInstance; next: SeasonInstance }

/** Sorted by start date within a year; the order is load-bearing for overlap resolution. */
export const SEASONS: readonly Season[] = [
  { id: 'new_years', labelKey: 'seasons.new_years', start: { m: 1, d: 1 }, end: { m: 1, d: 14 }, hue: 324, sat: 1.88, lit: 0.88, particles: 90, overlay: 'ice', iceHeight: 100 },
  { id: 'easter', labelKey: 'seasons.easter', start: { m: 4, d: 2 }, end: { m: 4, d: 30 }, hue: 114, sat: 1.16, lit: 0.95, particles: 0, overlay: null },
  { id: 'pride', labelKey: 'seasons.pride', start: { m: 6, d: 1 }, end: { m: 6, d: 30 }, hue: 276, sat: 1.58, lit: 0.66, particles: 0, overlay: null },
  { id: 'summer', labelKey: 'seasons.summer', start: { m: 7, d: 1 }, end: { m: 9, d: 10 }, hue: 43, sat: 2.39, lit: 0.89, particles: 0, overlay: null },
  { id: 'halloween', labelKey: 'seasons.halloween', start: { m: 9, d: 24 }, end: { m: 10, d: 31 }, hue: 35, sat: 1.75, lit: 0.67, particles: 0, overlay: 'cobweb' },
  { id: 'pre_fall', labelKey: 'seasons.pre_fall', start: { m: 11, d: 1 }, end: { m: 11, d: 12 }, hue: 43, sat: 1.65, lit: 0.98, particles: 12, overlay: null },
  { id: 'fall', labelKey: 'seasons.fall', start: { m: 11, d: 13 }, end: { m: 11, d: 22 }, hue: 256, sat: 0.92, lit: 1.06, huePos: 150, particles: 80, overlay: 'ice', iceHeight: 90 },
  { id: 'christmas', labelKey: 'seasons.christmas', start: { m: 11, d: 23 }, end: { m: 12, d: 31 }, hue: 19, sat: 2.36, lit: 0.77, particles: 160, overlay: 'ice', iceHeight: 110 },
];

function instance(season: Season, year: number): SeasonInstance {
  const { start, end } = season;
  return {
    season,
    start: new Date(year, start.m - 1, start.d, start.h ?? 0, 0, 0, 0),
    end: end.h === undefined
      ? new Date(year, end.m - 1, end.d, 23, 59, 59, 999)
      : new Date(year, end.m - 1, end.d, end.h, 0, 0, 0),
  };
}

/** bleh semantics: the earliest-starting season containing `now` wins an overlap. */
export function resolveSeason(now: Date): SeasonResolution {
  const year = now.getFullYear();
  const list = SEASONS.map(s => instance(s, year));
  const at = (i: number): SeasonInstance => {
    if (i < 0) return instance(SEASONS[SEASONS.length - 1], year - 1);
    if (i >= SEASONS.length) return instance(SEASONS[0], year + 1);
    return list[i];
  };

  const t = now.getTime();
  const currentIdx = list.findIndex(s => s.start.getTime() <= t && t <= s.end.getTime());
  if (currentIdx >= 0) {
    return { now, current: list[currentIdx], prev: at(currentIdx - 1), next: at(currentIdx + 1) };
  }

  const upcoming = list.findIndex(s => t < s.start.getTime());
  const nextIdx = upcoming >= 0 ? upcoming : SEASONS.length;
  return { now, current: null, prev: at(nextIdx - 1), next: at(nextIdx) };
}

export type ParticleMode = 'all' | 'less' | 'none';

/** Number of snowflakes to render (05 §B6). */
export function particleCount(season: Season, mode: ParticleMode, mobile: boolean): number {
  if (mode === 'none') return 0;
  let count = season.particles;
  if (count <= 0) return 0;
  if (mode === 'less' && count > 10) count *= 0.45;
  if (mobile && count > 10) count *= 0.5;
  return Math.floor((count * 7) / 10);
}

export function seasonById(id: string | null | undefined): Season | undefined {
  return SEASONS.find(s => s.id === id);
}
