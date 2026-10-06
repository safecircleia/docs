'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Recessed well that shows the effect of the settings below it. `pad` = wide gutters, `flex` = centred. */
export function InnerPreview({ children, pad, flex, className }: {
  children: ReactNode; pad?: boolean; flex?: boolean; className?: string;
}) {
  return (
    <div className={cn('inner-preview', className)} data-pad={pad ? '' : undefined} data-flex={flex ? '' : undefined}>
      {children}
    </div>
  );
}
