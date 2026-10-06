import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { LayoutDashboardIcon } from 'lucide-react';
import { appName, gitConfig } from './shared';
import { SafeCircleLogo } from '@/components/logo';

export { translations } from './i18n';

export function baseOptions(locale?: string): BaseLayoutProps {
  const lang = locale ?? 'en';
  const dashboard = { en: 'Dashboard', es: 'Panel' } as const;
  const t = dashboard[lang as keyof typeof dashboard] ?? dashboard.en;

  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <SafeCircleLogo className="size-5 text-fd-primary shrink-0" />
          <span className="font-semibold">{appName}</span>
        </div>
      ),
    },
    links: [
      {
        type: 'icon',
        label: t,
        icon: <LayoutDashboardIcon />,
        text: t,
        url: 'https://app.safecircle.tech',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
