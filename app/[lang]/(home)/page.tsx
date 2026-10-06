import { RocketFilled, DashboardFilled, PhoneFilled, ShieldFilled } from '@mingcute/react/core-filled';
import { en, es } from '@/i18n/resources';
import { buildSections } from '@/lib/nav';
import { source } from '@/lib/source';
import { ContentCard, CtaStrip, Section } from '@/components/shell/card';
import { Link } from '@/lib/router';
import { sectionIcon } from '@/components/shell/sectionIcons';

const START = {
  en: [
    { icon: <RocketFilled />, title: 'Join the beta', body: 'Invite code, account and the Play Store track', to: '/docs/platform/private-beta/join', hue: 'new' as const },
    { icon: <DashboardFilled />, title: 'Set up the dashboard', body: 'Add a child and generate a pairing code', to: '/docs/platform/dashboard/setup' },
    { icon: <PhoneFilled />, title: 'Install the child app', body: 'Pair an Android device in minutes', to: '/docs/platform/android/setup' },
    { icon: <ShieldFilled />, title: 'Understand alerts', body: 'Risk levels, categories and what to do next', to: '/docs/platform/dashboard/alerts' },
  ],
  es: [
    { icon: <RocketFilled />, title: 'Únete a la beta', body: 'Código de invitación, cuenta y Play Store', to: '/docs/platform/private-beta/join', hue: 'new' as const },
    { icon: <DashboardFilled />, title: 'Configura el panel', body: 'Añade un hijo y genera un código de vinculación', to: '/docs/platform/dashboard/setup' },
    { icon: <PhoneFilled />, title: 'Instala la app infantil', body: 'Vincula un dispositivo Android en minutos', to: '/docs/platform/android/setup' },
    { icon: <ShieldFilled />, title: 'Entiende las alertas', body: 'Niveles de riesgo, categorías y qué hacer', to: '/docs/platform/dashboard/alerts' },
  ],
};

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  const ui = lang === 'es' ? es.docs : en.docs;
  const sections = buildSections(source.getPageTree(lang), ui.overview, ui.home_body).slice(1);
  const start = lang === 'es' ? START.es : START.en;

  return (
    <ContentCard
      top={<CtaStrip items={start} />}
      main={(
        <div className="docs-article">
          <Section title={ui.home_browse} display>
            <div className="docs-home-grid">
              {sections.map(s => {
                const Icon = sectionIcon(s.key);
                return (
                  <Link key={s.key} to={s.url} className="docs-home-card">
                    <Icon className="docs-home-icon" />
                    <strong>{s.title}</strong>
                    {s.description && <span>{s.description}</span>}
                  </Link>
                );
              })}
            </div>
          </Section>
        </div>
      )}
    />
  );
}
