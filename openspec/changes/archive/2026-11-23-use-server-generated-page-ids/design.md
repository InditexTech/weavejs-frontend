# Design

## Context

Four mutation sites call `postPage` and each defines `pageId` as a mutation variable, then reads it back in `onSuccess(_, { pageId })`. The backend 201 response already returns the page record (`...page.dataValues` plus `index`), so `pageId` is available in the response. Create-from-template also goes through `postPage` (with `templateId` and `target`). The `add-template-to-room` endpoints take an existing page as destination and are unrelated. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- No client-side page id generation or transmission.
- A single typed source for the new id: the `postPage` response.

**Non-Goals:**
- Room id generation (`post-room.ts`) stays client-side.
- Backend changes and release ordering.
- A duplicate-page UI (none exists in the frontend today).
- Fixing the stale `useCallback(..., [])` in `createPageFromTemplate`, unless touched incidentally.

## Decisions

- **Read the id from the mutation result, not the variables.** Change `onSuccess: (_, { pageId })` to `onSuccess: (page)` and use `page.pageId`. Alternative: keep passing a local id and reconcile later; rejected, since it keeps client ids alive.
- **Type the `postPage` response** with a `CreatedPage` type (`roomId`, `pageId`, `name`, `status`, `position`, `index`). The response is untyped `any` today; typing makes any missed call site a compile error, and gives one place to adapt if the backend renames fields.
- **Remove `pageId` from `postPage` params and body** rather than making it optional, so no caller can silently keep sending one.
- **Keep `pageCreationAttemptedRef` in `useManageRoomPages`.** Previously a duplicate create hit a 409 on the same id; with server ids a double fire would create two pages, so the ref is now the only guard.
- **No optimistic UI changes.** The code creates, invalidates queries and then switches; nothing depends on a pre-known id.

## Risks / Trade-offs

- [Frontend sends no `pageId` to a backend that still requires it] → creation fails; release ordering is owned outside this change.
- [Backend renames or drops `pageId` in the response] → the typed `CreatedPage` makes the break explicit; adapt in `postPage`.
- [Double first-page creation in empty rooms] → retain the existing ref guard; verify manually.
- [Mixed id formats: legacy `${roomId}-<uuid>` vs new server ids] → grep for code parsing page ids by prefix during implementation; none found during exploration.
