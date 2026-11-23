# Proposal

## Why

The frontend generates page ids client-side (`uuidv4()` or `${roomId}-${uuidv4()}`) and sends them in create-page requests. The backend is moving to server-owned page ids (companion backend issue), so the client must stop minting ids and use the one the API returns. Tracked in InditexTech/weavejs-frontend#227.

## What Changes

- Stop sending `pageId` in `POST /rooms/:roomId/pages` requests (empty-room auto-create, "+" button in grid and list, create-from-template).
- Read `pageId` from the create-page response and use it for navigation (`handleSwitchPage`), store updates (`setPagesActualPageId`) and room switching.
- Type the `postPage` response so `pageId` is checked at compile time.
- Remove now-unused `uuid` imports in the affected files.
- **BREAKING** (cross-repo): the frontend no longer sends `pageId`; it requires a backend that generates and returns it.

## Capabilities

### New Capabilities
- `page-creation`: how the client creates pages and obtains their ids from the server.

### Modified Capabilities

## Impact

- `code/api/pages/post-page.ts`
- `code/components/room-components/hooks/use-manage-room-pages.tsx`
- `code/components/room-components/hooks/use-create-page-from-template.tsx`
- `code/components/room-components/pages-library/pages.grid.tsx`
- `code/components/room-components/pages-library/pages.list.tsx`
- Not affected: `post-add-template-to-room` / `post-add-image-template-to-room` (they target an existing page), realtime `pageCreated` handlers (already server-sourced), room id generation in `post-room.ts`.
- Release ordering with the backend is handled outside this change.
