import { buildSettingsIndex, type SearchEntry } from '@/components/settings';

type Translate = (key: string) => string;

/** The whole settings search index: the registry settings, in toolbar order. */
export function composeSearchIndex(t: Translate): SearchEntry[] {
  return buildSettingsIndex(t, []);
}
