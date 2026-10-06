'use client';

import { useTranslation } from 'react-i18next';
import { SettingsActions, SettingsSearchBox, VersionLines } from '@/components/settings';
import { SideCta } from '@/components/shell/card';

/** Settings sidebar: search, back-to-docs CTA, Import / Export / Reset, version lines. */
export function SettingsSidebar({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="px-5"><SettingsSearchBox value={query} onChange={onQueryChange} /></div>
      <SideCta line={t('docs.settings_cta_line')} action={{ label: t('docs.not_found_cta'), to: '/docs' }} />
      <SettingsActions />
      <VersionLines />
    </>
  );
}
