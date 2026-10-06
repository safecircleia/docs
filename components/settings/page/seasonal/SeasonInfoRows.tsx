'use client';

import { useTranslation } from 'react-i18next';
import { SettingCombo, SettingInfo } from '@/components/settings';
import { SeasonIcon } from '@/components/seasonal/SeasonIcon';
import { seasonInfoRows } from '@/components/seasonal/seasonInfo';
import { seasonAccentStyle } from '@/components/seasonal/seasonStyle';
import { Tooltip } from '@/components/ui';
import { formatDate, useNow } from '@/lib/format';
import { seasonById, type SeasonResolution } from '@/lib/seasons';

const NOW_REFRESH_MS = 60_000;

/** Current season / Start / End rows, or just Next season when nothing is active. */
export function SeasonInfoRows({ resolution }: { resolution: SeasonResolution }) {
  const { t } = useTranslation();
  const now = useNow(NOW_REFRESH_MS);
  return (
    <>
      {seasonInfoRows(resolution, now).map(row => {
        const season = row.seasonId ? seasonById(row.seasonId) : undefined;
        const value = row.key === 'current' && season ? (
          <span style={seasonAccentStyle(season)}>
            <SettingCombo season={season.id} icon={<SeasonIcon id={season.id} size={16} />}>{t(season.labelKey)}</SettingCombo>
          </span>
        ) : row.date ? (
          <Tooltip content={formatDate(row.date, 'long')}><span tabIndex={0}>{row.value}</span></Tooltip>
        ) : row.value;
        return <SettingInfo key={row.key} title={t(row.labelKey)}>{value}</SettingInfo>;
      })}
    </>
  );
}
