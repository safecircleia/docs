'use client';

import { useTranslation } from 'react-i18next';
import { Link } from '@/lib/router';
import { ContentCard } from './shell/card';

/** In-shell 404 for unknown pages under /en and /es. */
export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <ContentCard
      main={(
        <div className="docs-article">
          <h1 className="docs-title">{t('docs.not_found_title')}</h1>
          <p className="docs-desc">{t('docs.not_found_body')}</p>
          <p><Link to="/docs" className="cc-seemore">{t('docs.not_found_cta')}</Link></p>
        </div>
      )}
    />
  );
}
