/** Pure snow engine: flake generation and physics. Drawing lives in SeasonalParticles. */

export interface Flake {
  /** start column, vw */
  x0: number;
  /** horizontal travel over one fall, vw */
  drift: number;
  /** diameter = 8 * scale px */
  scale: number;
  /** seconds for one fall */
  duration: number;
  opacity: number;
  /** seconds into the current fall; advanced in place by stepFlakes */
  t: number;
}

export interface Viewport { width: number; height: number }

export const MOBILE_MAX_WIDTH = 980;
export const MAX_DT = 0.05;
export const START_Y = -10;
export const RESET_FACTOR = 1.05;
export const SPRITE_SIZE = 32;
/** The disc covers this fraction of the sprite, the rest is glow room. */
export const SPRITE_DISC_RATIO = 0.5;
export const GLOW_BLUR = 7;

export type Rng = () => number;

/** mulberry32: small, fast, seedable. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

export function createFlakes(count: number, rng: Rng): Flake[] {
  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x0: between(rng, 0, 100),
    drift: between(rng, -10, 30),
    scale: between(rng, 0.4, 1.3),
    duration: between(rng, 20, 84),
    opacity: between(rng, 0.2, 0.9),
    t: between(rng, 0, 30),
  }));
}

export const flakeDiameter = (f: Flake): number => 8 * f.scale;

/** Position along the flake's fall, in px. */
export function flakePosition(f: Flake, { width, height }: Viewport): { x: number; y: number } {
  const vy = (RESET_FACTOR * height - START_Y) / f.duration;
  const vx = ((f.drift / 100) * width) / f.duration;
  return { x: (f.x0 / 100) * width + vx * f.t, y: START_Y + vy * f.t };
}

/** Advances every flake by dt seconds (clamped); a flake past 1.05H restarts its same path. */
export function stepFlakes(flakes: Flake[], dt: number, viewport: Viewport): void {
  const step = Math.min(Math.max(dt, 0), MAX_DT);
  const limit = RESET_FACTOR * viewport.height;
  for (const f of flakes) {
    f.t += step;
    if (flakePosition(f, viewport).y > limit) f.t = 0;
  }
}

export interface SpriteSpec {
  size: number;
  disc: string;
  glow: string;
  /** 0 = no glow ("reduce quality") */
  blur: number;
  discRadius: number;
}

export function spriteSpec(themeType: 'light' | 'dark', lite: boolean): SpriteSpec {
  const light = themeType === 'light';
  return {
    size: SPRITE_SIZE,
    disc: light ? '#fff' : '#fffafa',
    glow: light ? '#cecece' : '#fffafa',
    blur: lite ? 0 : GLOW_BLUR,
    discRadius: (SPRITE_SIZE * SPRITE_DISC_RATIO) / 2,
  };
}

/** Side of the square a flake's sprite is drawn into, so the disc matches its diameter. */
export const flakeDrawSize = (f: Flake): number => flakeDiameter(f) / SPRITE_DISC_RATIO;
