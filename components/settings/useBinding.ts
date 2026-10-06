import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSetting';
import {
  REGISTRY, isIncompatible, resetSetting, setSetting,
  type SettingDef, type SettingKey, type Settings,
} from '../../lib/settings';
import { settingDomId } from './jump';

/** Setting keys whose value type is T (boolean keys, number keys, ...). */
export type KeyOf<T> = { [K in SettingKey]: Settings[K] extends T ? K : never }[SettingKey];

/** Registry entry + live value + translated copy for one setting. Bound rows build on this. */
export function useBinding<K extends SettingKey>(key: K) {
  const { t } = useTranslation();
  const settings = useSettings();
  const def = REGISTRY[key] as unknown as SettingDef<Settings[K]>;
  const value = settings[key];
  const incompat = isIncompatible(key, settings);
  const incompatible: string | true | undefined = incompat.disabled ? (incompat.reasonKey ? t(incompat.reasonKey) : true) : undefined;
  const set = useCallback((v: Settings[K]) => setSetting(key, v), [key]);
  const reset = useCallback(() => resetSetting(key), [key]);

  return {
    key,
    id: settingDomId(key),
    def,
    value,
    set,
    reset,
    modified: value !== def.default,
    title: t(def.titleKey),
    body: def.bodyKey ? t(def.bodyKey) : undefined,
    /** Reason text when disabled by another setting (true when no reason is registered). */
    incompatible,
    t,
  };
}
