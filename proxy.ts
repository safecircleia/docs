import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { docsContentRoute, docsRoute } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

// Markdown URLs carry the language as their first segment (/llms.mdx/docs/es/...), one rewriter pair per language.
const REWRITERS = Object.fromEntries(
  i18n.languages.map((lang) => [
    lang,
    {
      docs: rewritePath(`${docsRoute}{/*path}`, `${docsContentRoute}/${lang}{/*path}/content.md`).rewrite,
      suffix: rewritePath(`${docsRoute}{/*path}.md`, `${docsContentRoute}/${lang}{/*path}/content.md`).rewrite,
    },
  ]),
);
const LOCALE_PREFIX = new RegExp(`^/(${i18n.languages.join('|')})(/|$)`);

const i18nMiddleware = createI18nMiddleware({ languages: i18n.languages, defaultLanguage: i18n.defaultLanguage });

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Fumadocs markdown negotiation (strip locale prefix for path matching)
  const lang = LOCALE_PREFIX.exec(pathname)?.[1] ?? i18n.defaultLanguage;
  const withoutLocale = pathname.replace(LOCALE_PREFIX, '/');
  const { docs: rewriteDocs, suffix: rewriteSuffix } = REWRITERS[lang];

  const suffixResult = rewriteSuffix(withoutLocale);
  if (suffixResult) {
    return NextResponse.rewrite(new URL(suffixResult, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const docsResult = rewriteDocs(withoutLocale);
    if (docsResult) {
      return NextResponse.rewrite(new URL(docsResult, request.nextUrl));
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  // Static assets (public/) are served as-is; .md paths still go through for markdown negotiation.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|og|llms|.*\\.(?:svg|png|jpe?g|gif|webp|ico|mp4|css|js|json|txt|xml|woff2?)$).*)'],
};
