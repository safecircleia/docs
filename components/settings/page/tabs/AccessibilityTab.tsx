'use client';

import { useTranslation } from 'react-i18next';
import { RunFilled, TextFilled } from '@mingcute/react/core-filled';
import { SettingGroup, SettingSwitch } from '@/components/settings';
import { Section } from '@/components/shell/card';

const ICON = 14;

/** Settings › Accessibility: motion and text. */
export function AccessibilityTab() {
  const { t } = useTranslation();
  return (
    <>
      <Section title={t('prefs.section.motion')} icon={<RunFilled size={ICON} />}>
        <SettingGroup>
          <SettingSwitch bind="reduced_motion" />
          <SettingSwitch bind="show_scroller" />
        </SettingGroup>
      </Section>
      <Section title={t('prefs.section.text')} icon={<TextFilled size={ICON} />}>
        <SettingGroup>
          <SettingSwitch bind="underline_links" />
        </SettingGroup>
      </Section>
    </>
  );
}
