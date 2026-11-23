# Tasks

## 1. API layer

- [x] 1.1 In `code/api/pages/post-page.ts`, remove `pageId` from the params type and request body, and add a `CreatedPage` return type; verify `npx tsc --noEmit` reports errors only at the call sites still passing `pageId`

## 2. Call sites

- [x] 2.1 Update `hooks/use-manage-room-pages.tsx`: drop `uuid` import and `pageId` param, use `page.pageId` in `onSuccess`, keep `pageCreationAttemptedRef`; verify opening an empty room creates exactly one page and selects it
- [x] 2.2 Update `hooks/use-create-page-from-template.tsx`: drop `uuid` import, `pageId` param and payload field, use `page.pageId` in `onSuccess`; verify creating a page from a template switches to the new page
- [x] 2.3 Update `pages-library/pages.grid.tsx`: drop `uuid` import and `pageId`, use `page.pageId` in `onSuccess`; verify the grid "+" button creates and opens a page
- [x] 2.4 Update `pages-library/pages.list.tsx` the same way; verify the list "+" button creates and opens a page

## 3. Verification

- [x] 3.1 Run `npx tsc --noEmit` and `npm run lint` in `code/` and verify both pass; grep `uuidv4` in `components/room-components/{hooks,pages-library}` and verify no page-id usage remains
- [x] 3.2 Grep `code/` for logic that parses page ids by `roomId` prefix and verify none exists
- [ ] 3.3 Manual check against a server-generated-id backend: empty room first page, "+" in grid and list, create from template, delete page, then comments/connect/room-state calls for a new page and verify they work
