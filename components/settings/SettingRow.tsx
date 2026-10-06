'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Refresh1Filled, WarningFilled } from '@mingcute/react/core-filled';
import { cn } from '../../lib/cn';
import { Tooltip } from '../ui';

export type SettingRowType = 'toggle' | 'checkbox' | 'options' | 'input' | 'select' | 'info' | 'action';

/** Row types that never show the reset bubble (the control already shows its own state). */
const NO_RESET: ReadonlySet<SettingRowType> = new Set(['toggle', 'checkbox', 'select']);

export interface SettingRowProps {
  /** DOM id; bound rows pass `setting_<key>` so search and deep links can find them. */
  id?: string;
  type?: SettingRowType;
  title: ReactNode;
  body?: ReactNode;
  /** 16px lead-in icon before the heading. */
  icon?: ReactNode;
  /** Larger lead-in (24px avatar) before the heading. */
  lead?: ReactNode;
  modified?: boolean;
  onReset?: () => void;
  /** Disables the row and shows the "Incompatible" overlay on hover; a string is the reason. */
  incompatible?: string | true;
  disabled?: boolean;
  /** Removes the row entirely while it is disabled or incompatible. */
  hideIfDisabled?: boolean;
  /** Makes the whole row a click target (toggle and checkbox rows). */
  onClick?: () => void;
  /** Full-width content under the heading (radio lists). */
  below?: ReactNode;
  /** Right-hand slot flavour: default, a 400px range block, or unwrapped. */
  slot?: 'default' | 'range' | 'free' | 'none';
  className?: string;
  children?: ReactNode;
}

/** Heading block (title, body, reset bubble) with a right-hand control slot. */
export function SettingRow({
  id, type = 'action', title, body, icon, lead, modified, onReset, incompatible, disabled, hideIfDisabled, onClick,
  below, slot = 'default', className, children,
}: SettingRowProps) {
  const { t } = useTranslation();
  const off = disabled || incompatible !== undefined;
  const clickable = !!onClick && !off;
  const showReset = !!modified && !!onReset && !NO_RESET.has(type);

  return (
    <div
      id={id}
      className={cn('setting', className)}
      data-type={type}
      data-modified={modified ? 'true' : undefined}
      data-disabled={off ? 'true' : undefined}
      data-hide={hideIfDisabled ? '' : undefined}
      data-clickable={clickable ? '' : undefined}
      onClick={clickable ? onClick : undefined}
    >
      {lead}
      {icon && <span className="setting-icon" aria-hidden="true">{icon}</span>}
      <div className="setting-heading">
        <h5 className="setting-title">
          {title}
          {showReset && (
            <Tooltip content={t('ui.reset')}>
              <button type="button" className="setting-reset" aria-label={t('ui.reset')} onClick={e => { e.stopPropagation(); onReset?.(); }}>
                <Refresh1Filled />
              </button>
            </Tooltip>
          )}
        </h5>
        {body && <p className="setting-body">{body}</p>}
      </div>
      {children != null && (slot === 'none'
        ? children
        : <div className="setting-slot" data-kind={slot === 'default' ? undefined : slot} onClick={clickable ? e => e.stopPropagation() : undefined}>{children}</div>)}
      {below && <div className="setting-below">{below}</div>}
      {incompatible !== undefined && (
        <div className="setting-overlay" aria-hidden="true">
          <WarningFilled />
          <strong>{t('ui.incompatible')}</strong>
          {typeof incompatible === 'string' && <span>{incompatible}</span>}
        </div>
      )}
    </div>
  );
}
