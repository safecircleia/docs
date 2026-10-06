'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckFilled, CloseFilled, InformationFilled, WarningFilled } from '@mingcute/react/core-filled';
import { cn } from '../../lib/cn';
import { TYPE_HUE, notify, type Notification, type NotifyHue, type NotifyType } from '../../lib/notify';
import { Spinner } from './Spinner';
import { Tooltip } from './Tooltip';

const typeIcon: Record<NotifyType, ReactNode> = {
  generic: <InformationFilled />,
  info: <InformationFilled />,
  success: <CheckFilled />,
  warning: <WarningFilled />,
  error: <CloseFilled />,
};

const hueClass: Record<NotifyHue, string> = {
  neg: 'hue-neg', pos: 'hue-pos', warn: 'hue-warn', orange: 'hue-orange', accent: 'colourful',
};

/** One bleh toast: glass card, type icon, title/body, full-height icon actions, countdown bar. */
export function NotificationCard({ n }: { n: Notification }) {
  const { t } = useTranslation();
  const hue = n.hue ?? TYPE_HUE[n.type];
  const timed = n.duration !== null && !n.loading && n.progress === undefined;

  return (
    <div
      role={n.type === 'error' ? 'alert' : 'status'}
      className={cn('ui-notif glass-toast', hue && hueClass[hue])}
      data-type={n.type}
      data-state={n.state}
      data-colourful={hue ? '' : undefined}
      data-paused={n.paused ? '' : undefined}
      onPointerEnter={() => notify.pause(n.id)}
      onPointerLeave={() => notify.resume(n.id)}
      onFocus={() => notify.pause(n.id)}
      onBlur={() => notify.resume(n.id)}
    >
      <span className="ui-notif-icon" aria-hidden>{n.loading ? <Spinner /> : n.icon ?? typeIcon[n.type]}</span>
      <div className="ui-notif-text">
        <div className="ui-notif-title">{n.title}</div>
        {n.body && <div className="ui-notif-body">{n.body}</div>}
      </div>
      <div className="ui-notif-actions">
        {n.actions.map(a => (
          <Tooltip key={a.label} content={a.label}>
            <button
              type="button"
              className="ui-btn"
              data-appearance="subtle"
              aria-label={a.label}
              onClick={() => { a.onClick(); notify.dismiss(n.id); }}
            >
              {a.icon}
            </button>
          </Tooltip>
        ))}
        <Tooltip content={t('ui.dismiss')}>
          <button type="button" className="ui-btn" data-appearance="subtle" aria-label={t('ui.dismiss')} onClick={() => notify.dismiss(n.id)}>
            <CloseFilled />
          </button>
        </Tooltip>
      </div>
      {timed && (
        <div className="ui-notif-progress" aria-hidden>
          <i key={n.run} style={{ '--dur': `${n.duration}ms` } as CSSProperties} />
        </div>
      )}
      {n.progress !== undefined && (
        <div className="ui-notif-progress" aria-hidden>
          <i data-manual style={{ width: `${n.progress}%`, marginRight: 'auto' }} />
        </div>
      )}
    </div>
  );
}
