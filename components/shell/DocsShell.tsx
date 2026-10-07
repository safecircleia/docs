'use client';

'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/lib/router';
import { activeSection, type NavSection } from '@/lib/nav';
import { DocsFooter } from './DocsFooter';
import { DocsHero } from './DocsHero';
import { DocsMasthead } from './DocsMasthead';
import { DocsMobileBar, DocsTabs } from './DocsTabs';
import { ShellGlobals } from './ShellGlobals';

const SETTINGS_PREFIX = '/settings';
const DOCS_PREFIX = '/docs';

/**
 * Persistent chrome around every page: backdrop, masthead (bottom bar on mobile), hero,
 * tab row, the routed page and the footer. The hero follows the active docs section; doc
 * pages skip hero and tabs for their own sidebar layout.
 */
export function DocsShell({ sections, children }: { sections: NavSection[]; children: ReactNode }) {
  const { t } = useTranslation();
  const { pathname, fullPath } = useLocation();
  const settingsActive = pathname.startsWith(SETTINGS_PREFIX);
  // Doc pages bring their own sidebar layout; home and settings keep the hero and tab row.
  const docsPage = pathname.startsWith(DOCS_PREFIX);
  const section = activeSection(sections, fullPath);
  const activeKey = settingsActive ? null : section.key;
  const tabProps = { sections, activeKey, settingsActive };

  return (
    <div className="sh-root" data-layout={docsPage ? 'docs' : undefined}>
      <div className="sh-backdrop" data-ready="" aria-hidden="true"><div className="sh-backdrop-img sh-backdrop-docs" /></div>
      <div className="seasonal-strip sh-desktop-only" aria-hidden="true" />
      <DocsMasthead />
      <DocsMobileBar {...tabProps} />
      <main className="sh-main">
        {docsPage ? null : settingsActive ? (
          <DocsHero asHeading seed="appearance" iconKey="settings" eyebrow={t('docs.hero_settings_eyebrow')} title={t('docs.hero_settings_title')} description={t('docs.hero_settings_body')} />
        ) : (
          <DocsHero asHeading={pathname === '/'} seed={section.key} iconKey={section.key} title={section.title} description={section.description} />
        )}
        {!docsPage && <DocsTabs {...tabProps} />}
        <div className="sh-page animate-page">{children}</div>
      </main>
      <DocsFooter />
      <ShellGlobals />
    </div>
  );
}
