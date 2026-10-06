import { useEffect, useState } from 'react';
import { resolveSeason, type SeasonInstance, type SeasonResolution } from '../lib/seasons';
import { useSetting } from './useSetting';

const REFRESH_MS = 60 * 60 * 1000;
/** A date outside every season: the server render and first client render agree, then the effect sets the real one. */
const SSR_DATE = new Date(2000, 2, 15);

/** `active` is the current season, or null when seasonal theming is switched off. */
export function useSeason(): { resolution: SeasonResolution; active: SeasonInstance | null } {
  const [seasonal] = useSetting('seasonal');
  const [resolution, setResolution] = useState(() => resolveSeason(SSR_DATE));

  useEffect(() => {
    setResolution(resolveSeason(new Date()));
    const refresh = () => setResolution(resolveSeason(new Date()));
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { resolution, active: seasonal ? resolution.current : null };
}
