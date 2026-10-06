import type { ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';

/** Plain, serialisable view of the Fumadocs page tree for the client shell. Icons are server-rendered nodes. */
export interface NavLeaf { type: 'page'; name: string; url: string; icon?: ReactNode }
export interface NavFolder { type: 'folder'; name: string; url?: string; icon?: ReactNode; defaultOpen?: boolean; children: NavNode[] }
export interface NavSeparator { type: 'separator'; name?: string }
export type NavNode = NavLeaf | NavFolder | NavSeparator;

export interface NavSection {
  key: string;
  title: string;
  description?: string;
  url: string;
  /** `/en/docs/platform`: prefix shared by every page of the section (url may point at its first page). */
  prefix: string;
  children: NavNode[];
}

const label = (node: ReactNode): string => (typeof node === 'string' ? node : '');

function convert(nodes: PageTree.Node[]): NavNode[] {
  const out: NavNode[] = [];
  for (const node of nodes) {
    if (node.type === 'separator') out.push({ type: 'separator', name: label(node.name) || undefined });
    else if (node.type === 'page') out.push({ type: 'page', name: label(node.name), url: node.url, icon: node.icon });
    else {
      const children = convert(node.children);
      if (node.index && !children.some(c => c.type === 'page' && c.url === node.index!.url)) {
        children.unshift({ type: 'page', name: label(node.index.name), url: node.index.url, icon: node.index.icon });
      }
      out.push({ type: 'folder', name: label(node.name), url: node.index?.url, icon: node.icon, defaultOpen: node.defaultOpen, children });
    }
  }
  return out;
}

/**
 * Top-level tabs: an Overview tab for the root pages, then one per `root: true` folder.
 * The Overview sidebar also lists every section as a collapsed folder.
 */
export function buildSections(tree: PageTree.Root, overviewTitle: string, overviewDescription?: string): NavSection[] {
  const rootPages = tree.children.filter((n): n is PageTree.Item => n.type === 'page');
  const roots = tree.children.filter((n): n is PageTree.Folder => n.type === 'folder' && Boolean(n.root));

  const sections: NavSection[] = roots.map(folder => {
    const children = convert([folder]);
    const first = children[0];
    const inner = first.type === 'folder' ? first.children : [];
    const url = folder.index?.url ?? inner.find((n): n is NavLeaf => n.type === 'page')?.url ?? '/';
    return {
      key: folderKey(url),
      title: label(folder.name),
      description: typeof folder.description === 'string' ? folder.description : undefined,
      url,
      prefix: folderPrefix(url),
      children: inner,
    };
  });

  const overviewUrl = rootPages[0]?.url ?? '/';
  const overview: NavSection = {
    key: 'overview',
    title: overviewTitle,
    description: overviewDescription,
    url: overviewUrl,
    prefix: overviewUrl,
    children: [
      ...convert(rootPages),
      ...sections.map<NavFolder>(s => ({ type: 'folder', name: s.title, url: s.url, children: s.children })),
    ],
  };
  return [overview, ...sections];
}

/** `/en/docs/platform/...` -> `platform`: the folder name, not the last page. */
const folderKey = (url: string): string => url.split('/').filter(Boolean)[2] ?? 'section';
const folderPrefix = (url: string): string => `/${url.split('/').filter(Boolean).slice(0, 3).join('/')}`;

/** Longest section prefix that matches the path; the Overview tab catches everything else. */
export function activeSection(sections: NavSection[], pathname: string): NavSection {
  const hit = sections
    .slice(1)
    .filter(s => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return hit ?? sections[0];
}
