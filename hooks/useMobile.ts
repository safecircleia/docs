import { useState, useEffect } from 'react';

/** bleh's mobile breakpoint: below this the masthead becomes a bottom bar. */
export const MOBILE_BREAKPOINT = 980;

export function useMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}
