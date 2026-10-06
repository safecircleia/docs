'use client';

import { useTranslation } from 'react-i18next';
import { DropFilled, FontFilled, PicFilled } from '@mingcute/react/core-filled';
import {
  ColourControls, ColourTiles, FontPreview, SETTINGS_TAB_ICONS, SettingCheckbox, SettingGroup, SettingInput, SettingRadio,
  SettingRange, SettingsPanel, SettingSwitch, ThemePicker,
} from '@/components/settings';
import { Section } from '@/components/shell/card';
import { AvatarPreview } from './AvatarPreview';

const ICON = 14;

/** Settings › Visual: themes, colours, fonts, avatars & cards. */
export function VisualTab() {
  const { t } = useTranslation();
  const ThemeIcon = SETTINGS_TAB_ICONS.visual;
  return (
    <>
      <Section title={t('prefs.section.themes')} icon={<ThemeIcon size={ICON} />}>
        <SettingsPanel>
          <ThemePicker backdrop={null} />
          <SettingGroup>
            <SettingSwitch bind="solarium" />
            <SettingRange bind="noise" />
            <SettingRange bind="sat_bg" />
          </SettingGroup>
        </SettingsPanel>
      </Section>
      <Section title={t('prefs.section.colours')} icon={<DropFilled size={ICON} />}>
        <SettingsPanel>
          <ColourTiles />
          <ColourControls avatarAccent={null} />
        </SettingsPanel>
      </Section>
      <Section title={t('prefs.section.fonts')} icon={<FontFilled size={ICON} />}>
        <SettingsPanel>
          <FontPreview />
          <SettingGroup>
            <SettingRadio bind="font_choice" />
            <SettingInput bind="font" />
            <SettingCheckbox bind="font_serif" />
          </SettingGroup>
          <SettingGroup>
            <SettingRange bind="font_weight" />
            <SettingRange bind="font_weight_medium" />
            <SettingRange bind="font_weight_bold" />
          </SettingGroup>
        </SettingsPanel>
      </Section>
      <Section title={t('prefs.section.avatars')} icon={<PicFilled size={ICON} />}>
        <SettingsPanel>
          <AvatarPreview />
          <SettingGroup>
            <SettingSwitch bind="grid_glow" />
            <SettingRadio bind="avatar_radius" />
          </SettingGroup>
        </SettingsPanel>
      </Section>
    </>
  );
}
