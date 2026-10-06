'use client';

import { useTranslation } from 'react-i18next';
import { Modal } from '../ui';
import { SettingGroup } from './SettingGroup';
import { SettingSelect } from './SettingSelect';

/** Day and night theme selects for "Match system settings". */
export function ScheduleDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal title={t('settings_ui.theme.schedule_title')} description={t('settings_ui.theme.schedule_body')} onClose={onClose} width={460}>
      <SettingGroup blend>
        <SettingSelect bind="theme_day" />
        <SettingSelect bind="theme_night" />
      </SettingGroup>
    </Modal>
  );
}
