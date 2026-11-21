import { useLayoutEffect } from 'react';
import { applySettings, getSettings } from '@/lib/settings';

/**
 * Re-writes the saved theme, accent and season onto <html> when the shell mounts.
 *
 * The pre-paint script sets those attributes before React runs. If hydration fails (for example because
 * Cloudflare rewrote <head> at the edge), React discards the server <html> and builds a new one, which
 * drops them. applySettings is idempotent, so on a clean load this is a no-op; after a rebuild it
 * restores the theme before the next paint.
 */
export function useReapplySettings(): void {
  useLayoutEffect(() => {
    applySettings(getSettings());
  }, []);
}
