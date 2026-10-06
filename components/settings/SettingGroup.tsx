'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Rounded card of rows. `blend` drops the chrome (inside dialogs); `minWidth` fixes it to 400px. */
export function SettingGroup({ children, blend, minWidth, className }: {
  children: ReactNode; blend?: boolean; minWidth?: boolean; className?: string;
}) {
  return (
    <div className={cn('setting-group', className)} data-blend={blend ? '' : undefined} data-min-width={minWidth ? '' : undefined}>
      {children}
    </div>
  );
}
