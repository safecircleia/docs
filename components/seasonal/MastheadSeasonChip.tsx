'use client';

import { Link } from '@/lib/router';
import { useTranslation } from 'react-i18next';
import { useSeason } from '../../hooks/useSeason';
import type { Season } from '@/lib/seasons';
import { Tooltip } from '../ui';
import { SeasonIcon } from './SeasonIcon';
import { seasonAccentStyle } from './seasonStyle';

/** Icon-only masthead item for the active season; nothing renders outside a season. */
export function MastheadSeasonChip() {
  const { active } = useSeason();
  return active ? <SeasonChip season={active.season} /> : null;
}

export function SeasonChip({ season }: { season: Season }) {
  const { t } = useTranslation();
  const name = t(season.labelKey);
  const accent = seasonAccentStyle(season);
  return (
    <Tooltip
      content={<span className="colourful font-medium" style={{ ...accent, color: 'oklch(var(--l3-c))' }}>{name}</span>}
      sub={t('seasonal.open_settings')}
    >
      <Link
        to="/settings/seasonal"
        aria-label={t('seasonal.chip_label', { season: name })}
        className="ui-btn colourful"
        data-icon=""
        data-appearance="subtle"
        data-season={season.id}
        style={{ ...accent, '--i-icon': 'oklch(var(--l3-c))', '--i-col': 'oklch(var(--l3-c))' } as React.CSSProperties}
      >
        <SeasonIcon id={season.id} size={18} />
      </Link>
    </Tooltip>
  );
}
