export type SettingsTab = 'visual' | 'interface' | 'seasonal' | 'accessibility';
export type ThemeId = 'light' | 'ink' | 'rose_pine_dawn' | 'dark' | 'darker' | 'oled' | 'rose_pine' | 'kanagawa_dragon';
export type AccentType = 'default' | 'avatar' | 'colour' | 'customise';
export type FontChoice = 'font_2026' | 'font_2025' | 'hyperlegible' | 'custom';
export type AvatarRadius = 'circle' | 'squircle' | 'square';
export type ParticleSetting = 'all' | 'less' | 'none';

/** Bright first, then moody; the order is the picker order. */
export const THEME_IDS: readonly ThemeId[] = ['light', 'ink', 'rose_pine_dawn', 'dark', 'darker', 'oled', 'rose_pine', 'kanagawa_dragon'];
export const LIGHT_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['light', 'ink', 'rose_pine_dawn']);
/** Themes with literal surface colours (ignore card vibrancy, flagged "New"). */
export const EXTERNAL_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['rose_pine', 'rose_pine_dawn', 'kanagawa_dragon']);

export interface SettingDef<T> {
  key: string;
  default: T;
  type: 'toggle' | 'checkbox' | 'radio' | 'range' | 'select' | 'text' | 'internal';
  tab: SettingsTab;
  section: string;
  titleKey: string;
  bodyKey?: string;
  tags?: string[];
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: { value: T; labelKey: string }[];
  /** Disabled while another key holds one of these values. */
  incompatible?: Record<string, unknown[]>;
  incompatibleReasonKey?: string;
  /** Mirrored to `data-bleh--<key>` on <html> (removed at the default). */
  bubble?: boolean;
  /** Mirrored to the inline custom property `--<css>` on <html> (removed at the default). */
  css?: string;
}

export interface Settings {
  theme: ThemeId;
  theme_schedule: boolean;
  theme_day: ThemeId;
  theme_night: ThemeId;
  solarium: boolean;
  noise: number;
  sat_bg: number;
  accent_type: AccentType;
  hue: number;
  sat: number;
  lit: number;
  font_choice: FontChoice;
  font: string;
  font_serif: boolean;
  font_weight: number;
  font_weight_medium: number;
  font_weight_bold: number;
  grid_glow: boolean;
  avatar_radius: AvatarRadius;
  compact: boolean;
  seasonal: boolean;
  seasonal_particles: ParticleSetting;
  seasonal_particles_lite: boolean;
  seasonal_overlays: boolean;
  reduced_motion: boolean;
  show_scroller: boolean;
  underline_links: boolean;
}

export type SettingKey = keyof Settings;
export type SettingValue<K extends SettingKey> = Settings[K];

export const DEFAULT_ACCENT = { hue: 230, sat: 1.28, lit: 0.9 } as const;
export const FONT_MAX_LENGTH = 120;

const EXTERNAL_THEME_LIST = [...EXTERNAL_THEMES];
const k = (key: string, part: 'title' | 'body') => `prefs.${key}.${part}`;

function opts<T extends string>(key: string, values: readonly T[]): { value: T; labelKey: string }[] {
  return values.map(value => ({ value, labelKey: `prefs.${key}.opt.${value}` }));
}

const themeOptions = opts('theme', THEME_IDS);

export const REGISTRY: { [K in SettingKey]: SettingDef<SettingValue<K>> } = {
  theme: {
    key: 'theme', default: 'oled', type: 'radio', tab: 'visual', section: 'themes',
    titleKey: k('theme', 'title'), bodyKey: k('theme', 'body'), options: themeOptions,
    tags: ['dark', 'light', 'colour scheme', 'color scheme', 'appearance', 'void', 'ash', 'ink', 'rose pine', 'kanagawa'],
  },
  theme_schedule: {
    key: 'theme_schedule', default: false, type: 'checkbox', tab: 'visual', section: 'themes',
    titleKey: k('theme_schedule', 'title'), bodyKey: k('theme_schedule', 'body'),
    tags: ['system', 'automatic', 'day', 'night', 'os'],
  },
  theme_day: {
    key: 'theme_day', default: 'light', type: 'select', tab: 'visual', section: 'themes',
    titleKey: k('theme_day', 'title'), bodyKey: k('theme_day', 'body'), options: themeOptions,
    incompatible: { theme_schedule: [false] }, incompatibleReasonKey: 'prefs.reason.schedule_off',
    tags: ['system', 'schedule'],
  },
  theme_night: {
    key: 'theme_night', default: 'oled', type: 'select', tab: 'visual', section: 'themes',
    titleKey: k('theme_night', 'title'), bodyKey: k('theme_night', 'body'), options: themeOptions,
    incompatible: { theme_schedule: [false] }, incompatibleReasonKey: 'prefs.reason.schedule_off',
    tags: ['system', 'schedule'],
  },
  solarium: {
    key: 'solarium', default: true, type: 'toggle', tab: 'visual', section: 'themes', bubble: true,
    titleKey: k('solarium', 'title'), bodyKey: k('solarium', 'body'),
    tags: ['glass', 'blur', 'transparency', 'frosted', 'performance'],
  },
  noise: {
    key: 'noise', default: 0.25, type: 'range', min: 0, max: 1, step: 0.05, tab: 'visual', section: 'themes', css: 'noise-opacity',
    titleKey: k('noise', 'title'), bodyKey: k('noise', 'body'),
    tags: ['grain', 'texture', 'overlay'],
  },
  sat_bg: {
    key: 'sat_bg', default: 1, type: 'range', min: 0, max: 5, step: 0.2, tab: 'visual', section: 'themes', css: 'sat-bg',
    titleKey: k('sat_bg', 'title'), bodyKey: k('sat_bg', 'body'),
    incompatible: { theme: EXTERNAL_THEME_LIST }, incompatibleReasonKey: 'prefs.reason.external_theme',
    tags: ['vibrancy', 'saturation', 'background', 'colour', 'color'],
  },
  accent_type: {
    key: 'accent_type', default: 'default', type: 'radio', tab: 'visual', section: 'colours',
    titleKey: k('accent_type', 'title'), bodyKey: k('accent_type', 'body'), options: opts('accent_type', ['default', 'avatar', 'colour', 'customise']),
    tags: ['accent', 'colour', 'color', 'tint', 'preset', 'palette'],
  },
  hue: {
    key: 'hue', default: DEFAULT_ACCENT.hue, type: 'range', min: 0, max: 360, step: 1, tab: 'visual', section: 'colours',
    titleKey: k('hue', 'title'), bodyKey: k('hue', 'body'),
    tags: ['accent', 'colour', 'color', 'hue', 'tint'],
  },
  sat: {
    key: 'sat', default: DEFAULT_ACCENT.sat, type: 'range', min: 0, max: 4, step: 0.01, tab: 'visual', section: 'colours',
    titleKey: k('sat', 'title'), bodyKey: k('sat', 'body'),
    tags: ['saturation', 'vibrancy', 'accent', 'colour', 'color'],
  },
  lit: {
    key: 'lit', default: DEFAULT_ACCENT.lit, type: 'range', min: 0, max: 1.5, step: 0.01, tab: 'visual', section: 'colours',
    titleKey: k('lit', 'title'), bodyKey: k('lit', 'body'),
    tags: ['brightness', 'lightness', 'accent', 'colour', 'color'],
  },
  font_choice: {
    key: 'font_choice', default: 'font_2026', type: 'radio', tab: 'visual', section: 'fonts', bubble: true,
    titleKey: k('font_choice', 'title'), bodyKey: k('font_choice', 'body'), options: opts('font_choice', ['font_2026', 'font_2025', 'hyperlegible', 'custom']),
    tags: ['typeface', 'text', 'hanken', 'funnel', 'atkinson', 'dyslexia', 'readable'],
  },
  font: {
    key: 'font', default: '', type: 'text', tab: 'visual', section: 'fonts', css: 'custom-font',
    titleKey: k('font', 'title'), bodyKey: k('font', 'body'),
    incompatible: { font_choice: ['font_2026', 'font_2025', 'hyperlegible'] }, incompatibleReasonKey: 'prefs.reason.custom_font',
    tags: ['typeface', 'custom', 'family'],
  },
  font_serif: {
    key: 'font_serif', default: true, type: 'checkbox', tab: 'visual', section: 'fonts', bubble: true,
    titleKey: k('font_serif', 'title'), bodyKey: k('font_serif', 'body'),
    tags: ['headings', 'instrument serif', 'italic'],
  },
  font_weight: {
    key: 'font_weight', default: 400, type: 'range', min: 100, max: 600, step: 10, tab: 'visual', section: 'fonts', css: 'fw-regular',
    titleKey: k('font_weight', 'title'), bodyKey: k('font_weight', 'body'),
    tags: ['bold', 'thin', 'weight', 'text'],
  },
  font_weight_medium: {
    key: 'font_weight_medium', default: 500, type: 'range', min: 400, max: 750, step: 10, tab: 'visual', section: 'fonts', css: 'fw-medium',
    titleKey: k('font_weight_medium', 'title'), bodyKey: k('font_weight_medium', 'body'),
    tags: ['bold', 'weight', 'buttons'],
  },
  font_weight_bold: {
    key: 'font_weight_bold', default: 600, type: 'range', min: 500, max: 900, step: 10, tab: 'visual', section: 'fonts', css: 'fw-bold',
    titleKey: k('font_weight_bold', 'title'), bodyKey: k('font_weight_bold', 'body'),
    tags: ['bold', 'weight', 'headings'],
  },
  grid_glow: {
    key: 'grid_glow', default: true, type: 'toggle', tab: 'visual', section: 'avatars', bubble: true,
    titleKey: k('grid_glow', 'title'), bodyKey: k('grid_glow', 'body'),
    tags: ['glow', 'shadow', 'reflection', 'cards'],
  },
  avatar_radius: {
    key: 'avatar_radius', default: 'circle', type: 'radio', tab: 'visual', section: 'avatars', bubble: true,
    titleKey: k('avatar_radius', 'title'), bodyKey: k('avatar_radius', 'body'), options: opts('avatar_radius', ['circle', 'squircle', 'square']),
    tags: ['avatar', 'shape', 'round', 'square', 'picture'],
  },
  compact: {
    key: 'compact', default: false, type: 'toggle', tab: 'interface', section: 'layout', bubble: true,
    titleKey: k('compact', 'title'), bodyKey: k('compact', 'body'),
    tags: ['dense', 'tight', 'small', 'spacing', 'density'],
  },
  seasonal: {
    key: 'seasonal', default: true, type: 'toggle', tab: 'seasonal', section: 'adapt',
    titleKey: k('seasonal', 'title'), bodyKey: k('seasonal', 'body'),
    tags: ['season', 'halloween', 'christmas', 'holiday', 'events', 'automatic'],
  },
  seasonal_particles: {
    key: 'seasonal_particles', default: 'all', type: 'radio', tab: 'seasonal', section: 'particles',
    titleKey: k('seasonal_particles', 'title'), bodyKey: k('seasonal_particles', 'body'), options: opts('seasonal_particles', ['all', 'less', 'none']),
    incompatible: { seasonal: [false] }, incompatibleReasonKey: 'prefs.reason.seasonal_off',
    tags: ['snow', 'particles', 'winter', 'effects'],
  },
  seasonal_particles_lite: {
    key: 'seasonal_particles_lite', default: false, type: 'checkbox', tab: 'seasonal', section: 'particles',
    titleKey: k('seasonal_particles_lite', 'title'), bodyKey: k('seasonal_particles_lite', 'body'),
    incompatible: { seasonal: [false] }, incompatibleReasonKey: 'prefs.reason.seasonal_off',
    tags: ['snow', 'performance', 'quality', 'glow'],
  },
  seasonal_overlays: {
    key: 'seasonal_overlays', default: true, type: 'checkbox', tab: 'seasonal', section: 'effects', bubble: true,
    titleKey: k('seasonal_overlays', 'title'), bodyKey: k('seasonal_overlays', 'body'),
    incompatible: { seasonal: [false] }, incompatibleReasonKey: 'prefs.reason.seasonal_off',
    tags: ['cobweb', 'frost', 'ice', 'effects', 'decorations'],
  },
  reduced_motion: {
    key: 'reduced_motion', default: false, type: 'toggle', tab: 'accessibility', section: 'motion', bubble: true,
    titleKey: k('reduced_motion', 'title'), bodyKey: k('reduced_motion', 'body'),
    tags: ['animations', 'motion', 'vestibular', 'a11y', 'accessibility'],
  },
  show_scroller: {
    key: 'show_scroller', default: false, type: 'toggle', tab: 'accessibility', section: 'motion', bubble: true,
    titleKey: k('show_scroller', 'title'), bodyKey: k('show_scroller', 'body'),
    tags: ['scrollbar', 'scroll', 'a11y', 'accessibility'],
  },
  underline_links: {
    key: 'underline_links', default: false, type: 'toggle', tab: 'accessibility', section: 'text', bubble: true,
    titleKey: k('underline_links', 'title'), bodyKey: k('underline_links', 'body'),
    tags: ['links', 'underline', 'a11y', 'accessibility', 'buttons'],
  },
};

export const SETTING_KEYS = Object.keys(REGISTRY) as SettingKey[];

export const DEFAULTS: Readonly<Settings> = Object.freeze(
  Object.fromEntries(SETTING_KEYS.map(key => [key, REGISTRY[key].default])) as unknown as Settings,
);

export const isSettingKey = (v: string): v is SettingKey => Object.prototype.hasOwnProperty.call(REGISTRY, v);

export interface AccentPreset { id: string; labelKey: string; hue: number; sat: number; lit: number }

const preset = (id: string, hue: number, sat: number, lit: number): AccentPreset => ({ id, labelKey: `prefs.accent_presets.${id}`, hue, sat, lit });

export const ACCENT_PRESETS: readonly AccentPreset[] = [
  preset('red', 19, 1.5, 0.84), preset('orange', 37, 1.4, 0.9), preset('yellow', 73, 1.38, 1.07),
  preset('lime', 115, 1.16, 1), preset('green', 145, 1.6, 0.95), preset('aqua', 178, 1, 1),
  preset('blue', 248, 1.45, 0.82), preset('purple', 290, 1.45, 0.82), preset('pink', 340, 1.35, 0.93),
  preset('grey', 0, 0, 1),
];

/** Limited-time presets shown during Christmas and New Year. */
export const SEASONAL_ACCENT_PRESETS: readonly AccentPreset[] = [
  preset('nonsense', 352, 1.8, 0.925), preset('fruitcake', 24, 0.93, 1),
  preset('mistletoe', 130, 0.45, 0.75), preset('festival', 240, 1.4, 0.875),
];

export const TAB_ORDER: readonly SettingsTab[] = ['visual', 'interface', 'seasonal', 'accessibility'];
