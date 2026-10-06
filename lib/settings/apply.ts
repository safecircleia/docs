import { resolveSeason } from '../seasons';
import { DEFAULTS, LIGHT_THEMES, REGISTRY, SETTING_KEYS, type Settings, type ThemeId } from './registry';

const ATTR = 'data-bleh--';
const LOW_LIT_CONTRAST = 0.3;
const DARK_QUERY = '(prefers-color-scheme: dark)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function matches(query: string): boolean {
  try { return window.matchMedia(query).matches; } catch { return false; }
}

export const systemPrefersDark = () => matches(DARK_QUERY);
export const systemPrefersReducedMotion = () => matches(REDUCED_QUERY);

export function resolveThemeId(s: Settings, prefersDark = systemPrefersDark()): ThemeId {
  if (!s.theme_schedule) return s.theme;
  return prefersDark ? s.theme_night : s.theme_day;
}

export const themeTypeOf = (id: ThemeId): 'light' | 'dark' => (LIGHT_THEMES.has(id) ? 'light' : 'dark');

/** Quotes a single family name; leaves a hand-written font list alone. */
function fontValue(raw: string): string {
  const name = raw.trim();
  if (!name) return '';
  return /[,"']/.test(name) ? name : `"${name}"`;
}

function setOrRemove(root: HTMLElement, name: string, value: string | null) {
  if (value === null) root.removeAttribute(name);
  else root.setAttribute(name, value);
}

export function applyThemeAttrs(root: HTMLElement, id: ThemeId) {
  const type = themeTypeOf(id);
  root.setAttribute(`${ATTR}theme`, id);
  root.setAttribute(`${ATTR}theme_type`, type);
  root.setAttribute('data-theme', type);
}

/** Writes every setting to <html>: attributes, inline custom properties, season. Idempotent. */
export function applySettings(s: Settings, root: HTMLElement = document.documentElement, now: Date = new Date()): void {
  applyThemeAttrs(root, resolveThemeId(s));

  for (const key of SETTING_KEYS) {
    const def = REGISTRY[key];
    const value = s[key];
    const isDefault = value === DEFAULTS[key];
    if (def.bubble) setOrRemove(root, ATTR + key, isDefault ? null : String(value));
    if (def.css) {
      const css = key === 'font' ? fontValue(String(value)) : String(value);
      if (isDefault || css === '') root.style.removeProperty(`--${def.css}`);
      else root.style.setProperty(`--${def.css}`, css);
    }
  }

  const accented = s.accent_type !== 'default';
  for (const channel of ['hue', 'sat', 'lit'] as const) {
    if (accented) root.style.setProperty(`--${channel}-user`, String(s[channel]));
    else root.style.removeProperty(`--${channel}-user`);
  }
  root.classList.toggle('increase-btn-contrast', accented && s.lit <= LOW_LIT_CONTRAST);

  const season = s.seasonal ? resolveSeason(now).current : null;
  setOrRemove(root, `${ATTR}season`, season ? season.season.id : null);
}
