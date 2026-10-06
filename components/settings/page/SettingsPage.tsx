'use client';

'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { SETTINGS_TAB_ICONS, SettingsSearchResults, jumpToSetting, useSettingsSearch, type SearchEntry } from '@/components/settings';
import { SeasonIcon } from '@/components/seasonal/SeasonIcon';
import { ContentCard, ToolbarTabs } from '@/components/shell/card';
import { useSeason } from '@/hooks/useSeason';
import type { SettingsTab } from '@/lib/settings';
import { useNavigate } from '@/lib/router';
import { composeSearchIndex } from './searchEntries';
import { SettingsSidebar } from './SettingsSidebar';
import { resolveTab, tabPath } from './tabs';
import { AccessibilityTab } from './tabs/AccessibilityTab';
import { InterfaceTab } from './tabs/InterfaceTab';
import { SeasonalTab } from './tabs/SeasonalTab';
import { VisualTab } from './tabs/VisualTab';
import { TAB_ORDER } from '@/lib/settings';

const TAB_ICON_PX = 16;

const TAB_BODIES: Record<SettingsTab, ComponentType> = {
  visual: VisualTab,
  interface: InterfaceTab,
  seasonal: SeasonalTab,
  accessibility: AccessibilityTab,
};

/** Appearance settings: the dashboard's settings page without the account tabs. Saved in localStorage. */
export function SettingsPage({ tab: param }: { tab?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { resolution } = useSeason();
  const [query, setQuery] = useState('');
  const [pick, setPick] = useState<{ id: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const tab = resolveTab(param);
  const deepLink = searchParams.get('setting');
  const index = useMemo(() => composeSearchIndex(t), [t]);
  const results = useSettingsSearch(index, query);

  // Settings live in localStorage, so render the controls after mount to keep hydration clean.
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => (deepLink ? jumpToSetting(deepLink) : undefined), [deepLink, tab]);
  useEffect(() => (pick ? jumpToSetting(pick.id) : undefined), [pick]);

  const seasonId = resolution.current?.season.id;
  const tabs = TAB_ORDER.map(key => {
    const Icon = SETTINGS_TAB_ICONS[key];
    const icon = key === 'seasonal' && seasonId ? <SeasonIcon id={seasonId} size={TAB_ICON_PX} /> : <Icon size={TAB_ICON_PX} />;
    return { key, label: t(`prefs.tab.${key}`), icon };
  });
  const Body = TAB_BODIES[tab];

  const openResult = (entry: SearchEntry) => {
    setQuery('');
    navigate(tabPath(entry.tab));
    setPick({ id: entry.id });
  };

  if (!mounted) return <ContentCard main={<div className="min-h-[480px]" />} />;

  return (
    <ContentCard
      toolbar={<ToolbarTabs tabs={tabs} active={results.active ? null : tab} hrefFor={tabPath} />}
      main={results.active
        ? <SettingsSearchResults results={results.results} query={results.query} onPick={openResult} />
        : <div key={tab} className="animate-page flex flex-col gap-10"><Body /></div>}
      side={<SettingsSidebar query={query} onQueryChange={setQuery} />}
    />
  );
}
