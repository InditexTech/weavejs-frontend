# Design

## Context

- The room registers tools in `components/utils/weave/actions.ts`; the standalone use case has its own list in `components/use-cases/standalone/weave.ts` and its own toolbar (`overlays/tools.tsx`). Both need the new tool.
- Shortcuts are single-letter `useHotkey` bindings in `use-keyboard-handler.tsx` (`D` = node eraser, `B` = brush, and `M S R E P N J L Q`). Other places may also bind keys.
- `allowedZoomActions` (keyboard handler) and `use-node-action-name.tsx` are keyed by action name strings.
- Brush Lab is already gated by `VITE_BRUSH_LAB` (`lib/brush-lab/flag.ts`), and `*.sdk.test.ts` files only run when `DEV_WEAVEJS_REPO_PATH` is set (see `vitest.config.mts`).
- `vite.config.ts` already aliases every `@inditextech/weave-*` package to a local weavejs checkout when `DEV_WEAVEJS_REPO_PATH` is set.
- The SDK features live on weavejs branches (pens merged into the #1313 branch, stroke eraser still uncommitted work) and are unreleased; the pinned SDK (5.9.0) lacks them.

## Goals / Non-Goals

**Goals:**
- One switch that turns the feature on and leaves the default build byte-for-byte equivalent in behavior.
- Develop and test locally against the SDK sources, then switch to a release with a version bump only.

**Non-Goals:**
- Changing the existing eraser, brush defaults or stored stroke data.
- Backend changes (tracked separately in weavejs-backend#193).
- Making CI green before the SDK release.

## Decisions

- **Local SDK via `DEV_WEAVEJS_REPO_PATH`.** Reuse the existing alias instead of `npm link` or tarballs: no build step, source HMR, nothing to commit. `package.json` stays pinned until 5.11.0. Alternative: tarball install; rejected as slower and it touches lockfiles.
- **Dev server must be allowed to serve the external checkout.** The existing alias alone returns 403 because the weavejs sources are outside Vite's serving allow list, so `vite.config.ts` adds `server.fs.allow` for that path, only when `DEV_WEAVEJS_REPO_PATH` is set. vitest's `@weave-sdk-src` alias only works for self-contained SDK files (such as the descriptors), so unit tests that need the real tool classes mock them instead.
- **One new flag, `VITE_PENS_AND_ERASER`**, read through a small helper like `isBrushLabEnabled`, default off, documented in `.env.example`. A separate flag from `VITE_BRUSH_LAB` lets the features ship without the lab. Alternative: reuse `VITE_BRUSH_LAB`; rejected because the lab is a testers-only panel and this UI is user-facing.
- **Flag gates imports as well as UI.** The new SDK symbols are only referenced from modules that are loaded when the flag is on, and are added to the action lists conditionally. With the flag off and the pinned 5.9.0 SDK the build must still compile. Confirmed while implementing: static imports of the new SDK exports failed `vite build` (MISSING_EXPORT) and `tsc` against the pinned 5.9.0 SDK, even with the flag off, and broke CI. They are therefore read by name in one module (`lib/pens-eraser/sdk.ts`) with local types for the brush tool, and the feature is `available` only when the flag is on and the SDK has the pens and the stroke eraser (`availability.ts`). Against 5.9.0 the app builds and type-checks and the feature is simply absent; against a newer SDK, or the local checkout, it works. The merge no longer has to wait for the SDK release.
- **Action name from the SDK constant** (`STROKE_ERASER_TOOL_ACTION_NAME`), not a string literal, so the SDK stays the source of truth. A vitest test asserts action names are unique across both lists.
- **Shortcut: `Shift+D`**, confirmed by an audit of every key binding: the room keyboard handler binds no `Shift+D` (its Shift bindings are T, I, V, C, F, O, G, E, 1-3 and the Mod combos), the app's own actions only handle Escape, Enter, Delete and Backspace, and the SDK only reads Shift as a modifier (line lock) while drawing. If the audit finds a conflict or a better free key, change it before building the button. Alternative: a free letter; the letters next to D are mostly taken.
- **No stroke-eraser button on the main toolbar.** A tool is an action started with `triggerAction`, so the button is optional. The eraser is offered in the pen bar next to the pens, which keeps the main toolbar unchanged, and also starts from its shortcut; while it is active the bar is shown, so the user can always switch back to a pen. Cost: the eraser is less discoverable until the brush is chosen.
- **One floating pen bar instead of a sidebar dropdown.** Pens, the stroke eraser, size and colour live in one bar shown while the brush or the stroke eraser is active. It replaces the sidebar pen dropdown and the separate eraser size panel. Alternative: keep the sidebar dropdown, as the issue literally words it; rejected because pens, eraser, size and colour end up in three places.
- **Look and placement follow Drawesome, in square app style.** A bar centred at the bottom of the canvas, white with the app's drop shadow and no rounding, in which a single bar morphs between panels: tools (pens, eraser, a size dot, a colour button, minimise), colour (back, chips, custom chip) and size (back, size slider, opacity slider). All panels stay mounted, only the active one is shown (`aria-hidden` and `inert` on the others) and the bar's width animates to the measured width of the active panel. Alternative: always-visible swatches and a slider; rejected because the width would not fit narrow canvases and Drawesome's model is what was asked for. Undo, redo and clear are not copied (the app has them).
- **Footer-aware placement.** The room's overlay layer covers the whole viewport and its footer is 40px tall, so the bar takes a footer height (40 in the room, 0 in standalone, whose canvas wrapper already stops at the footer) and sits that plus 8px above the bottom, the same gap the floating sidebar and the standalone toolbar keep from the header and footer. It is centred in the canvas not covered by sidebars: in the fixed room layout 500px on each side, in the floating layout 508px on the right while that sidebar is open. The AI chat prompt (bottom centre when on) is not handled and may overlap.
- **Pens model: Drawesome's.** Pens are listed in the order pencil, pen, fineliner, marker, highlighter, brush, fountain pen. Each has a default size (1, 6, 2, 18, 28, 14, 8) and the SDK's own opacity (1, highlighter 0.75); the user's size and opacity per pen are remembered. The ink is shared except the highlighter's own (yellow by default). That memory lives in a small zustand store, the live values stay in the tools.
- **Writing to the SDK, in this order**, because activating the brush resets its props and `setInstrument` resets opacity and scales tapers from the stroke width: select the pen in the store, trigger the brush if needed, set width and colour, `setInstrument`, then set opacity. A size change repeats `setInstrument` and the opacity write. A listener on `onActiveActionChange` applies the same memory whenever the brush becomes active from anywhere (toolbar, `B`).
- **Sync by events, not polling.** The SDK emits `onPropsChange` with the tool's props on every write, which the room sidebar already relies on; the bar and the sidebar section subscribe to it and read size, opacity and colour from the payload.
- **The brush sidebar shows the same pieces.** The Pen section (tray, chips, sliders) replaces the generic Brush size, Stroke colour and Opacity fields while the flag is on and the brush is active; both views use one hook and one store.
- **The chosen pen has to be easy to see.** The tray is built of 32×96 drawings in 36px slots, with the barrel faded out toward the bottom (a mask on the slot, so the fade does not move with the lift) so that the tips, caps and bands lead. The chosen pen is lifted about 18px above the rest, has a light slot behind it (white in the grey sidebar tray) and a 3px `#2e2e2e` underline, the app's active colour; an ink-coloured underline was rejected because white ink would vanish. The other pens sit low at 80% opacity, which keeps their tip colours readable; they are not dimmed until a pen has been chosen. The eraser, the sidebar tray and the minimised tile share the same components. Alternative: dimming the others strongly; rejected because it hides the ink colours on the tips.
- **Eraser shape: a two-button toggle where the colour button is.** The SDK's stroke eraser has a `shape` prop (`circle` or `square`) that can change while the tool is in use, and the tool keeps its props between activations. The pen bar shows a Circle/Square toggle in the tools panel while the eraser is active (the colour button is hidden then anyway), the size dot takes the chosen shape, and the sidebar section shows the same toggle next to the size slider. The shape is read from `onPropsChange` and written with `updatePropsAction`, like the size; no store state is needed. It resets to a circle on reload, like the size. Alternative: a third panel or a menu; rejected as more clicks for a two-state choice.
- **Custom colour** opens the app's existing colour picker in a popover from a rainbow chip, instead of a new spectrum panel. Colours are written as the 8-digit hex the brush already uses (`#rrggbbff`); opacity is the separate `opacity` prop.
- **Minimised** is a 56px square tile that stays where the bar was (bottom centre, 8px above the footer), showing the pen in hand; the choice is kept in the store for the page's life only.
- **Playwright at render level, backend mocked.** The standalone page needs an authenticated session, room info, an images list and image data (the canvas only appears after opening an image), and the app has no handle on the Weave instance. The suite therefore mocks those endpoints with `page.route` and asserts on the DOM only (button, tooltip, shortcut, pen bar and its controls). Drawing, erasing, undo, zoom ring and multi-client scenarios are manual checks in the testers guide. The dev server must run on port 3000 because the auth client uses an absolute `VITE_APP_HOST`. Alternative: expose the instance on `window` for state assertions; deferred as a possible follow-up.

## Risks / Trade-offs

- [SDK API changes during weavejs review] → Isolate SDK calls in few modules; re-verify against the 5.11.0 release before merge.
- [Local-only testing of the feature] → The feature is verified against the local SDK; CI builds against the pinned SDK with the feature absent. Re-run the whole suite with the 5.11.0 bump.
- [Build breaks on missing exports in 5.9.0] → The SDK compatibility module; both the build and `tsc` are checked against the pinned SDK.
- [Shortcut collision] → Audit first; add a vitest check over the binding list.
- [Playwright is new here, and mocks can drift from the real API] → Keep the suite small, one command, and the mocked shapes in one fixture file.

## Migration Plan

1. Develop with `DEV_WEAVEJS_REPO_PATH` pointing at the weavejs `code/packages` directory.
2. When weavejs 5.11.0 is released, bump every `@inditextech/weave-*` dependency, unset the variable, rerun vitest and Playwright.
3. Enable the flag in the showcase environments used for device testing. Rollback: unset the flag.

## Open Questions

- Do pens need a separate Brush Lab entry, or only the descriptors test? Answerable during implementation without changing specs.
