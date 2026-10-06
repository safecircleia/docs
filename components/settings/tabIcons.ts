import type { ComponentType } from 'react';
import {
  BrushFilled, LeafFilled, Layout2Filled, WheelchairFilled,
} from '@mingcute/react/core-filled';
import type { SettingsTab } from '../../lib/settings';

export type SettingsIcon = ComponentType<{ size?: number | string; className?: string }>;

/** Tab icons for search results (the toolbar may swap Seasonal for the season's own icon). */
export const SETTINGS_TAB_ICONS: Record<SettingsTab, SettingsIcon> = {
  visual: BrushFilled,
  interface: Layout2Filled,
  seasonal: LeafFilled,
  accessibility: WheelchairFilled,
};
