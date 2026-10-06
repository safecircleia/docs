import type { ComponentType } from 'react';
import { BookFilled, BrainFilled, CodeFilled, LayersFilled, LifebuoyFilled, PaletteFilled } from '@mingcute/react/core-filled';

export type ShellIcon = ComponentType<{ size?: number | string; className?: string }>;

const ICONS: Record<string, ShellIcon> = {
  overview: BookFilled,
  platform: LayersFilled,
  developers: CodeFilled,
  ai: BrainFilled,
  support: LifebuoyFilled,
  settings: PaletteFilled,
};

export const sectionIcon = (key: string): ShellIcon => ICONS[key] ?? BookFilled;
