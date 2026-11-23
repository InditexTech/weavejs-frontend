## Context

See proposal.md - Why. Today both `ws.onmessage` handlers (`code/components/room-components/hooks/use-tasks-events.tsx`, `use-global-events.tsx`) do `JSON.parse` and emit with no checks. Room bus frames are Azure `json.webpubsub.azure.v1` messages, so the app message is `payload.data`; global bus frames are read as the message directly. Backend broadcasts include top-level `roomId` for room-scoped events; `pageDeleted` payload has only `pageId` and `goToPage` (a page object with `roomId`). Heartbeats carry `roomId`, `pageId`, `clientId` and no `userId`. Listeners: `use-handle-room-events.tsx`, `use-handle-page-thumbnail-change.tsx`, `use-handle-global-events.tsx`.

## Goals / Non-Goals

**Goals:**
- Pure, unit-testable validators decoupled from React and websocket.
- Handlers drop bad input silently, never throw.

**Non-Goals:**
- Verifying sender identity (`userId`) on state events or heartbeats: the client cannot verify it and the backend does not send it. Needs backend/Azure upstream work.
- Changing export/presentation handlers (already check `clientId` + `userId`).
- Backend protocol changes.

## Decisions

- **New module `use-tasks-events.validate.ts`** next to the hook, exporting `parseBusFrame(raw)`, `resolveMessageRoomId(message)`, `validateStateEvent(type, message, currentRoom)` and `validateHeartbeat(message, currentRoom)`. Pure functions, returning a validated value or `null`. Alternative: inline checks in the handlers; rejected as hard to test and duplicated for the global bus.
- **Room id resolution order**: `message.roomId` -> `payload.roomId` -> `payload.goToPage.roomId`. If more than one is present and they disagree, drop. Covers `pageDeleted` without backend changes.
- **Hand-written type guards instead of a schema library** (e.g. zod): payloads are tiny and it avoids a new dependency. Revisit if more event types are added.
- **Heartbeat presence**: key by the current room's pages only; ignore heartbeats for other rooms, and prune stale entries for non-current pages in the existing 3s interval so the ref cannot accumulate keys.
- **Global bus**: reuse `parseBusFrame` and a shape-only payload validator (no room match). The shared pieces live in the same validate module or a small sibling imported by both hooks.
- **Dropped frames are silent** (optionally `console.debug`) to avoid log flooding from hostile senders.

## Risks / Trade-offs

- [A legitimate event lacks a room id and is now dropped] -> Verified against backend controllers: all room-scoped broadcasts include top-level `roomId`; tests cover each real shape.
- [Same-room spoofing still possible] -> Documented non-goal; follow-up with backend sender identity.
- [Strict payload checks reject future payload additions] -> Guards check only required identifiers, extra fields are allowed.

## Migration Plan

Client-only change, no data migration. Rollback is a plain revert.
