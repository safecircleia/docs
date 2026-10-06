import { describe, expect, it } from 'vitest';
import { accentToHex, hexToAccent, hexToOklch, oklchToHex, parseHex } from './colour';

const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

describe('parseHex', () => {
  it('accepts 3 and 6 digit hex with or without #', () => {
    expect(parseHex('#fff')).toEqual([1, 1, 1]);
    expect(parseHex('6bc6f1')).not.toBeNull();
    expect(parseHex(' #6BC6F1 ')).not.toBeNull();
  });

  it('rejects everything else', () => {
    for (const bad of ['', '#12', '#12345', 'zzzzzz', '#1234567']) expect(parseHex(bad)).toBeNull();
  });
});

describe('oklch conversion', () => {
  it('round-trips a colour', () => {
    const lch = hexToOklch('#6bc6f1')!;
    expect(oklchToHex(lch.l, lch.c, lch.h)).toBe('#6bc6f1');
  });

  it('knows white and black', () => {
    expect(hexToOklch('#ffffff')!.l).toBeCloseTo(1, 2);
    expect(hexToOklch('#000000')!.l).toBeCloseTo(0, 2);
  });
});

describe('accent mapping', () => {
  it('renders the default SafeCircle accent as the documented blue', () => {
    const [r, g, b] = channels(accentToHex({ hue: 230, sat: 1.28, lit: 0.9 }));
    expect(Math.abs(r - 0x6b)).toBeLessThan(10);
    expect(Math.abs(g - 0xc6)).toBeLessThan(10);
    expect(Math.abs(b - 0xf1)).toBeLessThan(10);
  });

  it('maps a hex back onto roughly the same knobs', () => {
    const accent = { hue: 145, sat: 1.6, lit: 0.95 };
    const back = hexToAccent(accentToHex(accent))!;
    expect(Math.abs(back.hue - accent.hue)).toBeLessThanOrEqual(2);
    expect(back.sat).toBeCloseTo(accent.sat, 0);
    expect(back.lit).toBeCloseTo(accent.lit, 1);
  });

  it('clamps to the knob ranges and keeps the hue for greys', () => {
    expect(hexToAccent('#ffffff', 230)).toMatchObject({ hue: 230, sat: 0 });
    expect(hexToAccent('#00ff00')!.sat).toBeLessThanOrEqual(4);
    expect(hexToAccent('nope')).toBeNull();
  });
});
