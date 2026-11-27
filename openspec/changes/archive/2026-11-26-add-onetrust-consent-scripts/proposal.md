# Proposal

## Why

The showcase must display the OneTrust cookie consent banner. OneTrust provides a different domain script ID per environment (dev / pro), and its scripts must load first in `<head>` so `OtAutoBlock.js` can block third-party scripts before consent. Tracked in InditexTech/weavejs-frontend#233.

## What Changes

- Add a build-time variable `VITE_APP_ENV` (`dev` | `pro`), defined per GitHub Environment (`azure-develop`, `azure-pro`) and written to `.env.production` by `code-deploy.yml`.
- Add an in-code lookup that maps the environment to the OneTrust domain script ID and builds the script URLs.
- Render the OneTrust snippet (`OtAutoBlock.js`, `otSDKStub.js`, empty `OptanonWrapper`) as the first elements of `<head>` in the root route, before `<HeadContent />`.
- Render nothing when `VITE_APP_ENV` is unset or unknown (local dev, tests).
- Document `VITE_APP_ENV` in `.env.example`.
- Out of scope: Cookie settings button, storage categorization/gating, banner UX.

## Capabilities

### New Capabilities
- `consent-management`: OneTrust consent scripts loaded per environment in the root document.

### Modified Capabilities
<!-- None -->

## Impact

- `code/src/routes/__root.tsx`: script tags before `<HeadContent />`.
- New `code/lib/onetrust.ts` (+ unit test).
- `.github/workflows/code-deploy.yml`: new `.env.production` line.
- `code/.env.example`: new variable.
- GitHub Environments `azure-develop` / `azure-pro`: new variable `VITE_APP_ENV` (manual setup).
- External: loads scripts from `cdn.cookielaw.org`; any CSP must allow it.
