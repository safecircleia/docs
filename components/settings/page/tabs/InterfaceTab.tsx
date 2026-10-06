'use client';

import { useTranslation } from 'react-i18next';
import { LayoutFilled } from '@mingcute/react/core-filled';
import { SettingGroup, SettingSwitch } from '@/components/settings';
import { Section } from '@/components/shell/card';

const ICON = 14;

/** Settings › Interface: layout density. */
export function InterfaceTab() {
  const { t } = useTranslation();
  return (
    <Section title={t('prefs.section.layout')} icon={<LayoutFilled size={ICON} />}>
      <SettingGroup>
        <SettingSwitch bind="compact" />
      </SettingGroup>
    </Section>
  );
}
