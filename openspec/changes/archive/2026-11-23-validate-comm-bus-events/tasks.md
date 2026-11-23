# Tasks

## 1. Validation module

- [x] 1.1 Create `code/components/room-components/hooks/use-tasks-events.validate.ts` with `parseBusFrame`, `resolveMessageRoomId`, `validateStateEvent`, `validateHeartbeat`; verify it compiles (`npx tsc --noEmit`).
- [x] 1.2 Add `use-tasks-events.validate.test.ts` covering invalid JSON, non-object, missing/non-string `type`, foreign room, missing room id, conflicting room ids, `pageDeleted` via `goToPage.roomId`, missing payload identifiers, valid events and heartbeats; verify `npx vitest run` passes for that file.

## 2. Room bus handler

- [x] 2.1 Use `parseBusFrame` in `ws.onmessage` of `use-tasks-events.tsx` and return early on failure; verify with a handler-level test that an invalid frame does not throw or emit.
- [x] 2.2 Gate `roomUpdated`, `roomDeleted`, `pageCreated`, `pageUpdated`, `pageThumbnailUpdated`, `pageDeleted` emits on `validateStateEvent`; verify tests that foreign-room and malformed events are not emitted and valid ones are.
- [x] 2.3 Validate heartbeats with `validateHeartbeat`, only track the current room, and prune non-current page maps in the existing interval; verify tests that foreign heartbeats create no entries and do not change the elected leader.
- [x] 2.4 Confirm negotiate/join use the room id (`getCommBusNegotiate`, `postCommBusJoin` calls) and add a short note in the PR or docs for the backend issue; verify by reading the call sites and test or comment.

## 3. Global bus handler

- [x] 3.1 Use `parseBusFrame` and shape validation in `use-global-events.tsx` before emitting `pageCreated`, `pageDeleted`, `roomUpdated`, `roomThumbnailUpdated`, `roomDeleted`; verify tests with malformed global frames (no throw, no emit) and valid ones (emit).

## 4. Final checks

- [x] 4.1 Run `npx vitest run`, lint and typecheck; verify all pass and existing export/presentation/comment handling is unchanged.
