'use client';

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DashboardFilled, PaletteFilled, Settings1Filled, TranslateFilled } from '@mingcute/react/core-filled';
import { i18n } from '@/lib/i18n';
import { Link, useLocation } from '@/lib/router';
import { EXTERNAL_THEMES, THEME_IDS, resolvedTheme, setSettings } from '@/lib/settings';
import { useSettings } from '@/hooks/useSetting';
import { SafeCircleLogo } from '../logo';
import { MastheadSeasonChip } from '../seasonal/MastheadSeasonChip';
import { Badge, IconButton, MenuHeader, MenuItem, MenuSeparator, Popout, usePopout } from '../ui';
import { DocsSearch } from './DocsSearch';

export const DASHBOARD_URL = 'https://app.safecircle.tech';

const LANG_LABEL: Record<string, string> = { en: 'English', es: 'Español' };

function LanguageMenu() {
  const { t } = useTranslation();
  const { pathname, lang } = useLocation();
  const query = useSearchParams().toString();
  const { mounted, btnRef, popoutProps, triggerProps } = usePopout();
  return (
    <>
      <IconButton ref={btnRef} size="sm" label={t('docs.language')} {...triggerProps}>
        <TranslateFilled />
      </IconButton>
      {mounted && (
        <Popout {...popoutProps} width={190} align="end">
          <MenuHeader>{t('docs.language')}</MenuHeader>
          {i18n.languages.map(code => (
            <MenuItem key={code} indent selected={code === lang} label={LANG_LABEL[code] ?? code} to={`/${code}${pathname === '/' ? '' : pathname}${query ? `?${query}` : ''}`} />
          ))}
        </Popout>
      )}
    </>
  );
}

function AppearanceMenu() {
  const { t } = useTranslation();
  const settings = useSettings();
  const current = resolvedTheme(settings);
  const { mounted, btnRef, popoutProps, triggerProps } = usePopout();
  return (
    <>
      <IconButton ref={btnRef} size="sm" label={t('docs.appearance')} {...triggerProps}>
        <PaletteFilled />
      </IconButton>
      {mounted && (
        <Popout {...popoutProps} width={230} align="end">
          <MenuHeader>{t('shell.account.themes')}</MenuHeader>
          {THEME_IDS.map(id => (
            <MenuItem
              key={id}
              indent
              keepOpen
              selected={id === current}
              label={t(`prefs.theme.opt.${id}`)}
              trailing={EXTERNAL_THEMES.has(id) ? <Badge tone="new">{t('prefs.theme_group.new_tag')}</Badge> : undefined}
              onClick={() => setSettings({ theme: id, theme_schedule: false })}
            />
          ))}
          <MenuSeparator />
          <MenuItem icon={<Settings1Filled />} label={t('docs.settings')} to="/settings" />
        </Popout>
      )}
    </>
  );
}

/** Fixed, transparent 48px bar: logo, dashboard link and search on the left, menus on the right. */
export function DocsMasthead() {
  const { t } = useTranslation();
  return (
    <header className="sh-masthead sh-desktop-only" aria-label={t('docs.masthead')}>
      <div className="sh-masthead-inner">
        <div className="sh-cluster sh-cluster-left">
          <Link to="/" className="ui-btn sh-logo" data-appearance="subtle" aria-label="SafeCircle">
            <SafeCircleLogo className="size-[18px]" />
            <span className="sh-logo-word">SafeCircle</span>
            <Badge tone="beta">{t('docs.docs_badge')}</Badge>
          </Link>
          <a className="ui-btn" data-appearance="subtle" href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
            <DashboardFilled />
            {t('docs.dashboard')}
          </a>
          <DocsSearch />
        </div>
        <div className="sh-cluster">
          <MastheadSeasonChip />
          {/* useSearchParams needs a boundary for static prerendering */}
          <Suspense fallback={null}><LanguageMenu /></Suspense>
          <AppearanceMenu />
          <span className="sh-account-sep" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
