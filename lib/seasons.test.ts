import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { en, es } from '../i18n/resources';
import { resolveSeason, particleCount, SEASONS, seasonById } from './seasons';

const id = (i: { season: { id: string } } | null) => i?.season.id ?? null;

describe('resolveSeason', () => {
  it('Sep 30 2026 is halloween between summer and pre_fall', () => {
    const r = resolveSeason(new Date(2026, 8, 30, 20));
    expect(id(r.current)).toBe('halloween');
    expect(id(r.prev)).toBe('summer');
    expect(id(r.next)).toBe('pre_fall');
  });

  it('Oct 31 23:59 is still halloween and Nov 1 00:00 is pre_fall', () => {
    expect(id(resolveSeason(new Date(2026, 9, 31, 23, 59, 59)).current)).toBe('halloween');
    expect(id(resolveSeason(new Date(2026, 10, 1)).current)).toBe('pre_fall');
  });

  it('Jan 3 is new_years and its prev is last year\'s christmas', () => {
    const r = resolveSeason(new Date(2027, 0, 3));
    expect(id(r.current)).toBe('new_years');
    expect(id(r.prev)).toBe('christmas');
    expect(r.prev.start.getFullYear()).toBe(2026);
    expect(r.prev.end.getFullYear()).toBe(2026);
    expect(id(r.next)).toBe('easter');
  });

  it('May 15 has no season; next is pride, prev is easter', () => {
    const r = resolveSeason(new Date(2026, 4, 15));
    expect(r.current).toBeNull();
    expect(id(r.prev)).toBe('easter');
    expect(id(r.next)).toBe('pride');
  });

  it('Jan 20 has no season; next is easter, prev is the previous christmas', () => {
    const r = resolveSeason(new Date(2026, 0, 20));
    expect(r.current).toBeNull();
    expect(id(r.prev)).toBe('new_years');
    expect(id(r.next)).toBe('easter');
  });

  it('Dec 31 23:59:59 is inclusive and wraps next to next year\'s new_years', () => {
    const r = resolveSeason(new Date(2026, 11, 31, 23, 59, 59));
    expect(id(r.current)).toBe('christmas');
    expect(id(r.next)).toBe('new_years');
    expect(r.next.start.getFullYear()).toBe(2027);
  });

  it('Sep 11 to Sep 23 fall in the gap between summer and halloween', () => {
    const r = resolveSeason(new Date(2026, 8, 20));
    expect(r.current).toBeNull();
    expect(id(r.prev)).toBe('summer');
    expect(id(r.next)).toBe('halloween');
    expect(id(resolveSeason(new Date(2026, 8, 24)).current)).toBe('halloween');
  });

  it('is ordered by start so every instance in a year is increasing', () => {
    const starts = SEASONS.map(s => s.start.m * 100 + s.start.d);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });
});

describe('particleCount', () => {
  const christmas = seasonById('christmas')!;
  it('matches the spec examples', () => {
    expect(particleCount(christmas, 'all', false)).toBe(112);
    expect(particleCount(christmas, 'less', false)).toBe(50);
    expect(particleCount(christmas, 'all', true)).toBe(56);
    expect(particleCount(christmas, 'less', true)).toBe(25);
  });

  it('covers winter, new years and autumn', () => {
    expect(particleCount(seasonById('fall')!, 'all', false)).toBe(56);
    expect(particleCount(seasonById('fall')!, 'less', false)).toBe(25);
    expect(particleCount(seasonById('new_years')!, 'all', false)).toBe(63);
    expect(particleCount(seasonById('new_years')!, 'less', false)).toBe(28);
    expect(particleCount(seasonById('pre_fall')!, 'all', false)).toBe(8);
    expect(particleCount(seasonById('pre_fall')!, 'less', false)).toBe(3);
  });

  it('is zero for none or seasons without particles', () => {
    expect(particleCount(christmas, 'none', false)).toBe(0);
    expect(particleCount(seasonById('halloween')!, 'all', false)).toBe(0);
  });
});

describe('season table vs styles/tokens.css', () => {
  const css = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf8');

  it('declares the same accent for every season', () => {
    for (const s of SEASONS) {
      const rule = new RegExp(`\\[data-bleh--season="${s.id}"\\][^{]*\\{([^}]*)\\}`).exec(css);
      expect(rule, `${s.id} rule`).not.toBeNull();
      const body = rule![1];
      expect(body).toContain(`--hue-seasonal: ${s.hue};`);
      expect(body).toContain(`--sat-seasonal: ${s.sat};`);
      expect(body).toContain(`--lit-seasonal: ${s.lit};`);
      if (s.huePos) expect(body).toContain(`--hue-pos: ${s.huePos};`);
    }
  });

  it('labels every season and the "none active" state in en and es', () => {
    for (const lang of [en, es]) {
      const t = (lang as unknown as { seasons: Record<string, string> }).seasons;
      for (const s of SEASONS) expect(t[s.id]).toBeTruthy();
      expect(t.none).toBeTruthy();
    }
  });
});
