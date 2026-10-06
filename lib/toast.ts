import { createElement, type ReactNode } from 'react';
import { ArrowRightFilled } from '@mingcute/react/core-filled';
import { notify, type NotifyOptions, type NotifyType } from './notify';

export interface ToastOptions {
  title: string;
  description?: string;
  /** Rendered as an icon action with the title as its tooltip. */
  button?: { title: string; onClick: () => void; icon?: ReactNode };
  /** ms; null = persist. Defaults: success 4s, info 4.5s, warning 6s, error 7s. */
  duration?: number | null;
  icon?: ReactNode;
  /** Stable id: a repeat replaces the visible toast instead of stacking. */
  id?: string;
}

const toNotify = (type: NotifyType, o: ToastOptions): NotifyOptions => ({
  type,
  id: o.id,
  title: o.title,
  body: o.description,
  icon: o.icon,
  duration: o.duration,
  actions: o.button
    ? [{ label: o.button.title, icon: o.button.icon ?? createElement(ArrowRightFilled), onClick: o.button.onClick }]
    : undefined,
});

type Resolvable<A, T> = T | ((arg: A) => T);
const resolve = <A, T>(v: Resolvable<A, T>, arg: A): T => (typeof v === 'function' ? (v as (a: A) => T)(arg) : v);

/** Toast API over the bleh notification store (see notify.ts / AppToaster). */
export const toast = {
  success: (o: ToastOptions) => notify.show(toNotify('success', o)),
  info: (o: ToastOptions) => notify.show(toNotify('info', o)),
  warning: (o: ToastOptions) => notify.show(toNotify('warning', o)),
  error: (o: ToastOptions) => notify.show(toNotify('error', o)),

  /** Loading -> success/error in one toast. Returns the original promise. */
  promise: <T,>(promise: Promise<T>, opts: {
    loading: ToastOptions;
    success: Resolvable<T, ToastOptions>;
    error: Resolvable<unknown, ToastOptions>;
  }) => notify.promise(promise, {
    loading: toNotify('info', opts.loading),
    success: data => toNotify('success', resolve(opts.success, data)),
    error: err => toNotify('error', resolve(opts.error, err)),
  }),

  dismiss: (id?: string) => notify.dismiss(id),
  clear: () => notify.clear(),

  /** Low-importance confirmation ("Copied", "Saved"): top-centre pill, 3s, newest only. */
  status: (title: string, body?: string) => notify.status(title, body),

};
