'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Column inside a Section: previews, groups and tips sit 15px apart. */
export function SettingsPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('settings-panel', className)}>{children}</div>;
}
