import { describe, expect, it } from 'vitest';
import {
  createFlakes, createRng, flakeDiameter, flakePosition, MAX_DT, spriteSpec, stepFlakes, type Viewport,
} from './particles';
import { particleCount, seasonById } from './seasons';

const VIEW: Viewport = { width: 1000, height: 800 };
const season = (id: string) => seasonById(id)!;

describe('flake counts', () => {
  it('matches the bleh table on desktop', () => {
    expect(particleCount(season('christmas'), 'all', false)).toBe(112);
    expect(particleCount(season('fall'), 'all', false)).toBe(56);
    expect(particleCount(season('new_years'), 'all', false)).toBe(63);
    expect(particleCount(season('pre_fall'), 'all', false)).toBe(8);
  });
  it('shrinks for less and mobile', () => {
    expect(particleCount(season('christmas'), 'less', false)).toBe(50);
    expect(particleCount(season('christmas'), 'all', true)).toBe(56);
    expect(particleCount(season('christmas'), 'less', true)).toBe(25);
    expect(particleCount(season('pre_fall'), 'less', false)).toBe(3);
  });
  it('is zero for none and seasons without particles', () => {
    expect(particleCount(season('christmas'), 'none', false)).toBe(0);
    expect(particleCount(season('halloween'), 'all', false)).toBe(0);
  });
});

describe('createFlakes', () => {
  it('creates exactly count flakes', () => {
    expect(createFlakes(112, createRng(1))).toHaveLength(112);
    expect(createFlakes(0, createRng(1))).toHaveLength(0);
    expect(createFlakes(-3, createRng(1))).toHaveLength(0);
  });
  it('is deterministic for a seed', () => {
    expect(createFlakes(20, createRng(7))).toEqual(createFlakes(20, createRng(7)));
    expect(createFlakes(20, createRng(7))).not.toEqual(createFlakes(20, createRng(8)));
  });
  it('keeps every field inside its range', () => {
    for (const f of createFlakes(500, createRng(3))) {
      expect(f.x0).toBeGreaterThanOrEqual(0);
      expect(f.x0).toBeLessThan(100);
      expect(f.drift).toBeGreaterThanOrEqual(-10);
      expect(f.drift).toBeLessThan(30);
      expect(f.scale).toBeGreaterThanOrEqual(0.4);
      expect(f.scale).toBeLessThan(1.3);
      expect(f.duration).toBeGreaterThanOrEqual(20);
      expect(f.duration).toBeLessThan(84);
      expect(f.opacity).toBeGreaterThanOrEqual(0.2);
      expect(f.opacity).toBeLessThan(0.9);
      expect(f.t).toBeGreaterThanOrEqual(0);
      expect(f.t).toBeLessThan(30);
      expect(flakeDiameter(f)).toBeGreaterThanOrEqual(3.2);
      expect(flakeDiameter(f)).toBeLessThan(10.4);
    }
  });
});

describe('physics', () => {
  it('starts at y = -10 and falls linearly', () => {
    const [f] = createFlakes(1, createRng(5));
    const start = { ...f, t: 0 };
    expect(flakePosition(start, VIEW).y).toBe(-10);
    expect(flakePosition(start, VIEW).x).toBeCloseTo((f.x0 / 100) * VIEW.width);
    const end = { ...f, t: f.duration };
    expect(flakePosition(end, VIEW).y).toBeCloseTo(1.05 * VIEW.height);
  });
  it('clamps dt to 50ms', () => {
    const f = { ...createFlakes(1, createRng(5))[0], t: 1 };
    stepFlakes([f], 10, VIEW);
    expect(f.t).toBeCloseTo(1 + MAX_DT);
  });
  it('restarts a flake that passes 1.05H on the same column', () => {
    const f = { ...createFlakes(1, createRng(5))[0], t: 0 };
    f.t = f.duration - 0.01;
    stepFlakes([f], MAX_DT, VIEW);
    expect(f.t).toBe(0);
    expect(flakePosition(f, VIEW).y).toBe(-10);
  });
  it('keeps flakes within the vertical bounds over a long run', () => {
    const flakes = createFlakes(60, createRng(11));
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < 4000; i++) {
      stepFlakes(flakes, 0.016, VIEW);
      for (const f of flakes) {
        const { y } = flakePosition(f, VIEW);
        min = Math.min(min, y);
        max = Math.max(max, y);
      }
    }
    expect(min).toBeGreaterThanOrEqual(-10);
    expect(max).toBeLessThanOrEqual(1.05 * VIEW.height + 1);
  });
});

describe('spriteSpec', () => {
  it('uses grey halos on light themes and none in lite mode', () => {
    expect(spriteSpec('light', false)).toMatchObject({ disc: '#fff', glow: '#cecece' });
    expect(spriteSpec('dark', false)).toMatchObject({ disc: '#fffafa', glow: '#fffafa' });
    expect(spriteSpec('dark', false).blur).toBeGreaterThan(0);
    expect(spriteSpec('dark', true).blur).toBe(0);
  });
});
