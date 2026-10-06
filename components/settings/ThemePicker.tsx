'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSetting';
import { LIGHT_THEMES, THEME_IDS, resolvedTheme, setSettings, type ThemeId } from '../../lib/settings';
import { CardTip, SeeMore } from '../ui';
import { ScheduleDialog } from './ScheduleDialog';
import { SettingCheckbox } from './SettingCheckbox';
import { SettingGroup } from './SettingGroup';
import { SettingRow } from './SettingRow';
import { ThemeBubble } from './ThemeBubble';
import { BRIGHT_ROW_ICON, MOODY_ROW_ICON } from './themes';

const BRIGHT = THEME_IDS.filter(id => LIGHT_THEMES.has(id));
const MOODY = THEME_IDS.filter(id => !LIGHT_THEMES.has(id));

/** Bright and Moody theme rows, "Match system settings" and the schedule tip. `backdrop` is the preview header image. */
export function ThemePicker({ backdrop }: { backdrop?: string | null }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const [scheduling, setScheduling] = useState(false);
  const current = resolvedTheme(settings);
  const pick = (theme: ThemeId) => setSettings({ theme, theme_schedule: false });

  const row = (kind: 'bright' | 'moody', ids: readonly ThemeId[], id?: string) => (
    <SettingRow
      id={id}
      type="options"
      icon={kind === 'bright' ? BRIGHT_ROW_ICON : MOODY_ROW_ICON}
      title={t(`prefs.theme_group.${kind}.title`)}
      body={t(`prefs.theme_group.${kind}.body`)}
      slot="none"
    >
      <div className="theme-list" role="radiogroup" aria-label={t(`prefs.theme_group.${kind}.title`)}>
        {ids.map(themeId => (
          <ThemeBubble key={themeId} id={themeId} selected={current === themeId} onSelect={() => pick(themeId)} backdrop={backdrop} />
        ))}
      </div>
    </SettingRow>
  );

  return (
    <>
      <SettingGroup>
        {row('bright', BRIGHT, 'setting_theme')}
        {row('moody', MOODY)}
        <SettingCheckbox bind="theme_schedule" />
      </SettingGroup>
      {settings.theme_schedule && (
        <CardTip className="theme-tip">
          {t('prefs.schedule.tip', { day: t(`prefs.theme.opt.${settings.theme_day}`), night: t(`prefs.theme.opt.${settings.theme_night}`) })}
          <SeeMore className="ml-2" onClick={() => setScheduling(true)}>{t('prefs.schedule.change')}</SeeMore>
        </CardTip>
      )}
      {scheduling && <ScheduleDialog onClose={() => setScheduling(false)} />}
    </>
  );
}
