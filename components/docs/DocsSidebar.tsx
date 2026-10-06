'use client';

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DownSmallFilled } from '@mingcute/react/core-filled';
import { cn } from '@/lib/cn';
import { Link, useLocation } from '@/lib/router';
import type { NavFolder, NavNode } from '@/lib/nav';

const hasActive = (nodes: NavNode[], path: string): boolean =>
  nodes.some(n => (n.type === 'page' && n.url === path) || (n.type === 'folder' && (n.url === path || hasActive(n.children, path))));

function Row({ node, path, depth }: { node: NavNode; path: string; depth: number }) {
  if (node.type === 'separator') return node.name ? <p className="docs-nav-sep">{node.name}</p> : <hr className="docs-nav-rule" />;
  if (node.type === 'page') return <PageRow name={node.name} url={node.url} icon={node.icon} active={node.url === path} depth={depth} />;
  return <FolderRow folder={node} path={path} depth={depth} />;
}

function PageRow({ name, url, icon, active, depth }: { name: string; url: string; icon?: React.ReactNode; active: boolean; depth: number }) {
  return (
    <Link to={url} className="cc-side-action docs-nav-row" data-on={active ? '' : undefined} aria-current={active ? 'page' : undefined} style={{ '--depth': depth } as React.CSSProperties}>
      <span className="cc-side-action-icon" aria-hidden="true">{icon}</span>
      <span className="cc-side-action-label">{name}</span>
    </Link>
  );
}

function FolderRow({ folder, path, depth }: { folder: NavFolder; path: string; depth: number }) {
  const containsActive = hasActive(folder.children, path);
  const [open, setOpen] = useState(containsActive || Boolean(folder.defaultOpen));
  return (
    <div className="docs-nav-folder" data-open={open ? '' : undefined}>
      <button type="button" className="cc-side-action docs-nav-row" aria-expanded={open} onClick={() => setOpen(v => !v)} style={{ '--depth': depth } as React.CSSProperties}>
        <span className="cc-side-action-icon" aria-hidden="true">{folder.icon}</span>
        <span className="cc-side-action-label">{folder.name}</span>
        <span className="cc-side-action-end docs-nav-chevron" aria-hidden="true"><DownSmallFilled size={14} /></span>
      </button>
      {open && (
        <div className="docs-nav-children">
          {folder.children.map((child, i) => <Row key={i} node={child} path={path} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

/** The active section's page tree as the bleh glass side list. */
export function DocsSidebar({ nodes, className }: { nodes: NavNode[]; className?: string }) {
  const { fullPath } = useLocation();
  const { t } = useTranslation();
  return (
    <nav aria-label={t('docs.navigate')} className={cn('cc-side-actions docs-nav', className)}>
      {nodes.map((node, i) => <Row key={i} node={node} path={fullPath} depth={0} />)}
    </nav>
  );
}
