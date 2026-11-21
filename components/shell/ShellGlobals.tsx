'use client';

'use client';

import { useReapplySettings } from '@/hooks/useReapplySettings';
import { useNavigate } from '@/lib/router';
import { AppToaster } from '../AppToaster';
import { SolariumFilter } from '../SolariumFilter';
import { SeasonalParticles } from '../seasonal/SeasonalParticles';
import { useNewSeasonNotice } from '../seasonal/useNewSeasonNotice';

/** Glass filter, seasonal particles and toasts: mounted once, above everything. */
export function ShellGlobals() {
  const navigate = useNavigate();
  useReapplySettings();
  useNewSeasonNotice(navigate);
  return (
    <>
      <SolariumFilter />
      <SeasonalParticles />
      <AppToaster />
    </>
  );
}
