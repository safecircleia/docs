# sc-docs

SafeCircle documentation: Next.js 16 + [Fumadocs](https://fumadocs.dev) for content and search, with the UI ported from the parent dashboard (`../sc-dashboard`, the "bleh" design system).

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
bun run test     # ported store / prepaint / season tests
bun run lint
```

Content is in English and Spanish: `page.mdx` is English, `page.es.mdx` is Spanish, `meta.json` / `meta.es.json` hold section titles.

## Layout

| Path | What it is |
| --- | --- |
| `content/docs/` | MDX pages. Top-level folders with `"root": true` become the tab row. |
| `app/[lang]/layout.tsx` | Fonts, the prepaint script, i18n provider and `DocsShell`. |
| `app/[lang]/docs/[[...slug]]/page.tsx` | Article + side column (page tree, table of contents, page actions). |
| `app/[lang]/settings/` | Appearance settings (themes, colours, fonts, seasonal, accessibility). |
| `components/shell/` | Masthead, hero, tab row, mobile bar, footer, search. |
| `components/shell/card`, `components/ui`, `components/settings`, `components/seasonal` | Ported from sc-dashboard. |
| `styles/` | Design tokens, themes, glass, motion, seasonal (ported) and `docs.css` (article, side column, Fumadocs token mapping). |
| `lib/settings/` | Settings store (`sc_settings` in localStorage). `lib/prepaint.ts` is the inline script that themes the first frame; `lib/prepaint.test.ts` keeps it in sync with the store. |
| `lib/router.tsx` | `Link` / `NavLink` / `useNavigate` shims over Next so ported components keep their react-router imports. |
| `i18n/` | UI strings for the ported components (react-i18next), one JSON per namespace. |

## Notes

- TypeScript is on 6.x and ESLint on 9.x: `typescript-eslint` does not support TypeScript 7 yet, and `eslint-config-next` does not support ESLint 10.
- Seasonal effects follow the calendar (Halloween, winter, ...). Turn them off in Appearance › Seasonal.
- Old URLs under `/docs/getting-started/*` and `/docs/using-safecircle/*` redirect to the new pages (`next.config.mjs`).
