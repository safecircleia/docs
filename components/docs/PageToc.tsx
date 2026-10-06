'use client';

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TocItem { title: ReactNode; url: string; depth: number }

/** On-this-page list with a scroll-spy highlight. */
export function PageToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map(i => i.url.slice(1));
    const targets = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-72px 0px -65% 0px' },
    );
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, [items]);

  return (
    <ul className="docs-toc">
      {items.map(item => (
        <li key={item.url}>
          <a href={item.url} className={cn('docs-toc-link')} data-active={item.url === `#${active}` ? '' : undefined} style={{ '--depth': Math.max(0, item.depth - 2) } as React.CSSProperties}>
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
