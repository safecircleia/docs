'use client';

'use client';

import { createInstance } from 'i18next';
import { useMemo, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { en, es } from '@/i18n/resources';

const RESOURCES = { en: { translation: en }, es: { translation: es } };

/** UI strings for the ported dashboard components (react-i18next); page content uses Fumadocs i18n. */
export function I18nProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const instance = useMemo(() => {
    const i = createInstance();
    void i.use(initReactI18next).init({
      resources: RESOURCES,
      lng: lang,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      initAsync: false,
    });
    return i;
  }, [lang]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
