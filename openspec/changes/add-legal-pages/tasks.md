## 1. Dependencies and content

- [x] 1.1 Add `react-markdown` and `remark-gfm` to `code/package.json` (update lockfile)
- [x] 1.2 Create `code/content/legal/{cookies-policy,legal-notice,privacy-policy}.md` with lorem ipsum (headings, paragraphs, list, table, link)
- [x] 1.3 Add `*.md?raw` type declaration if not covered by `vite/client`
- [x] 1.4 Add `code/content/legal/**` to `REUSE.toml` and document how to update the content (README/docs)

## 2. Renderer and layout

- [x] 2.1 Create Markdown component (`react-markdown` + `remark-gfm`, no raw HTML) with Tailwind-styled element map and safe external links
- [x] 2.2 Create `LegalPage` layout: home-style sidebar + left-aligned title and Markdown

## 3. Routes

- [x] 3.1 Add routes `cookies-policy`, `legal-notice`, `privacy-policy` in `code/src/routes/` with per-page titles
- [x] 3.2 Regenerate `routeTree.gen.ts`; confirm pages need no session (check `__root.tsx`)

## 4. Sidebar and coming-soon

- [x] 4.1 Add the three `<Link>`s below DEPENDENCIES in `showcase.left-sidebar.tsx`
- [x] 4.2 Add the three paths to `ALLOWED_EXACT` in `code/lib/coming-soon.ts`

## 4b. Legal terms acceptance

- [x] 4b.1 Create shared `LEGAL_PAGES` constant and `LegalConsentCheckbox` component
- [x] 4b.2 Gate login buttons in `session.login.tsx` on the checkbox
- [x] 4b.3 Gate login buttons in `room-access-link.tsx` on the checkbox

## 4c. Room sidebar layout

- [x] 4c.1 Add layout tokens to `globals.css`
- [x] 4c.2 Use tokens in left sidebar, right sidebar and canvas (widths, offsets)
- [x] 4c.3 Right sidebar: flex header/content split; remove duplicated visibility classes
- [x] 4c.4 Left sidebar: stay mounted (`hidden`) instead of returning null
- [ ] 4c.5 Manual visual pass in a running room at 1280/1440/1920 with the AI chat open (needs backend)

## 4d. Footer and sidebar titles

- [x] 4d.1 (superseded) legal footer replaced by the home layout on legal pages
- [x] 4d.2 Shared `SectionTitle` and `BuildInfo`; LEGAL / RESOURCES titles in the home sidebar

## 5. Tests

- [x] 5.1 Vitest: renderer (formatting, raw HTML not rendered, links)
- [x] 5.2 Vitest: sidebar hrefs; allow-list (incl. trailing slash)
- [x] 5.2b Vitest: checkbox gating (buttons disabled until checked, links)
- [ ] 5.3 Playwright smoke: each path 200 + title, no redirect, sidebar link, sidebar navigation

## 6. Delivery

- [ ] 6.1 Run lint, type-check and tests; comply with Sherpa guidelines
- [ ] 6.2 Open PR as draft; hold merge until real texts are provided
