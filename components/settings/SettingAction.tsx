'use client';

import type { ReactNode } from 'react';
import { SettingRow } from './SettingRow';

/** Label on the left, one or more buttons on the right (6px apart). */
export function SettingAction({ id, title, body, icon, incompatible, children }: {
  id?: string; title: ReactNode; body?: ReactNode; icon?: ReactNode; incompatible?: string | true; children: ReactNode;
}) {
  return (
    <SettingRow id={id} type="action" title={title} body={body} icon={icon} incompatible={incompatible}>
      {children}
    </SettingRow>
  );
}
