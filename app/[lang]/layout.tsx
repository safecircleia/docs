import type { Metadata } from 'next';
import { NextProvider } from 'fumadocs-core/framework/next';
import { notFound } from 'next/navigation';
import { I18nProvider } from '@/components/I18nProvider';
import { DocsShell } from '@/components/shell/DocsShell';
import { en, es } from '@/i18n/resources';
import { i18n } from '@/lib/i18n';
import { buildSections } from '@/lib/nav';
import { PREPAINT_SCRIPT } from '@/lib/prepaint';
import { appName } from '@/lib/shared';
import { source } from '@/lib/source';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Instrument+Serif:ital@0;1&family=Inconsolata:wght@200..900&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap';

export const metadata: Metadata = {
  title: { default: `${appName} Docs`, template: `%s · ${appName} Docs` },
  icons: { icon: '/favicon.svg' },
};

export function generateStaticParams() {
  return i18n.languages.map(lang => ({ lang }));
}

export default async function LangLayout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!(i18n.languages as string[]).includes(lang)) notFound();

  const ui = lang === 'es' ? es.docs : en.docs;
  const sections = buildSections(source.getPageTree(lang), ui.overview, ui.home_body);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body>
        <NextProvider>
          <I18nProvider lang={lang}>
            <DocsShell sections={sections}>{children}</DocsShell>
          </I18nProvider>
        </NextProvider>
      </body>
    </html>
  );
}
