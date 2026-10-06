'use client';

'use client';

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { SearchFilled } from '@mingcute/react/core-filled';
import { cn } from '@/lib/cn';
import { useLang, useNavigate } from '@/lib/router';
import { Kbd } from '../ui';

interface DocsSearchProps {
  className?: string;
  autoFocus?: boolean;
  /** Called after navigating to a hit (the mobile sheet closes itself). */
  onNavigate?: () => void;
  /** Listen for the global shortcut (only the masthead instance does). */
  shortcut?: boolean;
  /** Results flow below the input instead of floating (the mobile sheet). */
  inline?: boolean;
}

const BLUR_CLOSE_MS = 120;
const MAX_HITS = 12;

/** Search results carry <mark> highlights as Markdown; show them as plain text. */
const plain = (v: unknown): string => (typeof v === 'string' ? v.replace(/<\/?mark>/g, '') : '');

/** Masthead search: the bleh 200px item with a glass result menu, backed by the Fumadocs search API. */
export function DocsSearch({ className, autoFocus, onNavigate, shortcut = true, inline }: DocsSearchProps) {
  const { t } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, setSearch, query } = useDocsSearch({ type: 'fetch', locale: lang });

  const hits = Array.isArray(query.data) ? query.data.slice(0, MAX_HITS) : [];

  useEffect(() => { setIsMac(/mac|iphone|ipad/i.test(navigator.platform)); }, []);
  useEffect(() => { setIndex(0); }, [search]);
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const go = (url: string) => {
    setOpen(false);
    setSearch('');
    inputRef.current?.blur();
    onNavigate?.();
    navigate(url);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(i + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && hits[index]) { e.preventDefault(); go(hits[index].url); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const showList = open && search.trim().length > 0 && !query.isLoading;

  return (
    <div className={cn('relative', className)}>
      <label className="sh-search">
        <SearchFilled aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={showList && hits[index] ? `${listId}-${index}` : undefined}
          aria-label={t('docs.search_placeholder')}
          autoFocus={autoFocus}
          autoComplete="off"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), BLUR_CLOSE_MS)}
          onKeyDown={onKeyDown}
          placeholder={t('docs.search_placeholder')}
        />
        {shortcut && <Kbd>{isMac ? '⌘K' : 'Ctrl K'}</Kbd>}
      </label>

      {showList && (
        <div id={listId} role="listbox" className="sh-menu-box glass-menu animate-menu" data-inline={inline ? '' : undefined}>
          {hits.length === 0 ? (
            <div className="sh-menu-empty">{t('docs.search_empty', { query: search })}</div>
          ) : hits.map((hit, i) => (
            <Fragment key={hit.id}>
              <button
                type="button"
                id={`${listId}-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === index}
                className="ui-btn ui-menu-item"
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(hit.url)}
              >
                <span className="ui-menu-body">
                  <span>{hit.type === 'page' ? plain(hit.content) : (hit.breadcrumbs?.map(plain).join(' › ') ?? '')}</span>
                  {hit.type !== 'page' && <span className="ui-menu-desc">{plain(hit.content)}</span>}
                </span>
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
