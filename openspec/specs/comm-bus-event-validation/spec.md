# comm-bus-event-validation Specification

## Purpose

Defines how the client validates realtime comm-bus events on the room and global buses before acting on them, so that malformed or foreign-room events are ignored.

## Requirements

### Requirement: Malformed bus frames are ignored
The client SHALL ignore any comm-bus frame whose body is not valid JSON, is not an object, or lacks a string `type`, without throwing and without emitting any event or mutating state.

#### Scenario: Invalid JSON frame
- **WHEN** a frame with non-JSON data arrives on the room or global bus
- **THEN** no event is emitted and no error propagates from the message handler

#### Scenario: Missing or non-string type
- **WHEN** a frame arrives whose message has no `type` or a non-string `type`
- **THEN** the frame is ignored

### Requirement: State-changing room events must belong to the current room
On the room bus, the client SHALL emit `roomUpdated`, `roomDeleted`, `pageCreated`, `pageUpdated`, `pageThumbnailUpdated` and `pageDeleted` only when the room id carried by the message equals the current room id. The room id is the message `roomId`, falling back to `payload.roomId`, and for `pageDeleted` to `payload.goToPage.roomId`.

#### Scenario: Event for another room
- **WHEN** a state-changing event arrives whose room id differs from the current room
- **THEN** it is not emitted to listeners

#### Scenario: Event for the current room
- **WHEN** a state-changing event arrives with a matching room id and a valid payload
- **THEN** it is emitted to listeners with its payload

#### Scenario: Missing room id
- **WHEN** a state-changing event carries no resolvable room id
- **THEN** it is ignored

### Requirement: State-changing payloads must be well-formed
The client SHALL emit a state-changing event only if its payload is an object containing the string identifiers its listeners rely on (`roomId` for room events, `roomId` and `pageId` for page events, `pageId` and `goToPage.roomId` for `pageDeleted`).

#### Scenario: Payload missing identifiers
- **WHEN** a state-changing event has a missing, non-object or wrongly typed payload field
- **THEN** it is ignored

### Requirement: Heartbeats are validated and bounded
The client SHALL process a `client.heartbeat` only if `roomId`, `pageId` and `clientId` are non-empty strings and `roomId` equals the current room. Tracked presence entries SHALL be limited to the current room and stale entries SHALL be pruned so that foreign or forged heartbeats cannot grow memory or influence leader election.

#### Scenario: Heartbeat for another room
- **WHEN** a heartbeat arrives with a different `roomId`
- **THEN** no presence entry is created and leader election is unaffected

#### Scenario: Heartbeat with invalid fields
- **WHEN** a heartbeat has a missing or non-string `pageId` or `clientId`
- **THEN** it is ignored

#### Scenario: Valid heartbeat
- **WHEN** a heartbeat for the current room arrives with valid fields
- **THEN** the sender's presence is recorded for that page

### Requirement: Global bus events are shape-validated
On the global bus, the client SHALL emit `pageCreated`, `pageDeleted`, `roomUpdated`, `roomThumbnailUpdated` and `roomDeleted` only when the message is a well-formed object with a string `type` and a payload carrying the identifiers listeners use; room matching is not applied because the global bus is cross-room.

#### Scenario: Malformed global event
- **WHEN** a global bus frame is unparseable or has an invalid payload
- **THEN** it is ignored without throwing

### Requirement: Bus identifier is a room id
The client SHALL use the room id (or the literal global bus id `weavejsGlobal`) in `/rooms/:id/bus/:userId` negotiate and join requests, and SHALL NOT use a page id.

#### Scenario: Negotiate and join on the room bus
- **WHEN** the client connects to the room bus
- **THEN** both requests use the current room id in the path
