'use client';

'use client';

import { useTranslation } from 'react-i18next';
import { HeartFilled } from '@mingcute/react/core-filled';
import { gitConfig } from '@/lib/shared';
import { Badge } from '../ui';

const SITE = 'https://safecircle.tech';
const Dot = () => <span className="sh-footer-dot" aria-hidden="true" />;

/** Brand and the small links under the card. */
export function DocsFooter() {
  const { t } = useTranslation();
  return (
    <footer className="sh-footer">
      <div className="sh-footer-row">
        <span className="sh-footer-brand">SafeCircle</span>
        <Badge>{t('shell.footer.alpha')}</Badge>
        <Dot />
        <span>
          {t('shell.footer.made_with')} <HeartFilled className="sh-footer-heart" aria-hidden /> {t('shell.footer.for_families')}
        </span>
        <Dot />
        <a className="sh-footer-link" href={`${SITE}/privacy`} target="_blank" rel="noopener noreferrer">{t('docs.footer_privacy')}</a>
        <Dot />
        <a className="sh-footer-link" href={`${SITE}/terms`} target="_blank" rel="noopener noreferrer">{t('docs.footer_terms')}</a>
        <Dot />
        <a className="sh-footer-link" href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} target="_blank" rel="noopener noreferrer">{t('docs.footer_github')}</a>
      </div>
    </footer>
  );
}
