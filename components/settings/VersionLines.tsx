'use client';

import { useTranslation } from 'react-i18next';
import { BUILD } from '../../lib/updater';
import { formatDateTime } from '../../lib/format';
import { VersionLines as VersionLinesList } from '../shell/card';

/** Sidebar footer: "SafeCircle 0.1.5 ‘codename’", build id and commit, and the build date. */
export function VersionLines() {
  const { t } = useTranslation();
  return (
    <VersionLinesList
      lines={[
        t('settings_ui.version.app', { version: BUILD.version, codename: BUILD.codename }),
        t('settings_ui.version.build', { id: BUILD.buildId }),
        formatDateTime(BUILD.builtAt),
      ]}
    />
  );
}
