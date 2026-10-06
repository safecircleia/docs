import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULTS, getSetting, getSettings, setSetting, subscribeSettings, type SettingKey, type Settings } from '../lib/settings';

/** Subscribes to one key; re-renders only when that value changes. */
export function useSetting<K extends SettingKey>(key: K): [Settings[K], (value: Settings[K]) => void] {
  const value = useSyncExternalStore(subscribeSettings, () => getSetting(key), () => DEFAULTS[key]);
  const set = useCallback((next: Settings[K]) => setSetting(key, next), [key]);
  return [value, set];
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, getSettings, () => DEFAULTS as Settings);
}
