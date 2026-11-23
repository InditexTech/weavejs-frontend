# Spec Delta

## Purpose

Defines how the client creates pages in a room and obtains their identifiers, so that page ids are owned by the server and never minted by the client.

## ADDED Requirements

### Requirement: Client does not supply page ids
The client SHALL NOT generate a page id nor include a `pageId` field in create-page requests, for any create flow (empty-room first page, new page from the pages library, page from template).

#### Scenario: Create request omits pageId
- **WHEN** the user creates a page by any flow
- **THEN** the request to `POST /rooms/:roomId/pages` contains no `pageId` field

### Requirement: Client uses the server-returned page id
The client SHALL use the `pageId` returned in the create-page response for navigating to the new page, updating the active page state and switching the realtime room.

#### Scenario: New page from the pages library
- **WHEN** the user creates a page from the grid or list "+" button and the API responds with a `pageId`
- **THEN** the client switches to the page with that `pageId` and marks it as the active page

#### Scenario: First page of an empty room
- **WHEN** a room with no pages is opened and the client creates its first page
- **THEN** the active page id is the `pageId` returned by the API
- **AND** only one create-page request is sent

#### Scenario: Page created from a template
- **WHEN** the user creates a page from a template and the API responds with a `pageId`
- **THEN** the client switches to the page with that `pageId`

### Requirement: Existing page-id URLs keep working
Calls that identify a page (comments, connect, room state) SHALL continue to pass the page id in the existing `:roomId` path slot with an unchanged path shape.

#### Scenario: Server-generated id used in existing endpoints
- **WHEN** the client calls an existing endpoint for a page created with a server-generated id
- **THEN** it passes that id in the same path position as before
