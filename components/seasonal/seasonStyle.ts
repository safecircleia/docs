import type { CSSProperties } from 'react';
import type { Season } from '@/lib/seasons';

/** Re-points a `.colourful` subtree at a season's accent, whatever accent the user picked. */
export function seasonAccentStyle(season: Season | null | undefined): CSSProperties {
  if (!season) return {};
  return {
    '--hue-over': season.hue,
    '--sat-over': season.sat,
    '--lit-over': season.lit,
  } as CSSProperties;
}
