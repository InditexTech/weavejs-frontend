<!--
SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

SPDX-License-Identifier: Apache-2.0
-->

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Coming soon mode

Set `VITE_COMING_SOON=true` (build-time) to show the "Coming soon" page on every route. The requested URL is kept (no redirect), so deep links like `/rooms/abc` render the page in place.

- Allowlisted (served normally): `/v1/*` (health probes), `/weavebff/*`, `/coming-soon`, and static assets (`/fonts`, `/assets`, `/favicon.ico`).
- Blocked routes respond `200` with `X-Robots-Tag: noindex, nofollow`, `Cache-Control: no-store` and a `robots` meta tag.
- No third-party requests (fonts and background image are self-hosted).
- Set to `false` (default) to restore normal routing.

### Preview bypass

Set a runtime secret `COMING_SOON_BYPASS_KEY` (plain env var, **not** `VITE_`, so it never reaches the bundle). Open any URL with `?preview=<key>`:

- The key is checked server-side (`POST /v1/preview`, constant-time compare) and exchanged for an HMAC-signed token (8h expiry).
- The token is stored in `sessionStorage` (per tab, cleared on tab close) and `?preview` is stripped from the URL.
- Unset secret = bypass disabled. This only hides the UI: `/weavebff/*` stays reachable.
