'use client';

import { useId } from 'react';
import type { SeasonId } from '@/lib/seasons';
import { cn } from '@/lib/cn';
import { seasonIcon } from './seasonIcons';

/**
 * Season icon. `gradient` fills it with the accent's l2-c to l4-c vertical gradient
 * (c1 to c3 when no season is given); the parent must be `.colourful` for the accent.
 */
export function SeasonIcon({ id, size = 18, gradient = false, className }: {
  id: SeasonId | null | undefined;
  size?: number;
  gradient?: boolean;
  className?: string;
}) {
  const Icon = seasonIcon(id);
  const gradId = useId();
  if (!gradient) return <Icon size={size} className={className} aria-hidden />;

  const [from, to] = id ? ['var(--l2-c)', 'var(--l4-c)'] : ['var(--c1)', 'var(--c3)'];
  return (
    <span className={cn('season-icon-grad', className)} style={{ width: size, height: size, '--season-grad': `url(#${gradId})` } as React.CSSProperties}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: `oklch(${from})` }} />
            <stop offset="1" style={{ stopColor: `oklch(${to})` }} />
          </linearGradient>
        </defs>
      </svg>
      <Icon size={size} aria-hidden />
    </span>
  );
}
