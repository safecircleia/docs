'use client';

'use client';

import { useTranslation } from 'react-i18next';
import { Settings1Filled, SearchFilled, PaletteFilled } from '@mingcute/react/core-filled';
import { Link } from '@/lib/router';
import type { NavSection } from '@/lib/nav';
import { Popout, usePopout } from '../ui';
import { DocsSearch } from './DocsSearch';
import { sectionIcon } from './sectionIcons';

interface TabProps { to: string; label: string; Icon: ReturnType<typeof sectionIcon>; active: boolean }

function Tab({ to, label, Icon, active }: TabProps) {
  return (
    <Link to={to} className="sh-tab" aria-current={active ? 'page' : undefined}>
      <Icon className="sh-tab-icon" />
      {label}
    </Link>
  );
}

interface DocsTabsProps { sections: NavSection[]; activeKey: string | null; settingsActive: boolean }

/** The 46px tab row under the hero: doc sections on the left, appearance on the right. */
export function DocsTabs({ sections, activeKey, settingsActive }: DocsTabsProps) {
  const { t } = useTranslation();
  return (
    <nav className="sh-tabs" aria-label={t('docs.sections')}>
      <div className="sh-tabs-list">
        {sections.map(s => (
          <Tab key={s.key} to={s.url} label={s.title} Icon={sectionIcon(s.key)} active={s.key === activeKey} />
        ))}
        <span className="sh-tab-spacer" />
        <Tab to="/settings" label={t('docs.appearance')} Icon={Settings1Filled} active={settingsActive} />
      </div>
    </nav>
  );
}

const SHEET_MAX_WIDTH = 460;
const SHEET_MARGIN = 12;

function SearchControl() {
  const { t } = useTranslation();
  const { mounted, btnRef, popoutProps, triggerProps, close } = usePopout();
  return (
    <>
      <button ref={btnRef} type="button" className="sh-mctl" {...triggerProps} aria-haspopup="dialog">
        <SearchFilled className="sh-mctl-icon" aria-hidden />
        <span className="sh-mctl-label">{t('shell.search.label')}</span>
      </button>
      {mounted && (
        <Popout {...popoutProps} width={Math.min(SHEET_MAX_WIDTH, window.innerWidth - SHEET_MARGIN)} align="center" className="sh-sheet" role="dialog" label={t('docs.search_placeholder')}>
          <DocsSearch autoFocus inline shortcut={false} onNavigate={close} />
        </Popout>
      )}
    </>
  );
}

/** Mobile (<=980px) bottom bar: the doc sections, search and the appearance page. */
export function DocsMobileBar({ sections, activeKey, settingsActive }: DocsTabsProps) {
  const { t } = useTranslation();
  const bar = sections.filter(s => ['overview', 'platform', 'support'].includes(s.key));
  return (
    <nav className="sh-mobilebar sh-mobile-only" aria-label={t('docs.sections')}>
      <div className="sh-mobilebar-grid">
        {bar.map(s => {
          const Icon = sectionIcon(s.key);
          return (
            <Link key={s.key} to={s.url} className="sh-mctl" aria-current={s.key === activeKey ? 'page' : undefined}>
              <Icon className="sh-mctl-icon" />
              <span className="sh-mctl-label">{s.title}</span>
            </Link>
          );
        })}
        <SearchControl />
        <Link to="/settings" className="sh-mctl" aria-current={settingsActive ? 'page' : undefined}>
          <PaletteFilled className="sh-mctl-icon" aria-hidden />
          <span className="sh-mctl-label">{t('docs.appearance')}</span>
        </Link>
      </div>
    </nav>
  );
}
