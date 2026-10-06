import { findNeighbour } from 'fumadocs-core/page-tree';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import { buildSections, activeSection } from '@/lib/nav';
import { gitConfig } from '@/lib/shared';
import { getMDXComponents } from '@/components/mdx';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { PageActions } from '@/components/docs/PageActions';
import { PageToc } from '@/components/docs/PageToc';
import { ContentCard, Section } from '@/components/shell/card';
import { en, es } from '@/i18n/resources';
import { Link } from '@/lib/router';

const UI = { en: en.docs, es: es.docs } as const;

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const { slug, lang } = await props.params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const ui = UI[lang as keyof typeof UI] ?? UI.en;
  const tree = source.getPageTree(lang);
  const section = activeSection(buildSections(tree, ui.overview, ui.home_body), page.url);
  const { previous, next } = findNeighbour(tree, page.url);
  const MDX = page.data.body;
  const editUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;

  const side = (
    <>
      <Section title={ui.navigate} subtle>
        <DocsSidebar nodes={section.children} />
      </Section>
      {page.data.toc.length > 0 && (
        <Section title={ui.toc} subtle>
          <PageToc items={page.data.toc} />
        </Section>
      )}
      <PageActions markdownUrl={getPageMarkdownUrl(page).url} editUrl={editUrl} />
    </>
  );

  const main = (
    <article className="docs-article">
      <header className="docs-head">
        <h1 className="docs-title">{page.data.title}</h1>
        {page.data.description && <p className="docs-desc">{page.data.description}</p>}
      </header>
      <div className="docs-prose prose">
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </div>
      <nav className="docs-pager" aria-label={ui.pager}>
        {previous ? <Link to={previous.url} className="docs-pager-link" data-dir="prev"><span>{ui.prev}</span><strong>{previous.name}</strong></Link> : <span />}
        {next ? <Link to={next.url} className="docs-pager-link" data-dir="next"><span>{ui.next}</span><strong>{next.name}</strong></Link> : <span />}
      </nav>
    </article>
  );

  return <ContentCard main={main} side={side} />;
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
