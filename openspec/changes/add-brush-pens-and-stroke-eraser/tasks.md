# Tasks

## 1. Local SDK and flag

- [x] 1.1 Set `DEV_WEAVEJS_REPO_PATH` in `code/.env` to the weavejs `code/packages` checkout and verify `npm run dev` logs `REPO LOCAL: true` and `WeaveStrokeEraserToolAction` and the brush `setInstrument` resolve (type-check or import in a scratch check).
- [x] 1.2 Add the `VITE_PENS_AND_ERASER` flag helper (default off) in `lib/`, document it in `.env.example`, and add a vitest unit test for on, off and unset.
- [x] 1.3 Verify a flag-off `vite build` still compiles against the pinned 5.9.0 SDK (no `DEV_WEAVEJS_REPO_PATH`); if static imports of unreleased exports break it, record that the merge waits for the bump. (Result: it fails with MISSING_EXPORT once the new symbols are imported, so the merge waits for 5.11.0; flag-off checks run against the local SDK until then.)

## 2. Stroke eraser registration

- [x] 2.1 Register `WeaveStrokeEraserToolAction` in `components/utils/weave/actions.ts` and in `components/use-cases/standalone/weave.ts`, only when the flag is on; add a vitest test that action names are unique across both lists and differ from `eraserTool` and `maskEraserTool`.
- [x] 2.2 Add `strokeEraserTool` to `allowedZoomActions` and to `use-node-action-name.tsx` (display name); extend or add vitest tests for both.

## 3. Toolbar and shortcut

- [x] 3.1 Audit every key binding in the app (all `useHotkey` and key handlers, not only `use-keyboard-handler.tsx`) and record the chosen shortcut in `design.md` (default `Shift+D`); verify with a vitest test that the binding list has no duplicates.
- [x] 3.2 Keep the main toolbars (room and standalone) unchanged, with no stroke-eraser button, and remove the button component and its test; verify with a search that no toolbar references the stroke eraser and that eslint and vitest pass.
- [x] 3.3 Wire the shortcut in `use-keyboard-handler.tsx`; vitest test that it triggers `strokeEraserTool` and does nothing when the flag is off.

## 4. Pen bar

- [x] 4.1 (superseded by 4.7-4.12) Add the `PenBar` component, flag-gated and shown only while the brush or the stroke eraser is active, with seven pen buttons and an eraser button (tooltip `Shift+D`): pen buttons call the brush tool's `setInstrument` once (triggering the brush tool first when the eraser is active), the eraser button triggers the stroke eraser; vitest tests for the flag, visibility per tool, each pen, and both switches.
- [x] 4.2 (superseded by 4.7-4.12) Add the size and colour controls to the bar: size drives the brush width (re-applying the current pen) or, with the eraser active, the eraser size clamped in screen pixels; colour sets the brush stroke colour from a palette and a custom colour input as `#rrggbbff`; vitest tests for each write and for the pen re-apply.
- [x] 4.3 Mount the bar in the room toolbar and in the standalone toolbar, remove the sidebar pen dropdown and the separate eraser size panel, and run eslint, prettier and vitest on the touched files.
- [x] 4.5 (superseded by 4.7-4.12) Restyle the pen bar as a horizontal bar centred at the bottom of the canvas, in the Drawesome style (pens in a row with the active one raised, round colour swatches, size slider), mounted once in the room overlay and once in the standalone canvas layout instead of beside the left toolbar; update the vitest and Playwright tests and verify with a screenshot.
- [x] 4.6 (superseded by 4.7-4.12) Make the pen bar square like the other toolbars with the app's own size and colour controls, 16px above the bottom edge, draw each pen as an upright illustration with its tip in the current colour, and show the same pens in the brush sidebar through a shared hook; vitest tests for the bar, the sidebar section and the live refresh, a Playwright check of the bar's position, and a screenshot.
- [x] 4.7 Add the pens model: the pen order and defaults, the colour palette, the zustand store (panel, minimised, shared ink, highlighter ink, per-pen size and opacity) and the hook that writes to the SDK in the documented order, applies the memory when the brush is activated and syncs from `onPropsChange`; vitest tests for the write order, the memory, the highlighter's own colour and the event sync.
- [x] 4.8 Redraw the pens as upright illustrations with neutral barrels, the tip and a band in the ink, a pink eraser, and the lifted active pen; vitest test that the ink reaches the tips and bands.
- [x] 4.9 Add the morphing bar, the slider with value and finer steps at small sizes, the colour chips with the custom chip, and the minimise tile; vitest tests for panel switching, slider pointer and keyboard, chips and minimise.
- [x] 4.10 Compose the pen bar (tools, colour and size panels) with footer-aware placement and free-canvas insets, mount it with the right footer height in the room and in standalone; vitest test for the offset and insets.
- [x] 4.11 Rebuild the sidebar Pen section from the same pieces and hide the generic brush size, stroke colour and opacity fields while it is shown; vitest tests for the section and for the hidden fields.
- [x] 4.12 Rewrite the Playwright tests for the panels, the ink on the tips, size and opacity values, minimise and restore, and a 16px gap above the footer; run them and a screenshot review.
- [x] 4.4 Add a `*.sdk.test.ts` in `lib/brush-lab/` checking the new Brush Lab descriptors render one control each; verify it runs with `DEV_WEAVEJS_REPO_PATH` set and is skipped without.

- [x] 4.13 Reduce the gap to the footer to 8px, and update the unit tests, the Playwright checks for the gap and the tile, and the tester guide. (The tile sliding to the bottom right was tried and reverted: it stays centred.)

## 5. Playwright smoke tests

- [x] 5.1 Add Playwright config and an npm script that starts the dev server on port 3000 with `DEV_WEAVEJS_REPO_PATH` and `VITE_PENS_AND_ERASER=true`, plus a fixture that mocks the backend (session, room info, images list, image file, image data) and opens an image on `/use-cases/standalone/<id>`; verify one test reaches the canvas toolbar.
- [x] 5.2 Render-level smoke tests (DOM only, no drawing assertions): the main toolbar has no stroke-eraser button, the pen bar's eraser tooltip shows `Shift+D`, the pen bar appears and disappears with the brush and the stroke eraser and shows the 7 pens, the eraser, the size and the colours, the eraser button in the bar activates the stroke eraser and the bar can switch back to a pen, `Shift+D` activates the stroke eraser (the standalone use case gets only this shortcut, it has no keyboard handler); run them and verify they pass.
- [x] 5.3 Move the scenarios that need to read or draw on the canvas to the testers guide as manual checks (draw and erase across the middle, undo and redo, images and shapes untouched, ring size at 25% and 400% zoom, each pen draws a stroke, two clients erasing the same stroke); verify each is listed in task 6.1's guide.

## 6. Documentation and integration

- [x] 6.1 Update `docs/brush-lab-testers-guide.md`: pens, stroke eraser, device matrix (mouse, trackpad, iPad + Apple Pencil, Wacom), zoom levels, frames and groups, locked nodes, reload persistence, viewer on an older SDK, Shift line lock, what to report; verify every issue #237 checklist item appears.
- [x] 6.2 Run the full vitest suite and Playwright suite with the flag on, and the vitest suite with the flag off, and confirm the existing Erase and brush behavior is unchanged.
- [ ] 6.3 Release follow-up note: when weavejs 5.11.0 ships, bump all `@inditextech/weave-*` to 5.11.0, unset `DEV_WEAVEJS_REPO_PATH`, rerun 6.2; record this in the PR description.
