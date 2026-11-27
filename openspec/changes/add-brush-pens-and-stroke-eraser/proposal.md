# Proposal

## Why

The Weave SDK is adding drawing pens (`brushTool.setInstrument`, weavejs#1312) and a stroke eraser that cuts strokes into pieces (`WeaveStrokeEraserToolAction`, weavejs#1313). The showcase is where testers try them on real devices before release, so the room UI must expose both (issue #237). The SDK work is not released yet (planned 5.11.0), so this change is developed against a local SDK checkout and merges once the release is available.

## What Changes

- Register the stroke eraser action in the room and in the standalone use case, with a name that does not clash with `eraserTool` or `maskEraserTool`.
- Make the stroke eraser reachable from the pen bar (not from the main toolbar, which stays as it is) and from a keyboard shortcut chosen after auditing every key binding.
- Add a floating pen bar, shown while the brush or the stroke eraser is active, in the style of the Drawesome toolbar but square like the app's other toolbars: a tray of seven upright pen drawings whose tips and bands show the ink colour, the stroke eraser, and a size dot and colour button that open their own panels (colour chips; size and opacity sliders). The bar sits 8px above the footer, can be minimised to a square tile, and each pen remembers its size, opacity and colour. The brush sidebar offers the same pens, chips and sliders. It replaces the separate pen dropdown and eraser size panel.
- Treat the stroke eraser as a zoom-safe tool and give it a display name, like the existing erasers.
- Ship all of it behind a build flag, off by default, in the style of `VITE_BRUSH_LAB`.
- Add vitest coverage (unique action names, toolbar button, shortcut, tool props, SDK descriptor check for the new Brush Lab fields) and Playwright render-level smoke tests on the standalone use case (backend mocked). Scenarios that need drawing on the canvas stay as manual checks in the testers guide.
- Extend `docs/brush-lab-testers-guide.md` with the pens, the stroke eraser and a device and scenario matrix.
- Local development points the frontend at the SDK sources through the existing `DEV_WEAVEJS_REPO_PATH` setting. Nothing in `package.json` changes until 5.11.0 is released, then all `@inditextech/weave-*` packages are bumped.
- Nothing existing changes: the Erase button, its `D` shortcut and `eraserTool` behave as before, and rooms opened by clients without the new SDK still render strokes (round fallback).

## Capabilities

### New Capabilities
- `brush-pens`: the pen bar and its sidebar twin: choosing a drawing pen, size, opacity and colour for the brush tool, minimising the bar, and switching to the stroke eraser, from the room UI.
- `stroke-eraser`: erasing part of a stroke from the room UI, including its toolbar entry, shortcut, size control (in the pen bar) and flag gating.

### Modified Capabilities

## Impact

- Code: `components/utils/weave/actions.ts`, `components/use-cases/standalone/weave.ts`, `hooks/use-keyboard-handler.tsx`, `overlay/hooks/use-node-action-name.tsx`, `node-properties/stroke-properties.tsx`, a new pen bar component, `lib/brush-lab/*`.
- Dependencies: requires the SDK release containing weavejs#1312 and #1313. Until then the feature works only with `DEV_WEAVEJS_REPO_PATH` set; the build, `tsc` and CI run against the pinned SDK with the feature absent, through a compatibility module.
- Tooling: introduces Playwright configuration and a mocked-backend fixture (the dependency is already declared; no config or tests exist). The standalone page is not backend-free: it needs a session, room info, an images list and image data, so the suite mocks them.
- Docs: `docs/brush-lab-testers-guide.md`, `.env.example` for the flag.
