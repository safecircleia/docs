import { prefersReducedMotion } from '../../lib/settings';

const HIGHLIGHT_CLASS = 'animate-highlight';
const HIGHLIGHT_DELAY_MS = 200;
/** The highlight lasts 4s; this is the safety net when animationend never fires (reduced motion). */
const HIGHLIGHT_CLEANUP_MS = 4500;
const RETRY_MS = 50;
const MAX_TRIES = 30;

export const settingDomId = (keyOrId: string): string => (keyOrId.startsWith('setting_') ? keyOrId : `setting_${keyOrId}`);

/** Restarts the wash on a row and removes the class when it ends so it can be triggered again. */
export function highlightElement(el: HTMLElement): void {
  el.classList.remove(HIGHLIGHT_CLASS);
  void el.offsetWidth;
  el.classList.add(HIGHLIGHT_CLASS);
  const done = () => {
    clearTimeout(fallback);
    el.removeEventListener('animationend', done);
    el.classList.remove(HIGHLIGHT_CLASS);
  };
  const fallback = setTimeout(done, HIGHLIGHT_CLEANUP_MS);
  el.addEventListener('animationend', done);
}

/**
 * Scrolls the row for a setting key (or `setting_<key>` id) to the centre and highlights it.
 * Waits for the row to mount, so it is safe to call right after switching tabs. Returns a cancel function.
 */
export function jumpToSetting(keyOrId: string): () => void {
  const id = settingDomId(keyOrId);
  let tries = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const attempt = () => {
    const el = document.getElementById(id);
    if (!el) {
      if (++tries < MAX_TRIES) timer = setTimeout(attempt, RETRY_MS);
      return;
    }
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    timer = setTimeout(() => highlightElement(el), HIGHLIGHT_DELAY_MS);
  };

  timer = setTimeout(attempt, 0);
  return () => clearTimeout(timer);
}
