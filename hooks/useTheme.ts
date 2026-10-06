import { useCallback, useSyncExternalStore } from 'react';
import { applyThemeAttrs, resolveThemeId, themeTypeOf, systemPrefersDark } from '../lib/settings/apply';
import { THEME_IDS, type ThemeId } from '../lib/settings/registry';
import { getSettings, resetSettingsStore, setSettings, subscribeSettings } from '../lib/settings/store';

/** Compat wrapper over the settings store. `system` means "match system settings" (theme_schedule). */
export const THEMES = ['system', ...THEME_IDS] as const;
export type ThemeChoice = 'system' | ThemeId;
export type ResolvedTheme = 'light' | 'dark';
/** Legacy key; the store migrates it into `sc_settings` on first load. */
export const THEME_STORAGE_KEY = 'sc_theme';

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') return themeTypeOf(resolveThemeId({ ...getSettings(), theme_schedule: true }));
  return themeTypeOf(choice);
}

/** Applies the theme attributes to <html> without persisting anything. */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const s = getSettings();
  const id = choice === 'system' ? resolveThemeId({ ...s, theme_schedule: true }) : choice;
  applyThemeAttrs(document.documentElement, id);
  return themeTypeOf(id);
}

export function setThemeChoice(next: ThemeChoice) {
  if (next === 'system') setSettings({ theme_schedule: true });
  else setSettings({ theme: next, theme_schedule: false });
}

/** Test-only: forget the cached store so the next read re-reads storage. */
export function resetThemeStore() {
  resetSettingsStore();
}

function useStore<T>(select: () => T): T {
  return useSyncExternalStore(subscribeSettings, select, select);
}

export function useTheme() {
  const choice = useStore<ThemeChoice>(() => {
    const s = getSettings();
    return s.theme_schedule ? 'system' : s.theme;
  });
  const themeId = useStore<ThemeId>(() => resolveThemeId(getSettings()));
  const resolved = themeTypeOf(themeId);

  const setChoice = useCallback((next: ThemeChoice) => setThemeChoice(next), []);
  const toggle = useCallback(() => {
    const s = getSettings();
    const goingDark = themeTypeOf(resolveThemeId(s, systemPrefersDark())) === 'light';
    setSettings({ theme: goingDark ? s.theme_night : s.theme_day, theme_schedule: false });
  }, []);

  return { choice, resolved, themeId, setChoice, toggle };
}
