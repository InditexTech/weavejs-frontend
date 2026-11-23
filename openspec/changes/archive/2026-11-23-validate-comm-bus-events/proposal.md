# Proposal

## Why

`ws.onmessage` in `use-tasks-events.tsx` and `use-global-events.tsx` parses frames with an unguarded `JSON.parse` and emits state-changing events (`roomUpdated`, `roomDeleted`, `pageCreated`, `pageUpdated`, `pageThumbnailUpdated`, `pageDeleted`) straight to listeners. Any member of a room's bus group can send arbitrary data (the negotiated token grants `sendToGroup`), so a foreign or malformed event can navigate users, trigger refetches, poison heartbeat-based leader election, or throw inside the handler. The backend now guards the bus routes with membership checks (`busMember`); the client needs matching defensive validation (GitHub issue #228).

## What Changes

- Add a pure validation module for comm-bus messages: safe frame parsing, message shape checks, and "belongs to current room" checks.
- Room bus (`use-tasks-events.tsx`): drop frames that fail to parse or lack a string `type`; for state-changing events require the resolved room id (`message.roomId`, `payload.roomId`, or `payload.goToPage.roomId` for `pageDeleted`) to equal the current room; validate payload shape before emitting.
- Heartbeat: require string `roomId`, `pageId`, `clientId`, require `roomId` to equal the current room, only track members for the current room, and prune/cap the member map so forged keys cannot accumulate.
- Global bus (`use-global-events.tsx`): safe parse and payload shape validation (no room matching, it is cross-room by design).
- Unit tests for the validators and handlers with foreign and malformed events.
- Confirm and document: the client sends the **room id** (or `weavejsGlobal`) on `/rooms/:id/bus/:userId`, never a page id; share with the backend issue.
- Out of scope: `userId`/sender spoofing protection (needs backend/Azure upstream support), backend protocol changes, export/presentation handlers (already check `clientId` + `userId`).

## Capabilities

### New Capabilities
- `comm-bus-event-validation`: rules for accepting, dropping and emitting realtime comm-bus events on the room and global buses.

### Modified Capabilities

## Impact

- `code/components/room-components/hooks/use-tasks-events.tsx`
- `code/components/room-components/hooks/use-global-events.tsx`
- New validation module and tests next to them (vitest, jsdom already configured).
- No API or dependency changes. Behavior change: events for other rooms or malformed frames are silently ignored.
