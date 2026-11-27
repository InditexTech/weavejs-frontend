# Proposal

## Why

The showcase loads OneTrust cookies and processes user data, but offers no way to read the cookies, legal or privacy information. Users need public access to these texts, and authors must be able to update them by editing Markdown only (GitHub issue #239).

## What Changes

- Add three public routes: `/cookies-policy`, `/legal-notice`, `/privacy-policy`. English only, no language in the path, served in place (no redirects), each with its own page title.
- Add one Markdown file per page in `code/content/legal/` with lorem ipsum placeholder content (headings, paragraphs, lists, a table, a link).
- Add a Markdown renderer (`react-markdown` + `remark-gfm`, raw HTML not rendered) styled with Tailwind classes.
- Add a legal page layout matching the home pages: the showcase sidebar plus a left-aligned content area with the title and Markdown. No session or backend required.
- Add a 3-column footer to the legal pages (Legal links, Resources links, logo with version/build), and matching LEGAL / RESOURCES section titles in the home sidebar.
- Refine the room editor sidebar layout (additional scope, requested during implementation): replace hardcoded widths and offsets with layout tokens, narrower sidebars, canvas width derived from the same tokens, tree state kept when hidden.
- Add three same-tab links (`COOKIES POLICY`, `LEGAL NOTICE`, `PRIVACY POLICY`) in the left sidebar below DEPENDENCIES; the sidebar is shared by home, standalone home and room access pages.
- Add a required "accept legal terms" checkbox before the social login buttons (session login and room access link); the buttons are disabled until it is checked. Its label (Terms and Conditions -> Legal Notice, Privacy Policy) links to the legal pages.
- Add the three paths to the coming-soon allow-list so they stay reachable in coming-soon mode.
- Add a REUSE annotation for `code/content/legal/**` and a short note on updating the content.
- Add vitest unit tests and Playwright smoke tests.

Non-goals: redesigning the room panels' contents, container-query reflow of the libraries and responsive/mobile behaviour of the room (deferred), persisting the acceptance server-side, other languages, the final legal texts, a OneTrust cookie-settings button on the Cookies Policy page.

Risk: pages are public and would show placeholder text if deployed early. Keep the PR in draft, or hold the merge, until the real content is provided.

## Capabilities

### New Capabilities
- `room-sidebar-layout`: sizing, positioning and hiding behaviour of the room editor left and right sidebars and the canvas between them.
- `legal-pages`: public Markdown-driven legal pages, their routes, layout, sidebar links, coming-soon reachability and legal terms acceptance before login.

### Modified Capabilities

## Impact

- Code: `code/src/routes/` (3 new routes, regenerated `routeTree.gen.ts`), `code/components/showcase/showcase.left-sidebar.tsx`, `code/lib/coming-soon.ts`, `code/components/session/session.login.tsx`, `code/components/room-access-link/room-access-link.tsx`, new legal page and Markdown components, new `code/content/legal/*.md`.
- Room layout: `code/components/room/room.left-sidebar.tsx`, `room.right-layout.tsx`, `room.canvas.tsx`, `code/src/routes/globals.css` (tokens).
- Dependencies: `react-markdown`, `remark-gfm`.
- Config/docs: `REUSE.toml`, README or docs note on editing the content.
- Tests: vitest (renderer, sidebar hrefs, allow-list), Playwright smoke tests.
- Related: the in-flight `add-onetrust-consent-scripts` change is separate; no overlap in requirements.
