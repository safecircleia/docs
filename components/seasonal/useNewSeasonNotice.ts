import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/lib/toast';
import { relativeTime } from '@/lib/relativeTime';
import { useSeason } from '../../hooks/useSeason';

export const LAST_SEASON_KEY = 'sc_last_season_seen';
const NOTICE_DELAY_MS = 1500;
const SETTINGS_PATH = '/settings/seasonal';

function readSeen(): string | null {
  try { return localStorage.getItem(LAST_SEASON_KEY); } catch { return null; }
}

function writeSeen(value: string) {
  try { localStorage.setItem(LAST_SEASON_KEY, value); } catch { /* storage unavailable: the notice may repeat */ }
}

/** Once per season (and year), a toast announcing it with a shortcut to its settings. */
export function useNewSeasonNotice(navigate?: (to: string) => void): void {
  const { t } = useTranslation();
  const { active } = useSeason();
  const id = active?.season.id;
  const startYear = active?.start.getFullYear();
  const labelKey = active?.season.labelKey;
  const end = active?.end.getTime();

  useEffect(() => {
    if (!id || labelKey === undefined || end === undefined) return;
    const marker = `${id}:${startYear}`;
    if (readSeen() === marker) return;
    const timer = setTimeout(() => {
      writeSeen(marker);
      toast.info({
        id: 'season-notice',
        title: t('seasonal.new_season'),
        description: t('seasonal.season_ends', { season: t(labelKey), time: relativeTime(new Date(end)) }),
        button: {
          title: t('seasonal.open_settings'),
          onClick: () => navigate?.(SETTINGS_PATH),
        },
      });
    }, NOTICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [id, startYear, labelKey, end, navigate, t]);
}
