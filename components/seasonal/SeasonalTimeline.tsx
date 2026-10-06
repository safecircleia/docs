'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { formatDate, useNow } from '@/lib/format';
import { relativeTime } from '@/lib/relativeTime';
import type { SeasonInstance, SeasonResolution } from '@/lib/seasons';
import { Tooltip } from '../ui';
import { SeasonIcon } from './SeasonIcon';
import { seasonAccentStyle } from './seasonStyle';

const NOW_REFRESH_MS = 60_000;

interface ItemProps {
  instance: SeasonInstance | null;
  current?: boolean;
  /** shows the end (prev) or start (next) relative to now */
  anchor?: 'end' | 'start';
  now: Date;
}

function TimelineItem({ instance, current, anchor, now }: ItemProps) {
  const { t } = useTranslation();
  const season = instance?.season ?? null;
  const date = instance && anchor ? instance[anchor] : null;
  const desc = current ? t('seasonal.current') : date ? relativeTime(date, now) : null;

  return (
    <div
      className="seasonal-timeline-item colourful"
      data-current={current ? '' : undefined}
      data-season={season?.id}
      style={seasonAccentStyle(season)}
    >
      <SeasonIcon id={season?.id} size={30} gradient className="seasonal-timeline-icon" />
      <div className={cn('seasonal-timeline-name', season?.id === 'pride' && 'seasonal-rainbow-text')}>
        {season ? t(season.labelKey) : t('seasons.none')}
      </div>
      {desc && (date && !current ? (
        <Tooltip content={formatDate(date, 'long')}>
          <div className="seasonal-desc" tabIndex={0}>{desc}</div>
        </Tooltip>
      ) : (
        <div className="seasonal-desc">{desc}</div>
      ))}
    </div>
  );
}

/** Previous / current / next season with a track whose current segment sits under the middle item. */
export function SeasonalTimeline({ resolution }: { resolution: SeasonResolution }) {
  const now = useNow(NOW_REFRESH_MS);
  const { current, prev, next } = resolution;

  return (
    <div className="seasonal-timeline-wrap">
      <div className="seasonal-timeline">
        <TimelineItem instance={prev} anchor="end" now={now} />
        <TimelineItem instance={current} current now={now} />
        <TimelineItem instance={next} anchor="start" now={now} />
      </div>
      <div className="seasonal-timeline-bar">
        {current && <div className="seasonal-timeline-segment colourful" style={seasonAccentStyle(current.season)} />}
      </div>
    </div>
  );
}
