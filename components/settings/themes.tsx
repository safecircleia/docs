'use client';

import type { ReactNode } from 'react';
import { MoonFilled, MoonStarsFilled, RainbowFilled, SunFilled, WindFilled } from '@mingcute/react/core-filled';
import type { ThemeId } from '../../lib/settings';

const ICON = 14;

function HalfCircle() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2v16a8 8 0 0 0 0-16Z" />
    </svg>
  );
}

/** Small icon beside a theme's name; the external themes (Rosé Pine, Kanagawa) have none. */
export const THEME_ICONS: Partial<Record<ThemeId, ReactNode>> = {
  light: <SunFilled size={ICON} />,
  ink: <RainbowFilled size={ICON} />,
  dark: <WindFilled size={ICON} />,
  darker: <MoonFilled size={ICON} />,
  oled: <HalfCircle />,
};

export const BRIGHT_ROW_ICON = <SunFilled size={16} />;
export const MOODY_ROW_ICON = <MoonStarsFilled size={16} />;
