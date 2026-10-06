import type { ReactNode } from 'react';

/**
 * Tiny notification store behind the toast API: a visible stack (max 5) with a queue behind it,
 * per-notification timers that pause on hover, persist/progress, update-in-place (promises),
 * and a single status pill. Rendering lives in components/AppToaster.tsx.
 */

export type NotifyType = 'generic' | 'info' | 'success' | 'warning' | 'error';
/** Hue override for the card's palette (see .hue-* utilities). `accent` = no override. */
export type NotifyHue = 'neg' | 'pos' | 'warn' | 'orange' | 'accent';

/** Auto-dismiss durations in ms. Errors and alerts linger; confirmations do not. */
export const DURATION = {
  generic: 4500, success: 4000, info: 4500, warning: 6000, error: 7000, high: 14000, medium: 9000, status: 3000,
} as const;

export const MAX_VISIBLE = 5;
export const EXIT_MS = 300;
const STATUS_EXIT_MS = 150;

export interface NotifyAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface NotifyOptions {
  id?: string;
  type?: NotifyType;
  title: string;
  body?: string;
  icon?: ReactNode;
  hue?: NotifyHue;
  actions?: NotifyAction[];
  /** ms; null = persist until dismissed. Defaults per type. */
  duration?: number | null;
  /** 0-100: shows a manual progress bar instead of the countdown (no auto-dismiss unless duration is set). */
  progress?: number;
  /** Spinner icon, no countdown, until updated. */
  loading?: boolean;
}

export interface Notification {
  id: string;
  type: NotifyType;
  title: string;
  body?: string;
  icon?: ReactNode;
  hue?: NotifyHue;
  actions: NotifyAction[];
  duration: number | null;
  progress?: number;
  loading: boolean;
  paused: boolean;
  state: 'open' | 'leaving';
  /** Bumped on every (re)start so the countdown bar restarts. */
  run: number;
}

export interface StatusNotice {
  id: string;
  title: string;
  body?: string;
  icon?: ReactNode;
  state: 'open' | 'leaving';
}

export interface NotifyState {
  notifications: Notification[];
  status: StatusNotice | null;
}

type Timer = { handle: ReturnType<typeof setTimeout>; startedAt: number; remaining: number };

let state: NotifyState = { notifications: [], status: null };
let queue: Notification[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const timers = new Map<string, Timer>();
const exits = new Map<string, ReturnType<typeof setTimeout>>();
let statusTimer: ReturnType<typeof setTimeout> | undefined;
let statusExit: ReturnType<typeof setTimeout> | undefined;

const emit = () => listeners.forEach(fn => fn());
const set = (next: Partial<NotifyState>) => { state = { ...state, ...next }; emit(); };
const patchOne = (id: string, patch: Partial<Notification>) =>
  set({ notifications: state.notifications.map(n => (n.id === id ? { ...n, ...patch } : n)) });

const defaultDuration = (o: NotifyOptions): number | null =>
  o.duration !== undefined ? o.duration : o.loading ? null : o.progress !== undefined ? null : DURATION[o.type ?? 'generic'];

function build(o: NotifyOptions, run = 0): Notification {
  return {
    id: o.id ?? `n-${++seq}`,
    type: o.type ?? 'generic',
    title: o.title,
    body: o.body,
    icon: o.icon,
    hue: o.hue,
    actions: o.actions ?? [],
    duration: defaultDuration(o),
    progress: o.progress,
    loading: !!o.loading,
    paused: false,
    state: 'open',
    run,
  };
}

function clearTimer(id: string) {
  const t = timers.get(id);
  if (t) clearTimeout(t.handle);
  timers.delete(id);
}

function startTimer(id: string, ms: number) {
  clearTimer(id);
  timers.set(id, { handle: setTimeout(() => notify.dismiss(id), ms), startedAt: Date.now(), remaining: ms });
}

const liveCount = () => state.notifications.filter(n => n.state === 'open').length;

function admit(n: Notification) {
  set({ notifications: [...state.notifications, n] });
  if (n.duration !== null && !n.loading) startTimer(n.id, n.duration);
}

function promote() {
  while (queue.length && liveCount() < MAX_VISIBLE) admit(queue.shift()!);
}

export const notify = {
  /** Shows a notification (or replaces the one with the same id). Returns its id. */
  show(opts: NotifyOptions): string {
    const gone = opts.id ? state.notifications.find(n => n.id === opts.id && n.state === 'leaving') : undefined;
    if (gone) {
      clearTimeout(exits.get(gone.id));
      exits.delete(gone.id);
      set({ notifications: state.notifications.filter(n => n.id !== gone.id) });
    }
    const existing = opts.id ? state.notifications.find(n => n.id === opts.id && n.state === 'open') : undefined;
    if (existing) { notify.update(existing.id, opts); return existing.id; }
    const queued = opts.id ? queue.findIndex(q => q.id === opts.id) : -1;
    const n = build(opts);
    if (queued >= 0) { queue[queued] = n; return n.id; }
    if (liveCount() >= MAX_VISIBLE) queue.push(n);
    else admit(n);
    return n.id;
  },

  /** Patches a visible notification in place; restarts its countdown. */
  update(id: string, patch: Partial<NotifyOptions>) {
    const qi = queue.findIndex(q => q.id === id);
    const cur = qi >= 0 ? queue[qi] : state.notifications.find(n => n.id === id && n.state === 'open');
    if (!cur) return;
    const merged: NotifyOptions = {
      id, type: cur.type, title: cur.title, body: cur.body, icon: cur.icon, hue: cur.hue,
      actions: cur.actions, loading: cur.loading, progress: cur.progress, duration: cur.duration, ...patch,
    };
    // Changing the type or loading state re-derives the lifetime (a resolved promise gets its type's duration)
    if (patch.duration === undefined && (patch.type !== undefined || patch.loading !== undefined)) {
      delete merged.duration;
      merged.progress = patch.progress;
    }
    const next = build(merged, cur.run + 1);
    if (qi >= 0) { queue[qi] = next; return; }
    set({ notifications: state.notifications.map(n => (n.id === id ? next : n)) });
    clearTimer(id);
    if (next.duration !== null && !next.loading) startTimer(id, next.duration);
  },

  /** Sets the manual progress (0-100) of a persistent notification. */
  setProgress(id: string, progress: number) {
    patchOne(id, { progress: Math.max(0, Math.min(100, progress)) });
  },

  pause(id: string) {
    if (state.notifications.find(n => n.id === id)?.paused) return;
    const t = timers.get(id);
    if (t) {
      clearTimeout(t.handle);
      t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
    }
    patchOne(id, { paused: true });
  },

  resume(id: string) {
    if (!state.notifications.find(n => n.id === id)?.paused) return;
    const t = timers.get(id);
    if (t) startTimer(id, t.remaining);
    patchOne(id, { paused: false });
  },

  /** Starts the exit, removes after EXIT_MS. No id = everything. */
  dismiss(id?: string) {
    if (id === undefined) {
      queue = [];
      state.notifications.forEach(n => notify.dismiss(n.id));
      return;
    }
    queue = queue.filter(q => q.id !== id);
    const n = state.notifications.find(x => x.id === id);
    if (!n || n.state === 'leaving') return;
    clearTimer(id);
    patchOne(id, { state: 'leaving', paused: false });
    exits.set(id, setTimeout(() => {
      exits.delete(id);
      set({ notifications: state.notifications.filter(x => x.id !== id) });
      promote();
    }, EXIT_MS));
  },

  clear() { notify.dismiss(); },

  /** Top-centre pill: only the newest is shown, auto-removes after 3s, click dismisses. */
  status(title: string, body?: string, icon?: ReactNode): string {
    clearTimeout(statusTimer);
    clearTimeout(statusExit);
    const id = `s-${++seq}`;
    set({ status: { id, title, body, icon, state: 'open' } });
    statusTimer = setTimeout(() => notify.dismissStatus(id), DURATION.status);
    return id;
  },

  dismissStatus(id?: string) {
    const s = state.status;
    if (!s || s.state === 'leaving' || (id && s.id !== id)) return;
    clearTimeout(statusTimer);
    set({ status: { ...s, state: 'leaving' } });
    statusExit = setTimeout(() => { if (state.status?.id === s.id) set({ status: null }); }, STATUS_EXIT_MS);
  },

  /**
   * Loading notification that turns into success / error in place.
   * Returns the original promise so callers can keep awaiting it.
   */
  promise<T>(p: Promise<T>, o: {
    loading: Omit<NotifyOptions, 'type'>;
    success: Omit<NotifyOptions, 'type'> | ((data: T) => Omit<NotifyOptions, 'type'>);
    error: Omit<NotifyOptions, 'type'> | ((err: unknown) => Omit<NotifyOptions, 'type'>);
  }): Promise<T> {
    const id = notify.show({ ...o.loading, type: 'info', loading: true, duration: null });
    p.then(
      data => notify.update(id, { ...(typeof o.success === 'function' ? o.success(data) : o.success), type: 'success', loading: false }),
      err => notify.update(id, { ...(typeof o.error === 'function' ? o.error(err) : o.error), type: 'error', loading: false }),
    );
    return p;
  },

  getState: (): NotifyState => state,
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },

  /** Drops everything immediately (tests). */
  reset() {
    timers.forEach(t => clearTimeout(t.handle));
    timers.clear();
    exits.forEach(h => clearTimeout(h));
    exits.clear();
    clearTimeout(statusTimer);
    clearTimeout(statusExit);
    queue = [];
    state = { notifications: [], status: null };
    emit();
  },
};

/** Hue each notification type is drawn in unless `hue` overrides it (generic stays neutral). */
export const TYPE_HUE: Record<NotifyType, NotifyHue | null> = {
  generic: null, info: 'accent', success: 'pos', warning: 'orange', error: 'neg',
};
