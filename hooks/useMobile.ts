import { useSyncExternalStore } from 'react';

/** bleh's mobile breakpoint: below this the masthead becomes a bottom bar. */
export const MOBILE_BREAKPOINT = 980;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

/** Server and hydration render as desktop (false); the client value takes over right after. */
export function useMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth <= breakpoint,
    () => false
  );
}
