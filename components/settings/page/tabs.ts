import { TAB_ORDER, type SettingsTab } from '@/lib/settings';

export const DEFAULT_TAB: SettingsTab = 'visual';

const isTab = (value: string): value is SettingsTab => (TAB_ORDER as readonly string[]).includes(value);

/** `/settings/:tab?` param to a tab: unknown or missing values fall back to Visual. */
export function resolveTab(param: string | undefined): SettingsTab {
  const key = param?.toLowerCase();
  return key && isTab(key) ? key : DEFAULT_TAB;
}

/** True when the URL param is already the canonical name of its tab. */
export const isCanonicalTab = (param: string | undefined): boolean => param === undefined || isTab(param);

export const tabPath = (tab: SettingsTab): string => `/settings/${tab}`;
