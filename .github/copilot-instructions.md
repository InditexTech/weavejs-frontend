# Copilot Instructions — Weave.js Frontend Showcase

## Repository Overview

This is the **Weave.js Frontend Showcase**, a demo application for [Weave.js](https://github.com/InditexTech/weavejs) — a collaborative canvas framework backed by Konva.js and Yjs. All application code lives in the `/code` subdirectory. The README mentions Next.js, but the actual framework is **TanStack Start** (React + TanStack Router + Vite + Nitro).

## Commands

All commands are run from the `/code` directory:

```bash
npm install          # install dependencies
npm run dev          # start dev server on https://localhost:3000
npm run build        # production build + TypeScript check (vite build + tsc --noEmit)
npm run lint         # ESLint
npm run format       # Prettier (formats api, app, assets, components, lib, store)
```

Vitest is configured (`vitest.config.mts`) but no tests exist yet. The test environment is jsdom.

## Architecture

### Framework & Routing

- **TanStack Start** (Vite + Nitro) with **TanStack Router** file-based routing
- Routes live in `src/routes/` — `__root.tsx` is the layout root
- API route handlers are in `src/routes/api/`
- The Nitro server proxies all `/weavebff/**` requests to `VITE_BACKEND_ENDPOINT` (the Weave.js backend)

### Weave.js Integration

The core of the app is `<WeaveProvider>` rendered in `components/room/room.tsx`. It receives:
- **renderer**: Konva-based renderer (from `useGetRendererKonvaBase`)
- **store**: Azure Web PubSub store for real-time collaboration (from `useGetAzureWebPubSubProvider`)
- **nodes/plugins/actions**: registered from `components/utils/weave/{nodes,plugins,actions}.ts`

Custom extensions of the Weave.js SDK go in:
- `components/nodes/` — custom canvas node types (e.g. PantoneNode, ColorTokenNode)
- `components/plugins/` — custom canvas plugins
- `components/actions/` — custom canvas tools/actions

### State Management

Two separate state layers:
1. **Zustand** (`useCollaborationRoom` from `@/store/store`) — all UI/room state (sidebar visibility, selected tools, pages, configuration, etc.)
2. **TanStack Query** — server state (rooms list, templates, images, threads, etc.)
3. **`useWeave`** from `@inditextech/weave-react` — Weave.js instance state (canvas status, loaded room, etc.)

### Canvas Room Lifecycle

A "room" is a multi-page collaborative canvas workspace. The room route (`src/routes/rooms/$roomId.tsx`) is wrapped in `<NoSsr>` and `<ClientOnly>` because Weave.js is browser-only. Room initialization flow: load params → fetch connection URL → connect Azure Web PubSub → load room data → render `<WeaveProvider>`.

### Authentication & Session

- Auth uses `better-auth` (`lib/auth.client.ts`)
- Session is accessed via `useGetSession` hook
- The sign-in overlay (`components/sign-overlay/`) is rendered over rooms that require auth

### API Layer

Thin fetch-wrapper functions in `/code/api/` — one file per endpoint, following `{method}-{resource}.ts` naming (e.g. `get-rooms.ts`, `post-image.ts`, `del-template.ts`).

### AI Features

- AI chat panel (`components/room-components/ai-components/chatbot.*.tsx`)
- Vercel AI SDK (`ai`, `@ai-sdk/react`) with Google Gemini and OpenRouter providers
- Server-side AI route handlers in `src/routes/api/ai/`

## Key Conventions

### Path Aliases

`@/*` maps to the `/code` root (e.g. `@/store/store`, `@/lib/utils`, `@/components/room/room`).

### SPDX License Headers

Every source file must begin with:
```ts
// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0
```

### Styling

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- shadcn/ui component library (`components/ui/`) using Radix UI primitives
- Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional class names

### Commits

Conventional commits enforced by commitlint (`@commitlint/config-conventional`). Husky runs lint on pre-commit and build on pre-push.

### Environment Variables

Env vars are prefixed with `VITE_` (not `NEXT_PUBLIC_`). Copy `.env.example` to `.env` in `/code`:

```
VITE_APP_HOST=https://localhost:3000
VITE_API_ENDPOINT_HUB_NAME=weavejs
VITE_API_ENDPOINT=/weavebff/api/v1
VITE_BACKEND_ENDPOINT=http://localhost:8081
```

Set `DEV_WEAVEJS_REPO_PATH` to a local Weave.js monorepo path to use local SDK sources instead of npm packages (handled in `vite.config.ts` aliases).

### Dependency Overrides

`package.json` overrides pin specific versions of `konva`, `react`, `react-dom`, `yjs`, and `@tanstack/start-plugin-core`. Do not change these without understanding the compatibility constraints with the Weave.js SDK.
