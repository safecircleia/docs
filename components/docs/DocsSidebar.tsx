'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CloseFilled, DownSmallFilled, MenuFilled, SearchFilled } from '@mingcute/react/core-filled';
import { Link, useLocation, withLang, useLang } from '@/lib/router';
import { activeSection, type NavFolder, type NavLeaf, type NavNode, type NavSection } from '@/lib/nav';
import { HighlightText } from '../settings/SettingsSearch';
import { Section, SideAction, SideActions } from '../shell/card';
import { sectionIcon } from '../shell/sectionIcons';
import { IconButton } from '../ui';

interface Match { page: NavLeaf; trail: string[] }

const STAGGER_S = 0.03;
const STAGGER_MAX = 10;

const hasActive = (nodes: NavNode[], path: string): boolean =>
  nodes.some(n => (n.type === 'page' && n.url === path) || (n.type === 'folder' && (n.url === path || hasActive(n.children, path))));

/** Every page under `nodes`, with the folder names leading to it. */
function flatten(nodes: NavNode[], trail: string[] = []): Match[] {
  return nodes.flatMap(n => {
    if (n.type === 'page') return [{ page: n, trail }];
    if (n.type === 'folder') return flatten(n.children, [...trail, n.name]);
    return [];
  });
}

/** Overview's own children repeat every section as a folder; the section list covers those. */
const pagesOf = (s: NavSection): NavNode[] => (s.key === 'overview' ? s.children.filter(n => n.type === 'page') : s.children);

function Rows({ nodes, path }: { nodes: NavNode[]; path: string }) {
  return nodes.map((node, i) => {
    if (node.type === 'separator') return node.name ? <p key={i} className="dn-sep">{node.name}</p> : <hr key={i} className="dn-rule" />;
    if (node.type === 'page') return <PageRow key={node.url} page={node} active={node.url === path} />;
    return <FolderRow key={`${node.name}-${i}`} folder={node} path={path} />;
  });
}

function PageRow({ page, active }: { page: NavLeaf; active: boolean }) {
  return (
    <Link to={page.url} className="ui-btn ui-menu-item dn-row" aria-current={active ? 'page' : undefined}>
      {page.icon && <span className="ui-menu-lead" aria-hidden="true">{page.icon}</span>}
      <span className="ui-menu-body">{page.name}</span>
    </Link>
  );
}

function FolderRow({ folder, path }: { folder: NavFolder; path: string }) {
  const containsActive = hasActive(folder.children, path);
  const [open, setOpen] = useState(containsActive || Boolean(folder.defaultOpen));
  // Opening a page deep in a closed folder (filter, pager, keys) unfolds it.
  const [seen, setSeen] = useState(containsActive);
  if (containsActive !== seen) {
    setSeen(containsActive);
    if (containsActive) setOpen(true);
  }
  return (
    <div className="dn-folder" data-open={open ? '' : undefined}>
      <button type="button" className="ui-btn ui-menu-item dn-row" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        {folder.icon && <span className="ui-menu-lead" aria-hidden="true">{folder.icon}</span>}
        <span className="ui-menu-body">{folder.name}</span>
        <DownSmallFilled className="dn-chevron" aria-hidden="true" />
      </button>
      {open && <div className="dn-children animate-menu"><Rows nodes={folder.children} path={path} /></div>}
    </div>
  );
}

/** Filter matches in the settings search-result style. */
function Results({ matches, query, cursor, path }: { matches: Match[]; query: string; cursor: number; path: string }) {
  const { t } = useTranslation();
  if (matches.length === 0) return <p className="sh-menu-empty">{t('docs.filter_empty', { query })}</p>;
  return (
    <div className="search-results dn-results">
      {matches.map(({ page, trail }, i) => (
        <Link
          key={page.url}
          to={page.url}
          className="search-result animate-item"
          style={{ '--delay': `${Math.min(i, STAGGER_MAX) * STAGGER_S}s` } as CSSProperties}
          aria-current={page.url === path ? 'page' : undefined}
          data-cursor={i === cursor ? '' : undefined}
        >
          {page.icon && <span className="search-result-icon" aria-hidden="true">{page.icon}</span>}
          <span className="search-result-main">
            <span className="search-result-title"><HighlightText text={page.name} query={query} /></span>
            <span className="search-result-body">{trail.join(' › ')}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Focus the filter on `/`, unless the user is already typing somewhere. */
function useSlashFocus(input: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const el = input.current;
      if (!el || el.offsetParent === null) return; // hidden (closed mobile drawer)
      e.preventDefault();
      el.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [input]);
}

/**
 * The docs navigation, built from the dashboard sidebar pieces: the settings search box, the
 * sections as a side-action list, then the current section's pages as menu rows. Pinned left
 * column on desktop; a slide-in drawer behind the "Menu" bar on mobile.
 */
export function DocsSidebar({ sections }: { sections: NavSection[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { fullPath } = useLocation();
  const section = activeSection(sections, fullPath);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(fullPath);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useSlashFocus(input);

  if (fullPath !== lastPath) {
    setLastPath(fullPath);
    setDrawer(false);
  }

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    return sections
      .flatMap(s => flatten(pagesOf(s), [s.title]))
      .filter(({ page, trail }) => `${page.name} ${trail.join(' ')}`.toLowerCase().includes(q));
  }, [sections, q]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  // Keep the current page in view inside the sidebar's own scroll area (not the window).
  useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>('.dn-row[aria-current="page"]');
    if (!box || !el) return;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 48) box.scrollTop = top - box.clientHeight / 3;
  }, [fullPath]);

  useEffect(() => {
    scroller.current?.querySelector('[data-cursor]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const onFilterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (query) { e.stopPropagation(); setQuery(''); } else input.current?.blur();
      return;
    }
    if (!matches?.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => (c + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      router.push(withLang(matches[Math.min(cursor, matches.length - 1)].page.url, lang));
      setQuery('');
    }
  };

  return (
    <>
      <button type="button" className="dn-mobile-toggle" aria-expanded={drawer} onClick={() => setDrawer(true)}>
        <MenuFilled aria-hidden="true" />
        <span>{t('docs.menu')}</span>
        <span className="dn-mobile-crumb">{section.title}</span>
      </button>
      <div className="dn-scrim" data-open={drawer ? '' : undefined} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className="dn" data-open={drawer ? '' : undefined} aria-label={t('docs.docs_nav')}>
        <div className="dn-top">
          <div className="settings-search dn-search" role="search">
            <input
              ref={input}
              type="search"
              className="ui-input"
              value={query}
              placeholder={t('docs.filter_pages')}
              aria-label={t('docs.filter_pages')}
              autoComplete="off"
              spellCheck={false}
              onChange={e => { setQuery(e.target.value); setCursor(0); }}
              onKeyDown={onFilterKey}
            />
            <SearchFilled aria-hidden="true" />
          </div>
          <IconButton className="dn-close" label={t('docs.close_menu')} onClick={() => setDrawer(false)} tooltip={false}>
            <CloseFilled />
          </IconButton>
        </div>
        <div className="dn-scroll" ref={scroller}>
          {matches ? (
            <Results matches={matches} query={query.trim()} cursor={cursor} path={fullPath} />
          ) : (
            <>
              <Section title={t('docs.sections')} subtle>
                <SideActions>
                  {sections.map(s => {
                    const Icon = sectionIcon(s.key);
                    return <SideAction key={s.key} icon={<Icon size={16} />} label={s.title} to={s.url} on={s.key === section.key} />;
                  })}
                </SideActions>
              </Section>
              <Section title={section.title} subtle>
                <nav key={section.key} className="dn-tree animate-item" aria-label={section.title}>
                  <Rows nodes={pagesOf(section)} path={fullPath} />
                </nav>
              </Section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
