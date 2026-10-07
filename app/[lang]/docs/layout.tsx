import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { en, es } from '@/i18n/resources';
import { buildSections } from '@/lib/nav';
import { source } from '@/lib/source';

/**
 * Doc pages share the sidebar from here so it persists across navigation (scroll position,
 * open groups and the filter survive, and its transitions animate). Pages render the
 * article and the on-this-page column as the other two grid cells.
 */
export default async function DocsLayout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;
  const ui = lang === 'es' ? es.docs : en.docs;
  const sections = buildSections(source.getPageTree(lang), ui.overview, ui.home_body);
  return (
    <div className="dl">
      <DocsSidebar sections={sections} />
      {children}
    </div>
  );
}
