import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SettingsPage } from '@/components/settings/page/SettingsPage';
import { en, es } from '@/i18n/resources';
import { i18n } from '@/lib/i18n';
import { TAB_ORDER } from '@/lib/settings';

export async function generateMetadata(props: PageProps<'/[lang]/settings/[[...tab]]'>): Promise<Metadata> {
  const { lang } = await props.params;
  return { title: (lang === 'es' ? es : en).docs.hero_settings_title };
}

// Only the listed tabs exist; anything else (/settings/bogus, /settings/Visual) is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap(lang => [{ lang, tab: [] as string[] }, ...TAB_ORDER.map(tab => ({ lang, tab: [tab] }))]);
}

export default async function Page(props: PageProps<'/[lang]/settings/[[...tab]]'>) {
  const { tab } = await props.params;
  // useSearchParams (deep links) needs a Suspense boundary for static prerendering.
  return <Suspense><SettingsPage tab={tab?.[0]} /></Suspense>;
}
