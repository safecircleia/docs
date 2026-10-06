import { FONT_MAX_LENGTH, REGISTRY, type SettingKey, type Settings } from './registry';

const decimals = (step: number) => (String(step).split('.')[1] ?? '').length;

/** Snaps to the step grid and trims float noise (0.1 + 0.2 style drift). */
function snap(value: number, min: number, step: number): number {
  const places = Math.max(decimals(step), decimals(min));
  return Number((Math.round((value - min) / step) * step + min).toFixed(places));
}

/** Strips control characters and characters that would break out of a CSS value. */
export function cleanFontName(raw: string): string {
  return raw.replace(/[\u0000-\u001f\u007f;{}<>\\]/g, '').slice(0, FONT_MAX_LENGTH);
}

/**
 * Returns the accepted value, or `undefined` when it is invalid.
 * `clamp` pulls out-of-range numbers back into range (UI sliders) instead of rejecting them (import).
 */
export function validateValue<K extends SettingKey>(key: K, value: unknown, clamp = false): Settings[K] | undefined {
  const def = REGISTRY[key];
  const fallback = def.default;

  if (typeof fallback === 'boolean') return (typeof value === 'boolean' ? value : undefined) as Settings[K] | undefined;

  if (typeof fallback === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
    const min = def.min ?? -Infinity;
    const max = def.max ?? Infinity;
    if (!clamp && (value < min || value > max)) return undefined;
    const bounded = Math.min(max, Math.max(min, value));
    return (def.step !== undefined && Number.isFinite(min) ? snap(bounded, min, def.step) : bounded) as Settings[K];
  }

  if (typeof value !== 'string') return undefined;
  if (def.options) return (def.options.some(o => o.value === value) ? value : undefined) as Settings[K] | undefined;
  if (value.length > FONT_MAX_LENGTH && !clamp) return undefined;
  return cleanFontName(value) as Settings[K];
}
