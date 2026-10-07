import type { ComponentType, ReactNode } from 'react';
import { BulbFilled, CheckCircleFilled, CloseCircleFilled, InformationFilled, WarningFilled } from '@mingcute/react/core-filled';

type Tone = 'info' | 'warn' | 'error' | 'success' | 'idea';

const ICONS: Record<Tone, ComponentType<{ className?: string }>> = {
  info: InformationFilled,
  warn: WarningFilled,
  error: CloseCircleFilled,
  success: CheckCircleFilled,
  idea: BulbFilled,
};

const ALIAS: Record<string, Tone> = { warning: 'warn', danger: 'error', tip: 'idea' };

interface CalloutProps { type?: string; title?: ReactNode; icon?: ReactNode; children?: ReactNode }

/** Drop-in for Fumadocs' Callout: tinted panel, icon aligned with the first line, even padding. */
export function Callout({ type = 'info', title, icon, children }: CalloutProps) {
  const tone: Tone = ALIAS[type] ?? (type in ICONS ? (type as Tone) : 'info');
  const Icon = ICONS[tone];
  return (
    <div className="callout" data-tone={tone} role="note">
      <span className="callout-icon" aria-hidden="true">{icon ?? <Icon />}</span>
      <div className="callout-body">
        {title && <p className="callout-title">{title}</p>}
        {children && <div className="callout-content">{children}</div>}
      </div>
    </div>
  );
}
