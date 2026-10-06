'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchFilled } from '@mingcute/react/core-filled';
import { inputClass, Placeholder } from '../ui';
import { findMatchRanges, type SearchEntry, type SearchResult } from './search';
import { SETTINGS_TAB_ICONS } from './tabIcons';

/** `text` with the parts matching `query` wrapped in accent-coloured marks. */
export function HighlightText({ text, query }: { text: string; query: string }) {
  const ranges = findMatchRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) parts.push(<Fragment key={`t${i}`}>{text.slice(cursor, start)}</Fragment>);
    parts.push(<mark key={`m${i}`} className="search-mark">{text.slice(start, end)}</mark>);
    cursor = end;
  });
  if (cursor < text.length) parts.push(<Fragment key="end">{text.slice(cursor)}</Fragment>);
  return <>{parts}</>;
}

/** Sidebar search field (28px, icon on the right). Controlled; the page owns the query. */
export function SettingsSearchBox({ value, onChange, onSubmit }: {
  value: string; onChange: (value: string) => void; onSubmit?: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="settings-search" role="search">
      <input
        type="search"
        className={inputClass}
        value={value}
        placeholder={t('settings_ui.search.placeholder')}
        aria-label={t('settings_ui.search.label')}
        autoComplete="off"
        spellCheck={false}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSubmit?.(value); }}
      />
      <SearchFilled aria-hidden="true" />
    </div>
  );
}

/** Results page for the main column: count, then one row per match, or an empty state. */
export function SettingsSearchResults({ results, query, onPick }: {
  results: SearchResult[]; query: string; onPick: (entry: SearchEntry) => void;
}) {
  const { t } = useTranslation();
  if (results.length === 0) {
    return (
      <div className="search-page">
        <Placeholder face={t('ui.empty_face')}>
          <strong>{t('settings_ui.search.empty', { query: query.trim() })}</strong>
          <br />
          {t('settings_ui.search.empty_hint')}
        </Placeholder>
      </div>
    );
  }
  return (
    <div className="search-page">
      <p className="search-found" aria-live="polite">{t('settings_ui.search.found', { count: results.length })}</p>
      <div className="search-results">
        {results.map(({ entry }) => {
          const Icon = SETTINGS_TAB_ICONS[entry.tab];
          return (
            <button key={entry.id} type="button" className="search-result" onClick={() => onPick(entry)}>
              <span className="search-result-icon" aria-hidden="true"><Icon size={16} /></span>
              <span className="search-result-main">
                <span className="search-result-title"><HighlightText text={entry.title} query={query} /></span>
                {entry.body && <span className="search-result-body"><HighlightText text={entry.body} query={query} /></span>}
              </span>
              <span className="search-result-tab">{t(`prefs.tab.${entry.tab}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
