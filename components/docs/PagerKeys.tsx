'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** `[` and `]` open the previous and next page, unless the user is typing. */
export function PagerKeys({ prev, next }: { prev?: string; next?: string }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const to = e.key === '[' ? prev : e.key === ']' ? next : undefined;
      if (to) router.push(to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, router]);
  return null;
}
