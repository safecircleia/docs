'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseFilled, InformationFilled, LockFilled } from '@mingcute/react/core-filled';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type LoadingVariant = 'loading' | 'static' | 'info' | 'error' | 'private';

const glyph: Partial<Record<LoadingVariant, ReactNode>> = {
  info: <InformationFilled />,
  error: <CloseFilled />,
  private: <LockFilled />,
};

/** Centred spinner + muted label (30px block). Other variants swap the icon and stop spinning. */
export function LoadingData({ label, variant = 'loading', className }: { label?: ReactNode; variant?: LoadingVariant; className?: string }) {
  const { t } = useTranslation();
  return (
    <div role={variant === 'loading' ? 'status' : undefined} className={cn('ui-loading', className)}>
      {glyph[variant] ?? <Spinner size={18} still={variant === 'static'} />}
      <span>{label ?? t('ui.loading')}</span>
    </div>
  );
}

/** Kaomoji empty state: face line (18/22 600 c3) over a c2 summary. */
export function Placeholder({ face, children, className }: { face?: string; children: ReactNode; className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={cn('ui-placeholder', className)}>
      <div className="ui-placeholder-face" aria-hidden>{face ?? t('ui.empty_face')}</div>
      <div>{children}</div>
    </div>
  );
}
