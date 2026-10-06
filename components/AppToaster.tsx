'use client';

import { useSyncExternalStore } from 'react';
import { notify } from '../lib/notify';
import { NotificationCard } from './ui/NotificationCard';

/**
 * Hosts for bleh notifications: toasts stack top-right under the masthead (full width on
 * mobile); the status pill sits top-centre, newest only. Mount once, above everything.
 */
export function AppToaster() {
  const { notifications, status } = useSyncExternalStore(notify.subscribe, notify.getState, notify.getState);
  return (
    <>
      <div className="ui-notif-host" aria-live="polite">
        {notifications.map(n => <NotificationCard key={n.id} n={n} />)}
      </div>
      <div className="ui-status-host">
        {status && (
          <button
            key={status.id}
            type="button"
            className="ui-status"
            data-state={status.state}
            onClick={() => notify.dismissStatus(status.id)}
          >
            <span className="ui-status-title">{status.icon}{status.title}</span>
            {status.body && <span className="ui-status-body">{status.body}</span>}
          </button>
        )}
      </div>
    </>
  );
}
