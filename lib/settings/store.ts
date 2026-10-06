import { applySettings, resolveThemeId, systemPrefersReducedMotion, themeTypeOf } from './apply';
import { clearLegacySettings, readLegacySettings } from './migrate';
import { DEFAULTS, REGISTRY, SETTING_KEYS, isSettingKey, type SettingKey, type Settings, type ThemeId } from './registry';
import { validateValue } from './validate';

export const SETTINGS_STORAGE_KEY = 'sc_settings';
export const SETTINGS_VERSION = 1;
const SEASON_REFRESH_MS = 60 * 60 * 1000;

let state: Settings | null = null;
const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;

type Diff = Partial<Settings>;

function diffOf(s: Settings): Diff {
  const out: Record<string, unknown> = {};
  for (const key of SETTING_KEYS) if (s[key] !== DEFAULTS[key]) out[key] = s[key];
  return out as Diff;
}

function sanitize(raw: Record<string, unknown>): Settings {
  const next: Record<string, unknown> = { ...DEFAULTS };
  for (const [key, value] of Object.entries(raw)) {
    if (!isSettingKey(key)) continue;
    const ok = validateValue(key, value, true);
    if (ok !== undefined) next[key] = ok;
  }
  return next as unknown as Settings;
}

function persist(s: Settings) {
  try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ version: SETTINGS_VERSION, ...diffOf(s) })); } catch { /* storage blocked */ }
}

function load(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return sanitize(parsed as Record<string, unknown>);
      return { ...DEFAULTS };
    }
    const legacy = readLegacySettings(localStorage);
    if (!legacy) return { ...DEFAULTS };
    const migrated = sanitize(legacy);
    persist(migrated);
    clearLegacySettings(localStorage);
    return migrated;
  } catch {
    return { ...DEFAULTS };
  }
}

function notify() {
  listeners.forEach(l => l());
}

/** OS colour scheme and the hourly season roll-over. Started once per loaded store. */
function watch() {
  if (stopWatching || typeof window === 'undefined') return;
  const refresh = () => {
    if (!state) return;
    applySettings(state);
    notify();
  };
  const onScheme = () => { if (state?.theme_schedule) refresh(); };
  const onVisible = () => { if (!document.hidden) refresh(); };
  let mq: MediaQueryList | null = null;
  try {
    mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', onScheme);
  } catch { /* no matchMedia */ }
  const timer = setInterval(refresh, SEASON_REFRESH_MS);
  document.addEventListener('visibilitychange', onVisible);
  stopWatching = () => {
    mq?.removeEventListener('change', onScheme);
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

function ensure(): Settings {
  // SSR: no storage or <html> to read; the prepaint script and the client store take over after hydration.
  if (typeof window === 'undefined') return DEFAULTS as Settings;
  if (!state) {
    state = load();
    applySettings(state);
    watch();
  }
  return state;
}

export function getSettings(): Settings {
  return ensure();
}

export function getSetting<K extends SettingKey>(key: K): Settings[K] {
  return ensure()[key];
}

function commit(next: Settings) {
  state = next;
  applySettings(next);
  persist(next);
  notify();
}

export function setSettings(patch: Partial<Settings>): void {
  const current = ensure();
  const next: Record<string, unknown> = { ...current };
  let changed = false;
  for (const [key, value] of Object.entries(patch)) {
    if (!isSettingKey(key)) continue;
    const ok = validateValue(key, value, true);
    if (ok === undefined || ok === next[key]) continue;
    next[key] = ok;
    changed = true;
  }
  if (changed) commit(next as unknown as Settings);
}

export function setSetting<K extends SettingKey>(key: K, value: Settings[K]): void {
  setSettings({ [key]: value } as Partial<Settings>);
}

export function resetSetting(key: SettingKey): void {
  setSetting(key, DEFAULTS[key]);
}

export function resetAllSettings(): void {
  ensure();
  commit({ ...DEFAULTS });
}

export function isModified(key: SettingKey): boolean {
  return ensure()[key] !== DEFAULTS[key];
}

export function resolvedTheme(s: Settings = ensure()): ThemeId {
  return resolveThemeId(s);
}

export function resolvedThemeType(s: Settings = ensure()): 'light' | 'dark' {
  return themeTypeOf(resolveThemeId(s));
}

export function prefersReducedMotion(s: Settings = ensure()): boolean {
  return s.reduced_motion || systemPrefersReducedMotion();
}

export function isIncompatible(key: SettingKey, s: Settings = ensure()): { disabled: boolean; reasonKey?: string; because: SettingKey[] } {
  const def = REGISTRY[key];
  const because: SettingKey[] = [];
  for (const [other, values] of Object.entries(def.incompatible ?? {})) {
    if (!isSettingKey(other)) continue;
    const effective = other === 'theme' ? resolveThemeId(s) : s[other];
    if (values.includes(effective)) because.push(other);
  }
  return because.length
    ? { disabled: true, reasonKey: def.incompatibleReasonKey, because }
    : { disabled: false, because };
}

/** One-line JSON of the modified settings plus the schema version. */
export function exportSettings(): string {
  return JSON.stringify({ version: SETTINGS_VERSION, ...diffOf(ensure()) });
}

export type ImportResult = { ok: true; applied: number; dropped: string[] } | { ok: false; error: 'invalid_json' | 'invalid_shape' | 'no_valid_settings' };

/** Replaces the current settings with the file's diffs; unknown or invalid keys are dropped. */
export function importSettings(json: string): ImportResult {
  let parsed: unknown;
  try { parsed = JSON.parse(json); } catch { return { ok: false, error: 'invalid_json' }; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'invalid_shape' };

  const next: Record<string, unknown> = { ...DEFAULTS };
  const dropped: string[] = [];
  let applied = 0;
  for (const [key, value] of Object.entries(parsed)) {
    if (key === 'version') continue;
    const ok = isSettingKey(key) ? validateValue(key, value) : undefined;
    if (ok === undefined) { dropped.push(key); continue; }
    next[key] = ok;
    applied++;
  }
  if (applied === 0 && dropped.length > 0) return { ok: false, error: 'no_valid_settings' };

  ensure();
  commit(next as unknown as Settings);
  return { ok: true, applied, dropped };
}

export function subscribeSettings(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Test-only: forget the cached state so the next read reloads from storage. */
export function resetSettingsStore(): void {
  stopWatching?.();
  stopWatching = null;
  state = null;
}
