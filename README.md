# SafeCircle Docs

Documentation for [SafeCircle](https://safecircle.tech): the parent dashboard, the Android child and parent apps, the private beta and the developer API. Built with Next.js 16 and [Fumadocs](https://fumadocs.dev), in English and Spanish. The UI is ported from the dashboard (`../sc-dashboard`, the "bleh" design system).

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `bun run build` | Production build |
| `bun run types:check` | Generate Fumadocs / Next types, then `tsc --noEmit` |
| `bun run lint` | ESLint |
| `bun run test` | Vitest (settings store, prepaint script) |

> This is not the Next.js you know. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).

## Content

All pages live in `content/docs/`, in two languages side by side:

| File | Purpose |
| --- | --- |
| `page.mdx` | English page |
| `page.es.mdx` | Spanish page |
| `meta.json` / `meta.es.json` | Section title, icon and page order |

Top-level folders with `"root": true` become the tab row.

| Section | Covers |
| --- | --- |
| `platform/` | Dashboard, Android, iOS, parent app, Canopy OS, private beta |
| `developers/` | API and integration docs |
| `ai/` | On-device models and AI features |
| `support/` | FAQ, known limitations, troubleshooting |

### Writing a page

1. Add `page.mdx` and `page.es.mdx` with `title`, `icon` and `description` frontmatter.
2. Add the slug to the folder's `meta.json` and `meta.es.json`.
3. Use the built-in MDX components: `Callout`, `Steps`/`Step`, `Tabs`/`Tab`, `Accordions`.
4. Link with the language prefix (`/en/docs/...`, `/es/docs/...`) and keep both languages in sync.
5. If you rename a heading, update inbound `#anchor` links (`grep -r "#old-anchor" content`).

## Code layout

| Path | What it is |
| --- | --- |
| `app/[lang]/layout.tsx` | Fonts, prepaint script, i18n provider and `DocsShell` |
| `app/[lang]/docs/[[...slug]]/page.tsx` | Article plus side column (page tree, table of contents, page actions) |
| `app/[lang]/settings/` | Appearance settings (themes, colours, fonts, seasonal, accessibility) |
| `components/shell/` | Masthead, hero, tab row, mobile bar, footer, search |
| `components/docs-sidebar/`, `components/toc/` | Sidebar page tree and table of contents |
| `components/shell/card`, `components/ui`, `components/settings`, `components/seasonal` | Ported from sc-dashboard |
| `layouts/` | Docs layout variants |
| `styles/` | Design tokens, themes, glass, motion, seasonal and `docs.css` (article, side column, Fumadocs token mapping) |
| `lib/settings/` | Settings store (`sc_settings` in localStorage) |
| `lib/prepaint.ts` | Inline script that themes the first frame; `lib/prepaint.test.ts` keeps it in sync with the store |
| `lib/router.tsx` | `Link` / `NavLink` / `useNavigate` shims over Next so ported components keep their react-router imports |
| `i18n/` | UI strings for the ported components (react-i18next), one JSON per namespace |

## Notes

- TypeScript is on 6.x and ESLint on 9.x: `typescript-eslint` does not support TypeScript 7 yet, and `eslint-config-next` does not support ESLint 10.
- Seasonal effects follow the calendar (Halloween, winter, ...). Turn them off in Appearance › Seasonal.
- Old URLs under `/docs/getting-started/*` and `/docs/using-safecircle/*` redirect to the new pages (`next.config.mjs`).
