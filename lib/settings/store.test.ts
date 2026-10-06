import { describe, it, expect, beforeEach, vi } from 'vitest';
import { en, es } from '../../i18n/resources';
import {
  ACCENT_PRESETS, DEFAULTS, REGISTRY, SEASONAL_ACCENT_PRESETS, SETTING_KEYS, exportSettings, getSetting, getSettings, importSettings, isIncompatible, isModified,
  prefersReducedMotion, resetAllSettings, resetSetting, resetSettingsStore, resolvedTheme, resolvedThemeType,
  setSetting, setSettings, subscribeSettings,
} from './index';

const root = () => document.documentElement;
const stored = () => JSON.parse(localStorage.getItem('sc_settings') ?? 'null');

function mockMedia(dark: boolean, reduced = false) {
  const listeners: Array<() => void> = [];
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('prefers-color-scheme') ? dark : q.includes('reduced-motion') ? reduced : false,
    media: q,
    addEventListener: (_: string, fn: () => void) => listeners.push(fn),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  return listeners;
}

beforeEach(() => {
  localStorage.clear();
  root().removeAttribute('style');
  root().className = '';
  for (const name of root().getAttributeNames()) if (name.startsWith('data-')) root().removeAttribute(name);
  resetSettingsStore();
  mockMedia(true);
  vi.useRealTimers();
});

describe('registry', () => {
  it('has a default, tab, section and i18n keys for every setting', () => {
    for (const key of SETTING_KEYS) {
      const def = REGISTRY[key];
      expect(def.key).toBe(key);
      expect(def.titleKey).toBe(`prefs.${key}.title`);
      expect(def.tab && def.section).toBeTruthy();
      const owner = key === 'theme_day' || key === 'theme_night' ? 'theme' : key;
      for (const o of def.options ?? []) expect(o.labelKey).toBe(`prefs.${owner}.opt.${o.value}`);
    }
  });

  it('keeps every default inside its own range and options', () => {
    for (const key of SETTING_KEYS) {
      const def = REGISTRY[key];
      if (typeof def.default === 'number') {
        expect(def.default).toBeGreaterThanOrEqual(def.min!);
        expect(def.default).toBeLessThanOrEqual(def.max!);
      }
      if (def.options) expect(def.options.map(o => o.value)).toContain(def.default);
    }
  });
});

describe('i18n', () => {
  const lookup = (tree: unknown, path: string) => path.split('.').reduce<unknown>((t, p) => (t as Record<string, unknown> | undefined)?.[p], tree);

  it('defines every title, body, option, reason and tab/section label in en and es', () => {
    const keys = new Set<string>();
    for (const key of SETTING_KEYS) {
      const def = REGISTRY[key];
      keys.add(def.titleKey);
      if (def.bodyKey) keys.add(def.bodyKey);
      if (def.incompatibleReasonKey) keys.add(def.incompatibleReasonKey);
      for (const o of def.options ?? []) keys.add(o.labelKey);
      keys.add(`prefs.tab.${def.tab}`);
      keys.add(`prefs.section.${def.section}`);
    }
    for (const lang of [en, es]) {
      const missing = [...keys].filter(k => typeof lookup(lang, k) !== 'string');
      expect(missing).toEqual([]);
    }
  });

  it('labels every accent preset', () => {
    for (const p of [...ACCENT_PRESETS, ...SEASONAL_ACCENT_PRESETS]) {
      expect(typeof lookup(en, p.labelKey)).toBe('string');
      expect(typeof lookup(es, p.labelKey)).toBe('string');
    }
  });
});

describe('store', () => {
  it('starts at the defaults and applies the theme and season to <html>', () => {
    expect(getSettings()).toEqual(DEFAULTS);
    expect(root().getAttribute('data-bleh--theme')).toBe('oled');
    expect(root().getAttribute('data-bleh--theme_type')).toBe('dark');
    expect(root().getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('sc_settings')).toBeNull();
  });

  it('persists diffs only, with the version', () => {
    setSetting('noise', 0.5);
    setSetting('compact', true);
    expect(stored()).toEqual({ version: 1, noise: 0.5, compact: true });
    setSetting('noise', 0.25);
    expect(stored()).toEqual({ version: 1, compact: true });
  });

  it('mirrors bubble attributes and css variables, and removes them at the default', () => {
    setSettings({ solarium: false, avatar_radius: 'square', noise: 0.6, font_weight: 300 });
    expect(root().getAttribute('data-bleh--solarium')).toBe('false');
    expect(root().getAttribute('data-bleh--avatar_radius')).toBe('square');
    expect(root().style.getPropertyValue('--noise-opacity')).toBe('0.6');
    expect(root().style.getPropertyValue('--fw-regular')).toBe('300');
    resetAllSettings();
    expect(root().hasAttribute('data-bleh--solarium')).toBe(false);
    expect(root().hasAttribute('data-bleh--avatar_radius')).toBe(false);
    expect(root().style.getPropertyValue('--noise-opacity')).toBe('');
    expect(root().style.getPropertyValue('--fw-regular')).toBe('');
  });

  it('writes the accent trio only when the accent type is not default', () => {
    setSettings({ hue: 120, sat: 1, lit: 0.8 });
    expect(root().style.getPropertyValue('--hue-user')).toBe('');
    setSetting('accent_type', 'colour');
    expect(root().style.getPropertyValue('--hue-user')).toBe('120');
    expect(root().style.getPropertyValue('--sat-user')).toBe('1');
    expect(root().style.getPropertyValue('--lit-user')).toBe('0.8');
    expect(root().classList.contains('increase-btn-contrast')).toBe(false);
    setSetting('lit', 0.3);
    expect(root().classList.contains('increase-btn-contrast')).toBe(true);
    setSetting('accent_type', 'default');
    expect(root().style.getPropertyValue('--hue-user')).toBe('');
    expect(root().classList.contains('increase-btn-contrast')).toBe(false);
  });

  it('keeps trailing spaces in the stored font so multi-word names can be typed', () => {
    setSetting('font', 'Open ');
    expect(getSetting('font')).toBe('Open ');
    setSetting('font', '   ');
    expect(root().style.getPropertyValue('--custom-font')).toBe('');
  });

  it('sets the custom font as a quoted family and removes it when emptied', () => {
    setSettings({ font_choice: 'custom', font: 'Fira Sans' });
    expect(root().style.getPropertyValue('--custom-font')).toBe('"Fira Sans"');
    setSetting('font', 'Fira Code, monospace');
    expect(root().style.getPropertyValue('--custom-font')).toBe('Fira Code, monospace');
    setSetting('font', 'Evil; } body { display: none');
    expect(root().style.getPropertyValue('--custom-font')).toBe('"Evil  body  display: none"');
    setSetting('font', '');
    expect(root().style.getPropertyValue('--custom-font')).toBe('');
  });

  it('validates on set: clamps ranges and rejects wrong types and options', () => {
    setSetting('noise', 4);
    expect(getSetting('noise')).toBe(1);
    setSetting('sat_bg', 0.33);
    expect(getSetting('sat_bg')).toBe(0.4);
    setSetting('hue', 'red' as unknown as number);
    expect(getSetting('hue')).toBe(DEFAULTS.hue);
    setSetting('theme', 'solarized' as never);
    expect(getSetting('theme')).toBe('oled');
    setSetting('compact', 1 as unknown as boolean);
    expect(getSetting('compact')).toBe(false);
  });

  it('notifies subscribers once per effective change and keeps the snapshot stable otherwise', () => {
    const fn = vi.fn();
    const off = subscribeSettings(fn);
    const before = getSettings();
    setSetting('compact', false);
    expect(fn).not.toHaveBeenCalled();
    expect(getSettings()).toBe(before);
    setSetting('compact', true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(getSettings()).not.toBe(before);
    off();
    setSetting('compact', false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reset helpers and isModified', () => {
    setSettings({ compact: true, noise: 0 });
    expect(isModified('compact')).toBe(true);
    expect(isModified('solarium')).toBe(false);
    resetSetting('compact');
    expect(isModified('compact')).toBe(false);
    expect(isModified('noise')).toBe(true);
    resetAllSettings();
    expect(stored()).toEqual({ version: 1 });
  });

  it('reloads from storage', () => {
    setSetting('theme', 'ink');
    resetSettingsStore();
    expect(getSetting('theme')).toBe('ink');
    expect(root().getAttribute('data-bleh--theme')).toBe('ink');
  });

  it('survives blocked storage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => setSetting('compact', true)).not.toThrow();
    expect(getSetting('compact')).toBe(true);
    spy.mockRestore();
  });
});

describe('theme resolution', () => {
  it('follows prefers-color-scheme through the schedule', () => {
    mockMedia(false);
    setSettings({ theme_schedule: true, theme_day: 'ink', theme_night: 'dark' });
    expect(resolvedTheme()).toBe('ink');
    expect(resolvedThemeType()).toBe('light');
    expect(root().getAttribute('data-bleh--theme')).toBe('ink');
    expect(root().getAttribute('data-theme')).toBe('light');
  });

  it('re-applies when the OS scheme changes while scheduled', () => {
    const listeners = mockMedia(true);
    setSettings({ theme_schedule: true, theme_day: 'light', theme_night: 'darker' });
    expect(root().getAttribute('data-bleh--theme')).toBe('darker');
    mockMedia(false);
    listeners.forEach(fn => fn());
    expect(root().getAttribute('data-bleh--theme')).toBe('light');
  });

  it('reports reduced motion from the setting or the media query', () => {
    expect(prefersReducedMotion()).toBe(false);
    setSetting('reduced_motion', true);
    expect(prefersReducedMotion()).toBe(true);
    resetSetting('reduced_motion');
    mockMedia(true, true);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('seasons', () => {
  it('sets data-bleh--season while seasonal is on and removes it when off', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 30, 20));
    expect(getSetting('seasonal')).toBe(true);
    expect(root().getAttribute('data-bleh--season')).toBe('halloween');
    setSetting('seasonal', false);
    expect(root().hasAttribute('data-bleh--season')).toBe(false);
    setSetting('seasonal', true);
    expect(root().getAttribute('data-bleh--season')).toBe('halloween');
  });

  it('has no season attribute outside a season', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 4, 15));
    getSettings();
    expect(root().hasAttribute('data-bleh--season')).toBe(false);
  });
});

describe('incompatibility', () => {
  it('disables vibrancy for external themes, including through the schedule', () => {
    expect(isIncompatible('sat_bg').disabled).toBe(false);
    setSetting('theme', 'rose_pine');
    expect(isIncompatible('sat_bg')).toEqual({ disabled: true, reasonKey: 'prefs.reason.external_theme', because: ['theme'] });
    setSettings({ theme: 'oled', theme_schedule: true, theme_night: 'kanagawa_dragon' });
    expect(isIncompatible('sat_bg').disabled).toBe(true);
  });

  it('disables seasonal sub-settings while seasonal is off', () => {
    expect(isIncompatible('seasonal_particles').disabled).toBe(false);
    setSetting('seasonal', false);
    for (const key of ['seasonal_particles', 'seasonal_particles_lite', 'seasonal_overlays'] as const) {
      expect(isIncompatible(key).disabled).toBe(true);
    }
    expect(isIncompatible('seasonal_particles').because).toEqual(['seasonal']);
  });

  it('only enables the custom font text for the custom choice', () => {
    expect(isIncompatible('font').disabled).toBe(true);
    setSetting('font_choice', 'custom');
    expect(isIncompatible('font').disabled).toBe(false);
  });

  it('accepts an explicit settings object', () => {
    expect(isIncompatible('sat_bg', { ...DEFAULTS, theme: 'rose_pine_dawn' }).disabled).toBe(true);
  });
});

describe('import and export', () => {
  it('exports one line of diffs plus the version', () => {
    expect(exportSettings()).toBe('{"version":1}');
    setSettings({ theme: 'ink', noise: 0 });
    expect(exportSettings()).toBe('{"version":1,"theme":"ink","noise":0}');
  });

  it('round-trips and replaces the current settings', () => {
    setSettings({ theme: 'ink', noise: 0 });
    const out = exportSettings();
    resetAllSettings();
    setSetting('compact', true);
    expect(importSettings(out)).toEqual({ ok: true, applied: 2, dropped: [] });
    expect(getSettings()).toEqual({ ...DEFAULTS, theme: 'ink', noise: 0 });
    expect(stored()).toEqual({ version: 1, theme: 'ink', noise: 0 });
  });

  it('drops unknown keys and invalid values', () => {
    const res = importSettings(JSON.stringify({ version: 1, theme: 'light', nope: 1, noise: 9, compact: 'yes' }));
    expect(res).toEqual({ ok: true, applied: 1, dropped: ['nope', 'noise', 'compact'] });
    expect(getSetting('theme')).toBe('light');
    expect(getSetting('noise')).toBe(DEFAULTS.noise);
  });

  it('rejects bad input without touching the settings', () => {
    setSetting('compact', true);
    expect(importSettings('{nope')).toEqual({ ok: false, error: 'invalid_json' });
    expect(importSettings('[1,2]')).toEqual({ ok: false, error: 'invalid_shape' });
    expect(importSettings('"hi"')).toEqual({ ok: false, error: 'invalid_shape' });
    expect(importSettings('{"nope":1}')).toEqual({ ok: false, error: 'no_valid_settings' });
    expect(getSetting('compact')).toBe(true);
  });

  it('accepts an empty export as a reset', () => {
    setSetting('compact', true);
    expect(importSettings('{"version":1}')).toEqual({ ok: true, applied: 0, dropped: [] });
    expect(getSetting('compact')).toBe(false);
  });
});

describe('legacy migration', () => {
  it('maps sc_theme and sc_appearance and removes the old keys', () => {
    localStorage.setItem('sc_theme', 'system');
    localStorage.setItem('sc_appearance', JSON.stringify({
      hue: 40, sat: 1.6, lit: 1, font: 'custom', customFont: 'Lora', serifHeadings: false, glass: false, grain: false,
      reducedMotion: true, underlineLinks: true, showScroller: true, gridGlow: false, avatarRadius: 'squircle',
    }));
    expect(getSettings()).toEqual({
      ...DEFAULTS,
      theme_schedule: true, accent_type: 'colour', hue: 40, sat: 1.6, lit: 1, font_choice: 'custom', font: 'Lora',
      font_serif: false, solarium: false, noise: 0, reduced_motion: true, underline_links: true, show_scroller: true,
      grid_glow: false, avatar_radius: 'squircle',
    });
    expect(localStorage.getItem('sc_theme')).toBeNull();
    expect(localStorage.getItem('sc_appearance')).toBeNull();
    expect(stored().version).toBe(1);
  });

  it('maps funnel and hyperlegible, and grain on to the default noise', () => {
    localStorage.setItem('sc_appearance', JSON.stringify({ hue: 230, sat: 1.28, lit: 0.9, font: 'funnel', grain: true }));
    expect(getSettings()).toEqual({ ...DEFAULTS, font_choice: 'font_2025' });
  });

  it('maps an explicit legacy theme and ignores unknown ones', () => {
    localStorage.setItem('sc_theme', 'rose_pine');
    expect(getSetting('theme')).toBe('rose_pine');
    localStorage.clear();
    resetSettingsStore();
    localStorage.setItem('sc_theme', 'chartreuse');
    expect(getSetting('theme')).toBe('oled');
  });

  it('prefers sc_settings when both exist', () => {
    localStorage.setItem('sc_settings', JSON.stringify({ version: 1, theme: 'ink' }));
    localStorage.setItem('sc_theme', 'light');
    expect(getSetting('theme')).toBe('ink');
    expect(localStorage.getItem('sc_theme')).toBe('light');
  });

  it('ignores malformed stored settings but keeps valid keys', () => {
    localStorage.setItem('sc_settings', JSON.stringify({ version: 1, theme: 'ink', noise: 'x', bogus: true }));
    expect(getSettings()).toEqual({ ...DEFAULTS, theme: 'ink' });
  });
});
