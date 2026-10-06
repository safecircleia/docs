import type { ComponentType, SVGProps } from 'react';
import {
  CalendarFilled, EggFilled, LeafFilled, PumpkinLanternFilled, RainbowFilled,
  SnowflakeFilled, SparklesFilled, SunFilled, TreeFilled,
} from '@mingcute/react/core-filled';
import type { SeasonId } from '@/lib/seasons';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const ICONS: Record<SeasonId, IconComponent> = {
  halloween: PumpkinLanternFilled,
  fall: SnowflakeFilled,
  christmas: TreeFilled,
  summer: SunFilled,
  easter: EggFilled,
  pride: RainbowFilled,
  new_years: SparklesFilled,
  pre_fall: LeafFilled,
};

/** MingCute icon for a season; no id (nothing active) gives a calendar. */
export function seasonIcon(id: SeasonId | null | undefined): IconComponent {
  return id ? ICONS[id] : CalendarFilled;
}
