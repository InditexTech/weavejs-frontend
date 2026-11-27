# Design

## Context

Root document is `code/src/routes/__root.tsx` (TanStack Start, SSR, React 18.2, `hydrateRoot(document, ...)`). `RootLayout` renders `<head>` with `<HeadContent />`, which emits meta, links and then router scripts. Router `head().scripts` therefore cannot be first, and the router's `Script` component re-appends missing `src` scripts via an effect.

`code-deploy.yml` builds one image per GitHub Environment (`azure-develop`, `azure-pro`), writing `vars.*` into `.env.production` before `vite build`. `VITE_*` values are inlined into both SSR and client bundles. Existing precedent: `code/lib/coming-soon.ts` reads `import.meta.env.VITE_COMING_SOON`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Correct tenant per environment with no runtime environment detection.
- Scripts first in `<head>`, identical on server and first client render.

**Non-Goals:**
- Cookie settings button, storage gating, banner UX.

## Decisions

**1. `VITE_APP_ENV` (`dev` | `pro`) from GitHub Environment vars; IDs in code.**
A new `code/lib/onetrust.ts` exports a pure function returning the ID/script URLs for an environment, using an exact-match lookup table (unknown or unset returns `undefined`). Alternatives: pass the GUID itself as a GH variable (more flexible, easier to mistype, not unit-testable); derive from `VITE_APP_HOST` (couples to hostnames). The IDs are public, so hardcoding is acceptable. A new environment requires a code change.

**2. Raw JSX in `RootLayout`, before `<HeadContent />`.**
Render `<script src=OtAutoBlock>`, `<script src=otSDKStub data-domain-script charSet="UTF-8">`, and an inline `OptanonWrapper` script (`dangerouslySetInnerHTML`) as the first children of `<head>`, each with `suppressHydrationWarning`. Alternative: router `head().scripts` (rejected: emitted after meta/links and goes through the re-append effect). `RootLayout` does not remount on client navigation and React does not re-execute server-rendered scripts, so there is no double init.

**3. Workflow change.** Add `echo VITE_APP_ENV=${{ vars.VITE_APP_ENV }} >> .env.production` in the "Create .env.production file" step, following the `VITE_APP_HOST` pattern. Document in `.env.example` with an empty value.

## Risks / Trade-offs

- [OneTrust injects `#onetrust-consent-sdk` into `<body>` while the app uses `hydrateRoot(document)`; a pre-hydration injection can cause a React mismatch and client re-render] -> Spike on the dev domain; fallback is deferring banner injection until after hydration.
- [Variable not defined in a GitHub Environment -> no banner silently] -> Fail-safe by design; documented in tasks as a manual prerequisite and verified post-deploy.
- [CSP or ingress may block `cdn.cookielaw.org`] -> Verify on dev; allow-list if needed.
- [Moving the existing `<link rel="icon">` after the scripts] -> Harmless.

## Migration Plan

1. Define `VITE_APP_ENV` in `azure-develop` (`dev`) and `azure-pro` (`pro`).
2. Merge; deploy to develop; verify banner and hydration.
3. Deploy to pro. Rollback: revert, or unset the variable to disable the banner without a code change (requires rebuild).
