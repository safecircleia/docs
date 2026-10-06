'use client';

import { useTranslation } from 'react-i18next';
import { Loading3Filled, SnowflakeFilled } from '@mingcute/react/core-filled';
import { SettingCheckbox, SettingGroup, SettingRadio, SettingSwitch } from '@/components/settings';
import { SeasonIcon } from '@/components/seasonal/SeasonIcon';
import { SeasonalTimeline } from '@/components/seasonal/SeasonalTimeline';
import { Section } from '@/components/shell/card';
import { InlineAlert } from '@/components/ui';
import { useSeason } from '@/hooks/useSeason';
import { useSettings } from '@/hooks/useSetting';
import { prefersReducedMotion } from '@/lib/settings';
import { SeasonInfoRows } from '../seasonal/SeasonInfoRows';

/** Timeline + auto-adapt switch, particles and effects. */
export function SeasonalTab() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { resolution } = useSeason();
  const paused = settings.seasonal && settings.seasonal_particles !== 'none' && prefersReducedMotion(settings);

  return (
    <>
      <Section id="section_timeline" title={t('seasonal.timeline_title')} icon={<SeasonIcon id={resolution.current?.season.id} size={14} />}>
        <div className="seasonal-tab-timeline" data-off={settings.seasonal ? undefined : ''}>
          <SeasonalTimeline resolution={resolution} />
        </div>
        <SettingGroup>
          <SettingSwitch bind="seasonal" />
          <SeasonInfoRows resolution={resolution} />
        </SettingGroup>
      </Section>
      <Section id="section_particles" title={t('prefs.section.particles')} icon={<SnowflakeFilled size={14} />}>
        <SettingGroup>
          <SettingRadio bind="seasonal_particles" />
          <SettingCheckbox bind="seasonal_particles_lite" />
        </SettingGroup>
        {paused && (
          <InlineAlert tone="info" className="mt-[10px]">
            <strong>{t('docs.seasonal_paused_title')}</strong> {t('docs.seasonal_paused_body')}
          </InlineAlert>
        )}
      </Section>
      <Section id="section_effects" title={t('prefs.section.effects')} icon={<Loading3Filled size={14} />}>
        <SettingGroup>
          <SettingCheckbox bind="seasonal_overlays" />
        </SettingGroup>
      </Section>
    </>
  );
}
