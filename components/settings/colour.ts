/** Hex <-> OKLCH and the accent mapping (the inverse of the `--h3` token formula in tokens.css). */

/** --h3 = oklch(lit * 1.25 * 0.7, sat * 0.18 * 0.46, hue) */
const H3_LIGHTNESS = 0.875;
const H3_CHROMA = 0.0828;
const GREY_CHROMA = 0.004;
const LIT_MAX = 1.5;
const SAT_MAX = 4;

export interface Accent { hue: number; sat: number; lit: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, places: number) => Number(v.toFixed(places));

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** Accepts `#rgb`, `#rrggbb` with or without the `#`. */
export function parseHex(input: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  const hex = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export function hexToOklch(input: string): { l: number; c: number; h: number } | null {
  const rgb = parseHex(input);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(bb, a) * 180) / Math.PI;
  return { l: L, c: Math.hypot(a, bb), h: h < 0 ? h + 360 : h };
}

export function oklchToHex(l: number, c: number, h: number): string {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return `#${lin.map(v => Math.round(clamp(fromLinear(clamp(v, 0, 1)), 0, 1) * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** Hex colour that `--h3` (the accent fill) renders for a hue/sat/lit triple. */
export function accentToHex({ hue, sat, lit }: Accent): string {
  return oklchToHex(lit * H3_LIGHTNESS, sat * H3_CHROMA, hue);
}

/** Maps a hex colour onto the accent knobs so the fill lands on (roughly) that colour; null when not a hex. */
export function hexToAccent(input: string, fallbackHue = 0): Accent | null {
  const lch = hexToOklch(input);
  if (!lch) return null;
  return {
    hue: lch.c < GREY_CHROMA ? fallbackHue : Math.round(lch.h) % 360,
    sat: round(clamp(lch.c / H3_CHROMA, 0, SAT_MAX), 2),
    lit: round(clamp(lch.l / H3_LIGHTNESS, 0, LIT_MAX), 2),
  };
}
