'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download2Filled, Refresh1Filled, Upload2Filled } from '@mingcute/react/core-filled';
import { SideAction, SideActions } from '../shell/card';
import { ExportDialog, ImportDialog, ResetDialog } from './SettingsDialogs';

type Dialog = 'import' | 'export' | 'reset' | null;

/** Import / Export / Reset side list for the settings sidebar; owns the three dialogs. */
export function SettingsActions() {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  return (
    <>
      <SideActions>
        <SideAction icon={<Download2Filled size={16} />} label={t('settings_ui.actions.import')} onClick={() => setDialog('import')} />
        <SideAction icon={<Upload2Filled size={16} />} label={t('settings_ui.actions.export')} onClick={() => setDialog('export')} />
        <SideAction icon={<Refresh1Filled size={16} />} label={t('settings_ui.actions.reset')} onClick={() => setDialog('reset')} />
      </SideActions>
      {dialog === 'import' && <ImportDialog onClose={close} />}
      {dialog === 'export' && <ExportDialog onClose={close} />}
      {dialog === 'reset' && <ResetDialog onClose={close} onBackup={() => setDialog('export')} />}
    </>
  );
}
