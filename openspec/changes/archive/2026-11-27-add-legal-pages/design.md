## Context

The app is a TanStack Start/Router app (`code/src/routes`, tracked `routeTree.gen.ts`) with Vite, Tailwind 4 (no typography plugin installed) and vitest; `@playwright/test` is a dev dependency. `code/lib/coming-soon.ts` holds an `ALLOWED_EXACT` set used by `server/middleware/coming-soon.ts`. `ComingSoonPage` is a precedent for a standalone public page with logo and per-page title. The sidebar `components/showcase/showcase.left-sidebar.tsx` is shared by home, standalone home and room access pages.

## Goals / Non-Goals

**Goals:** public, session-free legal pages; text updated by replacing Markdown files only; safe rendering.
**Non-Goals:** i18n, final legal text, OneTrust settings button.

## Decisions

- **Content loading: Vite `?raw` imports** of `code/content/legal/*.md`, bundled at build. No runtime fs, works in the Docker/Nitro build. Trade-off: text changes need a rebuild. Needs a `*.md?raw` module type if `vite/client` types do not cover it.
- **Renderer: `react-markdown` + `remark-gfm`, no `rehype-raw`**, so raw HTML is dropped. Styling through a `components` map using Tailwind classes (no `@tailwindcss/typography` dependency). External links get `target="_blank" rel="noopener noreferrer"`; relative/internal links stay in-tab.
- **Layout: one `LegalPage` component** (`title`, `markdown`) used by three thin route files; each route sets `head()` title (e.g. "Cookies Policy | Weave.js"). Routes live at root level, outside session-dependent layouts; verify `__root.tsx` does not require a session.
- **Sidebar: TanStack `<Link>`** (real anchors, same tab) for the three links, driven by a small exported constant of `{label, to}` so tests can assert hrefs.
- **Legal terms checkbox:** a shared `LegalConsentCheckbox` (existing `components/ui/checkbox`) holding no global state; each login surface owns a `useState` and disables its buttons with `disabled={!accepted}`. The label text is the English translation of the provided Spanish copy; "Terms and Conditions" maps to `/legal-notice` (assumption: the Legal Notice page holds the terms) and "Privacy Policy" to `/privacy-policy`. `LEGAL_PAGES` (`{label, to}`) is still shared by the sidebar. Links open in a new tab so the login screen and room access payload are kept. Not persisted; checked again on each visit. Guard in the click handlers too, not just `disabled`.
- **Coming-soon: add the three paths to `ALLOWED_EXACT`**; existing trailing-slash normalisation applies.
- **REUSE:** add `code/content/legal/**` to `REUSE.toml` annotations (Markdown rendered as text cannot carry an SPDX header).
- **Tests:** vitest for renderer (formatting, no raw HTML, links), sidebar link config, allow-list; Playwright smoke tests for 200 + title, no redirect, sidebar link.

## Risks / Trade-offs

- Placeholder text could ship publicly -> keep PR draft / hold merge until real content exists.
- Rebuild needed to change text -> accepted; matches "replace three files".
- New dependencies (`react-markdown`, `remark-gfm`) -> well-maintained, no raw HTML path enabled.
- Playwright has no config in `code/` yet -> may need a minimal config/script for the smoke tests.

## Room sidebar layout

- **Tokens:** CSS variables on `:root` in `globals.css`: `--room-left-w` (360px), `--room-right-w` (420px), `--room-footer-h` (40px), `--room-toolbar-h` (54px), `--room-float-top` (62px), `--room-float-gap` (8px). Left, right and canvas all read the same variables, so a width is changed in one place. Values are a proposal and can be tuned without touching components.
- **Sizing without calc on parents:** fixed sidebars use `top-0 bottom-[var(--room-footer-h)]` instead of `h-[calc(100%-40px)]`; floating ones use `top-[var(--room-float-top)]` and `bottom-[calc(var(--room-footer-h)+var(--room-float-gap))]`. The right sidebar splits header and content with flex (`flex-1 min-h-0`) instead of `h-[calc(100%-65px)]`.
- **Hiding:** the left sidebar no longer returns `null` when hidden; it stays mounted with `hidden` so the element tree keeps its state, as the right sidebar already does with `invisible`. The duplicated visible/invisible classes on the right sidebar's inner div are removed (visibility and pointer events inherit).
- **Not done (deferred):** container-query reflow in the image/template/frame libraries and responsive behaviour below ~1024px, because they cannot be verified without rendering the room (needs backend and PubSub).
- **Risk:** panel contents were laid out for 500px; narrower sidebars need a manual visual pass in a running room.

## Legal page layout and sidebar

Legal pages reuse the home layout: `ShowcaseLeftSidebar` (hidden below `lg`) plus a scrollable content area with the title and Markdown, left-aligned (`max-w-3xl`, no auto margins). There is no BACK TO HOME link or footer: navigation is the sidebar (SHOWCASE returns home). Known trade-off: below `lg` the sidebar is hidden, so narrow screens have no in-page navigation. The sidebar does an optional session lookup (user menu); pages render without it. `SectionTitle` and `BuildInfo` are shared components; the user menu (COPY USER ID, SIGN OUT) is `showcase.user-menu.tsx`.
