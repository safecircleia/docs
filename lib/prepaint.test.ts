import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSettings, resetSettingsStore } from './settings';
import { PREPAINT_SCRIPT } from './prepaint';

const prepaint = PREPAINT_SCRIPT;

const NOW = new Date(2026, 8, 30, 20); // halloween

function mockMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('dark') ? prefersDark : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function clearRoot() {
  const el = document.documentElement;
  for (const name of el.getAttributeNames()) if (name !== 'lang') el.removeAttribute(name);
  el.removeAttribute('style');
  el.className = '';
}

/** Everything the appliers write: data attributes, inline custom properties and the class list. */
function snapshot() {
  const el = document.documentElement;
  const attrs: Record<string, string> = {};
  for (const name of el.getAttributeNames()) if (name.startsWith('data-')) attrs[name] = el.getAttribute(name)!;
  const vars: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i++) {
    const name = el.style.item(i);
    vars[name] = el.style.getPropertyValue(name);
  }
  return { attrs, vars, classes: [...el.classList].sort() };
}

function runPrepaint() {
  clearRoot();
  new Function(prepaint)();
  return snapshot();
}

function runApplier() {
  clearRoot();
  resetSettingsStore();
  getSettings();
  return snapshot();
}

function both(setup: () => void, prefersDark = true) {
  localStorage.clear();
  mockMatchMedia(prefersDark);
  setup();
  const fromHtml = runPrepaint();
  const fromTs = runApplier();
  return { fromHtml, fromTs };
}

const store = (diff: Record<string, unknown>) => () => localStorage.setItem('sc_settings', JSON.stringify({ version: 1, ...diff }));

describe('index.html prepaint script', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    clearRoot();
    resetSettingsStore();
  });

  it('sets the defaults: Void, halloween, nothing else', () => {
    const { fromHtml, fromTs } = both(() => undefined);
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs).toEqual({
      'data-bleh--theme': 'oled', 'data-bleh--theme_type': 'dark', 'data-theme': 'dark', 'data-bleh--season': 'halloween',
    });
    expect(fromHtml.vars).toEqual({});
    expect(fromHtml.classes).toEqual([]);
  });

  it('agrees with the season table on every boundary day', () => {
    const days: [number, number][] = [[1, 1], [1, 14], [1, 15], [4, 2], [6, 30], [9, 10], [9, 23], [9, 24], [10, 31], [11, 1], [11, 12], [11, 13], [11, 22], [11, 23], [12, 31]];
    for (const [month, day] of days) {
      vi.setSystemTime(new Date(2026, month - 1, day, 12));
      const { fromHtml, fromTs } = both(() => undefined);
      expect(fromHtml.attrs['data-bleh--season'], `${month}/${day}`).toBe(fromTs.attrs['data-bleh--season']);
    }
  });

  it('applies a custom accent and the low-lightness contrast class', () => {
    const { fromHtml, fromTs } = both(store({ accent_type: 'colour', hue: 300, sat: 1.5, lit: 0.25 }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.vars).toMatchObject({ '--hue-user': '300', '--sat-user': '1.5', '--lit-user': '0.25' });
    expect(fromHtml.classes).toEqual(['increase-btn-contrast']);
  });

  it('keeps the accent trio off while the accent type is default', () => {
    const { fromHtml, fromTs } = both(store({ hue: 10, sat: 2, lit: 1 }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.vars['--hue-user']).toBeUndefined();
  });

  it('resolves a light theme through the schedule', () => {
    const { fromHtml, fromTs } = both(store({ theme_schedule: true, theme_day: 'ink', theme_night: 'darker' }), false);
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs).toMatchObject({ 'data-bleh--theme': 'ink', 'data-bleh--theme_type': 'light', 'data-theme': 'light' });
    const night = both(store({ theme_schedule: true, theme_day: 'ink', theme_night: 'darker' }), true);
    expect(night.fromHtml).toEqual(night.fromTs);
    expect(night.fromHtml.attrs).toMatchObject({ 'data-bleh--theme': 'darker', 'data-bleh--theme_type': 'dark' });
  });

  it('uses the stored theme when the schedule is off', () => {
    const { fromHtml, fromTs } = both(store({ theme: 'rose_pine_dawn', theme_day: 'dark' }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs['data-bleh--theme']).toBe('rose_pine_dawn');
    expect(fromHtml.attrs['data-theme']).toBe('light');
  });

  it('skips the season when seasonal is off', () => {
    const { fromHtml, fromTs } = both(store({ seasonal: false }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs['data-bleh--season']).toBeUndefined();
  });

  it('picks the season for other dates', () => {
    vi.setSystemTime(new Date(2026, 9, 31, 23, 59)); // last minute of halloween
    expect(both(() => undefined).fromHtml.attrs['data-bleh--season']).toBe('halloween');
    vi.setSystemTime(new Date(2026, 10, 1, 13));
    const pre = both(() => undefined);
    expect(pre.fromHtml).toEqual(pre.fromTs);
    expect(pre.fromHtml.attrs['data-bleh--season']).toBe('pre_fall');
    vi.setSystemTime(new Date(2026, 4, 15));
    const none = both(() => undefined);
    expect(none.fromHtml).toEqual(none.fromTs);
    expect(none.fromHtml.attrs['data-bleh--season']).toBeUndefined();
  });

  it('mirrors every bubble attribute and css variable', () => {
    const { fromHtml, fromTs } = both(store({
      solarium: false, noise: 0.5, sat_bg: 2, font_choice: 'custom', font: 'Fira Sans', font_serif: false,
      font_weight: 300, font_weight_medium: 600, font_weight_bold: 800, grid_glow: false, avatar_radius: 'squircle',
      compact: true, reduced_motion: true, show_scroller: true, underline_links: true, seasonal_overlays: false,
    }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs).toMatchObject({
      'data-bleh--solarium': 'false', 'data-bleh--font_choice': 'custom', 'data-bleh--avatar_radius': 'squircle',
      'data-bleh--compact': 'true', 'data-bleh--seasonal_overlays': 'false',
    });
    expect(fromHtml.vars).toEqual({
      '--noise-opacity': '0.5', '--sat-bg': '2', '--custom-font': '"Fira Sans"',
      '--fw-regular': '300', '--fw-medium': '600', '--fw-bold': '800',
    });
  });

  it('ignores invalid stored values like the store does', () => {
    const { fromHtml, fromTs } = both(store({ theme: 'nope', noise: 'loud', solarium: 'yes', avatar_radius: 'hexagon', noise2: 1 }));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs['data-bleh--theme']).toBe('oled');
  });

  it('survives corrupt storage', () => {
    const { fromHtml, fromTs } = both(() => localStorage.setItem('sc_settings', '{not json'));
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs['data-bleh--theme']).toBe('oled');
  });

  it('reads the legacy sc_theme=system key when sc_settings is absent', () => {
    const { fromHtml, fromTs } = both(() => localStorage.setItem('sc_theme', 'system'), false);
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs).toMatchObject({ 'data-bleh--theme': 'light', 'data-bleh--theme_type': 'light' });
  });

  it('reads legacy appearance values', () => {
    const { fromHtml, fromTs } = both(() => {
      localStorage.setItem('sc_theme', 'darker');
      localStorage.setItem('sc_appearance', JSON.stringify({
        hue: 298, sat: 1.28, lit: 0.9, font: 'hyperlegible', serifHeadings: false, glass: false, grain: false,
        reducedMotion: true, underlineLinks: false, showScroller: true, gridGlow: true, avatarRadius: 'square',
      }));
    });
    expect(fromHtml).toEqual(fromTs);
    expect(fromHtml.attrs).toMatchObject({
      'data-bleh--theme': 'darker', 'data-bleh--solarium': 'false', 'data-bleh--font_choice': 'hyperlegible',
      'data-bleh--font_serif': 'false', 'data-bleh--show_scroller': 'true', 'data-bleh--avatar_radius': 'square',
    });
    expect(fromHtml.vars).toMatchObject({ '--noise-opacity': '0', '--hue-user': '298' });
  });

  it('migrates the legacy keys away once the store has loaded', () => {
    both(() => localStorage.setItem('sc_theme', 'light'));
    expect(localStorage.getItem('sc_theme')).toBeNull();
    expect(JSON.parse(localStorage.getItem('sc_settings')!)).toEqual({ version: 1, theme: 'light' });
  });
});
