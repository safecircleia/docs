import { useEffect, useMemo, useState } from 'react';
import { REGISTRY, SETTING_KEYS, TAB_ORDER, type SettingsTab } from '../../lib/settings';
import { settingDomId } from './jump';

export interface SearchEntry {
  /** DOM id of the row to jump to (`setting_<key>` for registry settings). */
  id: string;
  tab: SettingsTab;
  title: string;
  body?: string;
  /** Extra lower-case words that should find this entry. */
  tags?: readonly string[];
}

export interface SearchResult { entry: SearchEntry; score: number }

/** Rows that live inside a dialog, so there is nothing on the page to jump to. */
const NOT_INDEXED: ReadonlySet<string> = new Set(['theme_day', 'theme_night']);

const SCORE = { titleWord: 5, title: 4, tagExact: 3, tag: 2, body: 1 } as const;

/** Lower-cases and strips accents so "contrasena" finds "contraseña". */
export const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const tokens = (query: string): string[] => fold(query).split(/\s+/).filter(Boolean);

type Translate = (key: string) => string;

/** One entry per registry setting (in tab order, then registry order), plus any page-specific extras. */
export function buildSettingsIndex(t: Translate, extra: readonly SearchEntry[] = []): SearchEntry[] {
  const own: SearchEntry[] = SETTING_KEYS
    .filter(key => REGISTRY[key].type !== 'internal' && !NOT_INDEXED.has(key))
    .map(key => {
      const def = REGISTRY[key];
      return { id: settingDomId(key), tab: def.tab, title: t(def.titleKey), body: def.bodyKey ? t(def.bodyKey) : undefined, tags: def.tags };
    });
  const tabRank = (tab: SettingsTab) => TAB_ORDER.indexOf(tab);
  // Array.sort is stable, so registry order survives inside a tab.
  return [...own, ...extra].sort((a, b) => tabRank(a.tab) - tabRank(b.tab));
}

function scoreToken(entry: SearchEntry, token: string): number {
  const title = fold(entry.title);
  let best = 0;
  if (title.split(/[^\p{L}\p{N}]+/u).some(w => w.startsWith(token))) best = SCORE.titleWord;
  else if (title.includes(token)) best = SCORE.title;
  for (const tag of entry.tags ?? []) {
    const f = fold(tag);
    if (f === token) best = Math.max(best, SCORE.tagExact);
    else if (f.includes(token)) best = Math.max(best, SCORE.tag);
  }
  if (entry.body && fold(entry.body).includes(token)) best = Math.max(best, SCORE.body);
  return best;
}

/**
 * Every word of the query must match the title, body or a tag. Title hits rank above tags, tags above the
 * body; ties keep index order (tab order, then registry order). An empty query matches nothing.
 */
export function searchSettings(entries: readonly SearchEntry[], query: string): SearchResult[] {
  const words = tokens(query);
  if (words.length === 0) return [];
  const results: (SearchResult & { index: number })[] = [];
  entries.forEach((entry, index) => {
    let score = 0;
    for (const word of words) {
      const s = scoreToken(entry, word);
      if (s === 0) return;
      score += s;
    }
    results.push({ entry, score, index });
  });
  return results.sort((a, b) => b.score - a.score || a.index - b.index).map(({ entry, score }) => ({ entry, score }));
}

/** Character ranges of `text` that match any query word (accent-insensitive), merged and sorted. */
export function findMatchRanges(text: string, query: string): [number, number][] {
  const words = tokens(query);
  if (words.length === 0 || !text) return [];
  let folded = '';
  const origin: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = fold(text[i]);
    for (let j = 0; j < f.length; j++) origin.push(i);
    folded += f;
  }
  const ranges: [number, number][] = [];
  for (const word of words) {
    for (let at = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + word.length)) {
      ranges.push([origin[at], origin[at + word.length - 1] + 1]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

const SEARCH_DEBOUNCE_MS = 150;

/** Debounced search over an index. An emptied query clears the results immediately. */
export function useSettingsSearch(entries: readonly SearchEntry[], query: string, delayMs: number = SEARCH_DEBOUNCE_MS) {
  const [settled, setSettled] = useState(query);
  const empty = query.trim() === '';

  useEffect(() => {
    if (query === settled) return;
    const timer = setTimeout(() => setSettled(query), delayMs);
    return () => clearTimeout(timer);
  }, [query, settled, delayMs]);

  const effective = empty ? '' : settled;
  const results = useMemo(() => searchSettings(entries, effective), [entries, effective]);
  return { query: effective, results, active: effective.trim() !== '', pending: !empty && effective !== query };
}
