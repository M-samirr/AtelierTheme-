# Anaqa

An editorial [Salla](https://salla.sa) storefront theme for fashion and beauty stores, built on
`@salla.sa/twilight-theme-engine` (TanStack Start, server-rendered in workerd on Salla's
infrastructure).

## Requirements

- Node.js 22.22.2 or later (`.node-version` pins 22.23.4; `fnm use` or `nvm use` picks it up)
- pnpm 10 (`corepack enable pnpm` or `npm i -g pnpm@10`)
- The Salla CLI for the live editor and publishing: `npm i -g @salla.sa/cli`

## Develop

```bash
pnpm install
pnpm dev            # or: salla theme dev   (writes .env with the store to render against)
```

Open `http://localhost:5173/ar` or `/en`, never `/`. `salla theme dev --editor` adds the local
theme editor for settings and home blocks.

## Verify

```bash
pnpm check          # manifest (strict), lint, typecheck, tests, size cap
pnpm build          # production build; also writes dist/stats.html (bundle report)
```

`pnpm typecheck` needs `app/routeTree.gen.ts`, which `pnpm build` or `pnpm dev` generates.

## Layout

```text
app/router.tsx              createRouter(), registerHomeComponents(), registerThemeHooks()
app/routes.ts               manifest of theme-owned or overriding routes
app/routes/__root.tsx       the page shell (html, head, provider, layout)
app/routes/*                engine route stubs (// @auto-generated, regenerated on build)
app/components/layout/      ThemeLayout, Header, DesktopNav, MobileNav, BottomBar, Footer
app/components/home/        12 theme blocks and Salla's built-in blocks redrawn (index.tsx registers them)
app/components/product/     ProductCard (product:card), ProductListPage (product:list-page), ProductPage and its parts
app/components/common/      Rail (scroll-snap row), ProductShelf (one request per list)
app/components/ui/          primitives: Button, Container, SectionHeading, EmptyState, ErrorState
app/hooks/                  React hooks + hook-slot registrations (index.tsx)
app/lib/                    helpers: settings readers, class joiner, route ids
app/styles/                 tokens (01-settings) → generic → elements → components → utilities
app/styles/04-components/   _engine-pages, _cart, _content-pages, _account style the engine's own markup
locales/{ar,en}.json        theme strings (flat dotted keys)
twilight.json               merchant settings, home blocks, features
FORKS.md                    engine components copied into the theme
docs/ (repo root ../docs)   phase reports and platform research
```

## Conventions

- Arabic and RTL first: logical properties only (`ms-*`, `ps-*`, `text-start`), icons that point
  somewhere get `at-flip-ltr` / `at-flip-rtl`.
- Every visible string goes through `useTranslation` and both locale files.
- Every colour, size, radius, shadow and duration is a token in `01-settings/_tokens.scss`.
- Settings are read through `useThemeSettings` and `app/lib/settings.ts`; block fields through
  `app/lib/blockData.ts`, never from the raw object.
- `pnpm dev` loads `twilight.preview.json` (gitignored) if present: it holds sample blocks for the
  local editor. Delete it to see the store's own home page.
- Import the engine from the narrowest subpath; never from `dist/`.
- No `dangerouslySetInnerHTML`, no `window.location`, no DOM queries (lint enforces).
