# Tasks

## 1. Environment mapping

- [x] 1.1 Create `code/lib/onetrust.ts` with an exact-match `dev`/`pro` lookup returning the domain script ID and the `OtAutoBlock.js` / `otSDKStub.js` URLs (`undefined` for unset or unknown); verify with `code/lib/onetrust.test.ts` covering dev, pro, unset, unknown, and same ID in both URLs (`npx vitest run lib/onetrust.test.ts` passes)
- [x] 1.2 Document `VITE_APP_ENV` (empty by default, values `dev` | `pro`) in `code/.env.example`; verify the entry is present

## 2. Root document

- [x] 2.1 In `code/src/routes/__root.tsx`, render the OneTrust scripts (auto-block, SDK stub with `data-domain-script` and `charSet="UTF-8"`, inline `OptanonWrapper`) as the first children of `<head>` before `<HeadContent />`, only when the lookup returns a tenant; verify with a render test (server render of `RootLayout` or equivalent) asserting order for dev/pro and absence when unset
- [x] 2.2 Verify with `npm run build` and `npm run lint` in `code/` that the build, type check and lint pass

## 3. Deployment

- [x] 3.1 Add `echo VITE_APP_ENV=${{ vars.VITE_APP_ENV }} >> .env.production` to the "Create .env.production file" step in `.github/workflows/code-deploy.yml`; verify the workflow YAML is valid and the line follows the `VITE_APP_HOST` pattern
- [x] 3.2 Define `VITE_APP_ENV=dev` in the `azure-develop` and `VITE_APP_ENV=pro` in the `azure-pro` GitHub Environments (manual); verify via `gh variable list --env <name>`

## 4. Integration checks

- [ ] 4.1 On the dev deployment, verify with `curl` that the HTML response has the OneTrust scripts first in `<head>` on a deep link, and in the browser that the banner appears, there are no hydration errors in the console, and the scripts are not duplicated after client navigation
- [ ] 4.2 Verify there is no CSP/network block for `cdn.cookielaw.org` on dev; if the hydration spike fails, record the finding and apply the deferred-injection fallback from design.md
