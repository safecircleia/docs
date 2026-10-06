'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SettingRow } from './SettingRow';

/** Label on the left, muted value (text, link, relative time...) on the right. */
export function SettingInfo({ id, title, body, avatar, icon, children, onClick }: {
  id?: string; title: ReactNode; body?: ReactNode;
  /** 24px avatar before the label. */
  avatar?: ReactNode; icon?: ReactNode; children?: ReactNode; onClick?: () => void;
}) {
  return (
    <SettingRow
      id={id}
      type="info"
      title={title}
      body={body}
      icon={icon}
      lead={avatar ? <span className="setting-avatar">{avatar}</span> : undefined}
      onClick={onClick}
      slot="none"
    >
      {children != null && <div className="setting-info">{children}</div>}
    </SettingRow>
  );
}

/** Icon plus text value; with `season` it takes that season's accent (set via the parent's data-season/colourful). */
export function SettingCombo({ icon, children, season, className }: {
  icon: ReactNode; children: ReactNode; season?: string; className?: string;
}) {
  return (
    <span className={cn('setting-combo', season && 'colourful', className)} data-season={season}>
      {icon}
      {children}
    </span>
  );
}
