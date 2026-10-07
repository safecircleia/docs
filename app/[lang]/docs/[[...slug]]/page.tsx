import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LeftSmallFilled, RightSmallFilled, TimeFilled } from '@mingcute/react/core-filled';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import { buildSections, activeSection } from '@/lib/nav';
import { gitConfig } from '@/lib/shared';
import { getMDXComponents } from '@/components/mdx';
import { PageActions } from '@/components/docs/PageActions';
import { PagerKeys } from '@/components/docs/PagerKeys';
import { PageToc } from '@/components/docs/PageToc';
import { en, es } from '@/i18n/resources';
import { Link } from '@/lib/router';

const UI = { en: en.docs, es: es.docs } as const;
const WORDS_PER_MINUTE = 220;

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const ui = UI[lang as keyof typeof UI] ?? UI.en;
  const tree = source.getPageTree(lang);
  const sections = buildSections(tree, ui.overview, ui.home_body);
  const section = activeSection(sections, page.url);
  const { previous, next } = findNeighbour(tree, page.url);
  // Home › section › folders; Fumadocs' own root item is the tree name, not the section.
  const crumbs = [
    { name: ui.docs_badge, url: '/' },
    ...(section.key === 'overview' ? [] : [{ name: section.title, url: section.url }]),
    ...getBreadcrumbItems(page.url, tree),
  ];
  const words = (await page.data.getText('processed')).split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const MDX = page.data.body;
  const editUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;

  return (
    <>
      <article className="dl-article animate-page">
        <header className="docs-head">
          <nav className="docs-crumbs" aria-label={ui.breadcrumb}>
            {crumbs.map((c, i) => (
              <span key={i}>
                {c.url ? <Link to={c.url}>{c.name}</Link> : c.name}
                <RightSmallFilled aria-hidden="true" />
              </span>
            ))}
          </nav>
          <h1 className="docs-title">{page.data.title}</h1>
          {page.data.description && <p className="docs-desc">{page.data.description}</p>}
          <p className="docs-meta"><TimeFilled aria-hidden="true" />{ui.reading_time.replace('{{count}}', String(minutes))}</p>
        </header>

        <div className="docs-prose prose">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>

        <nav className="docs-pager" aria-label={ui.pager}>
          {previous ? (
            <Link to={previous.url} className="docs-pager-link" data-dir="prev">
              <span><LeftSmallFilled aria-hidden="true" />{ui.prev}<kbd>[</kbd></span>
              <strong>{previous.name}</strong>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={next.url} className="docs-pager-link" data-dir="next">
              <span><kbd>]</kbd>{ui.next}<RightSmallFilled aria-hidden="true" /></span>
              <strong>{next.name}</strong>
            </Link>
          ) : <span />}
        </nav>
        <PagerKeys prev={previous?.url} next={next?.url} />
      </article>

      <aside className="dl-aside">
        <div className="dl-aside-inner animate-page" style={{ '--delay': '0.08s' } as React.CSSProperties}>
          <PageToc items={page.data.toc} />
          <PageActions markdownUrl={getPageMarkdownUrl(page).url} editUrl={editUrl} />
        </div>
      </aside>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[lang]/docs/[[...slug]]'>): Promise<Metadata> {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: { images: getPageImage(page).url },
  };
}
