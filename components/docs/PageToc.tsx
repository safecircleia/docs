'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpFilled } from '@mingcute/react/core-filled';

export interface TocItem { title: ReactNode; url: string; depth: number }

/** Scroll position as 0..1 of the document. */
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return progress;
}

/** On-this-page list with a scroll-spy highlight, a reading progress meter and back-to-top. */
export function PageToc({ items }: { items: TocItem[] }) {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  const progress = useScrollProgress();
  const list = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);

  // The accent thumb slides to the active link instead of each link toggling its own border.
  useLayoutEffect(() => {
    const el = list.current?.querySelector<HTMLElement>('[data-active]');
    setThumb(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
  }, [active]);

  useEffect(() => {
    const targets = items.map(i => document.getElementById(i.url.slice(1))).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    // The active heading is the last one scrolled past the top third of the viewport.
    const update = () => {
      const line = window.innerHeight / 3;
      const passed = targets.filter(el => el.getBoundingClientRect().top < line);
      setActive((passed.at(-1) ?? targets[0]).id);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [items]);

  return (
    <div className="toc">
      <div className="toc-head">
        <span>{t('docs.toc')}</span>
        <span className="toc-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={t('docs.toc')}>
          <span style={{ scale: `${progress} 1` }} />
        </span>
      </div>
      {items.length > 0 && (
        <ul className="toc-list" ref={list} style={thumb ? ({ '--thumb-top': `${thumb.top}px`, '--thumb-h': `${thumb.height}px` } as CSSProperties) : undefined} data-thumb={thumb ? '' : undefined}>
          {items.map(item => (
            <li key={item.url}>
              <a href={item.url} className="toc-link" data-active={item.url === `#${active}` ? '' : undefined} data-depth={Math.max(0, item.depth - 2)}>
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="toc-top" data-visible={progress > 0.05 ? '' : undefined} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUpFilled aria-hidden="true" />
        {t('docs.back_to_top')}
      </button>
    </div>
  );
}
