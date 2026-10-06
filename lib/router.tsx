'use client';

import NextLink from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, type AnchorHTMLAttributes, type ComponentProps, type ReactNode } from 'react';
import { i18n } from './i18n';
import { cn } from './cn';

/**
 * Stand-ins for the react-router bits the ported dashboard components use. Internal paths
 * ("/settings") get the current language prefix; external and hash links pass through.
 */

const LANG_PREFIX = new RegExp(`^/(${i18n.languages.join('|')})(/|$)`);

export function withLang(to: string, lang: string): string {
  if (!to.startsWith('/') || to.startsWith('//') || LANG_PREFIX.test(to)) return to;
  return `/${lang}${to === '/' ? '' : to}`;
}

export function useLang(): string {
  const { lang } = useParams<{ lang?: string }>();
  return lang && (i18n.languages as string[]).includes(lang) ? lang : i18n.defaultLanguage;
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { to: string };

export function Link({ to, ...rest }: LinkProps) {
  const lang = useLang();
  return <NextLink href={withLang(to, lang)} {...rest} />;
}

interface NavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> {
  to: string;
  /** Match the path exactly instead of by prefix. */
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string | undefined);
  children?: ReactNode | ((state: { isActive: boolean }) => ReactNode);
}

export function isPathActive(pathname: string, href: string, end = false): boolean {
  const norm = (p: string) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
  const a = norm(pathname);
  const b = norm(href);
  return a === b || (!end && a.startsWith(`${b}/`));
}

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const lang = useLang();
  const pathname = usePathname();
  const href = withLang(to, lang);
  const isActive = isPathActive(pathname, href, end);
  const state = { isActive };
  const cls = typeof className === 'function' ? className(state) : className;
  return (
    <NextLink
      href={href}
      className={cn(cls)}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive ? '' : undefined}
      {...rest}
    >
      {typeof children === 'function' ? children(state) : children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  const lang = useLang();
  return useCallback(
    (to: string, opts?: { replace?: boolean }) => {
      const href = withLang(to, lang);
      if (opts?.replace) router.replace(href);
      else router.push(href);
    },
    [router, lang],
  );
}

export function useLocation() {
  const pathname = usePathname();
  const lang = useLang();
  // Pathname without the language prefix, like the dashboard's routes.
  const bare = pathname.replace(LANG_PREFIX, '/') || '/';
  return { pathname: bare, fullPath: pathname, lang };
}
