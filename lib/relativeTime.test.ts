import { describe, it, expect } from 'vitest';
import { relativeTime } from './relativeTime';

const NOW = new Date(2026, 8, 30, 12, 0, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

describe('relativeTime', () => {
  it('uses the largest unit and truncates', () => {
    expect(relativeTime(ago(30 * MIN), NOW, 'en')).toBe('30 minutes ago');
    expect(relativeTime(ago(90 * MIN), NOW, 'en')).toBe('1 hour ago');
    expect(relativeTime(ago(2 * DAY + 5 * HOUR), NOW, 'en')).toBe('2 days ago');
    expect(relativeTime(ago(19 * DAY), NOW, 'en')).toBe('19 days ago');
    expect(relativeTime(ago(45_000), NOW, 'en')).toBe('45 seconds ago');
  });

  it('counts calendar months and years', () => {
    expect(relativeTime(new Date(2026, 9, 31, 12), NOW, 'en')).toBe('in 1 month');
    expect(relativeTime(new Date(2026, 9, 29, 12), NOW, 'en')).toBe('in 29 days');
    expect(relativeTime(new Date(2026, 2, 1, 12), NOW, 'en')).toBe('6 months ago');
    expect(relativeTime(new Date(2024, 8, 30, 12), NOW, 'en')).toBe('2 years ago');
    expect(relativeTime(new Date(2025, 9, 1, 12), NOW, 'en')).toBe('11 months ago');
  });

  it('formats the future', () => {
    expect(relativeTime(new Date(NOW.getTime() + 3 * HOUR + 10 * MIN), NOW, 'en')).toBe('in 3 hours');
    expect(relativeTime(new Date(NOW.getTime() + 5 * MIN), NOW, 'en')).toBe('in 5 minutes');
  });

  it('treats an equal timestamp as zero seconds ago', () => {
    expect(relativeTime(NOW, NOW, 'en')).toBe('0 seconds ago');
  });

  it('accepts ISO strings and epoch numbers, and localises', () => {
    expect(relativeTime(ago(30 * MIN).toISOString(), NOW, 'en')).toBe('30 minutes ago');
    expect(relativeTime(ago(30 * MIN).getTime(), NOW, 'es')).toBe('hace 30 minutos');
    expect(relativeTime(new Date(2026, 9, 31, 12), NOW, 'es')).toBe('dentro de 1 mes');
  });

  it('clamps the end of month when counting months', () => {
    const jan31 = new Date(2026, 0, 31, 12);
    expect(relativeTime(new Date(2026, 1, 27, 12), jan31, 'en')).toBe('in 27 days');
    expect(relativeTime(new Date(2026, 1, 28, 12), jan31, 'en')).toBe('in 1 month');
    expect(relativeTime(new Date(2026, 2, 28, 12), jan31, 'en')).toBe('in 1 month');
  });
});
