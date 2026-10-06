'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { InnerPreview } from './InnerPreview';

const TILES = [
  ['surface_2', 'b2'], ['surface_3', 'b3'], ['surface_4', 'b4'], ['surface_5', 'b5'],
  ['accent_text', 'l3-c'], ['accent_deep', 'l4-c'], ['accent_fill', 'h3'], ['accent_glow', 'h4'],
] as const;

/** The 8-tile well showing the live palette (updates with theme, hue, vibrancy and lightness). */
export function ColourTiles() {
  const { t } = useTranslation();
  return (
    <InnerPreview flex>
      <div className="colour-tiles">
        {TILES.map(([name, token]) => (
          <div key={token} className="colour-tile">
            <i style={{ '--tile': `oklch(var(--${token}))` } as CSSProperties} />
            <span>{t(`settings_ui.tiles.${name}`)}</span>
          </div>
        ))}
      </div>
    </InnerPreview>
  );
}
