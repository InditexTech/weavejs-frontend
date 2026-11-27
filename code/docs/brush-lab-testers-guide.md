<!--
SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

SPDX-License-Identifier: Apache-2.0
-->

# Brush Lab: testers' guide

Use this to try the brush settings on a real pen (iPad with Apple Pencil, Wacom, mouse, trackpad) and report what you see on
[issue #1254](https://github.com/InditexTech/weavejs/issues/1254).

The Brush Lab exists only in a Showcase built with `VITE_BRUSH_LAB=true`. Rooms only; there is no standalone page.

## Before you start

1. Open the Showcase on a screen at least 1024 px wide (an iPad in **landscape** works).
2. If the Showcase shows "Coming soon", open it once with `?preview=<key>` (ask the team for the key).
3. Log in and open or create a room.
4. Open the lab one of two ways:
   - menu **Extra → Brush Lab**, or
   - add `?lab=brush` to the room address (`https://…/rooms/<id>?lab=brush`). If you also use `?preview=<key>`, put it first:
     `?preview=<key>&lab=brush`.

## Try a brush

The panel has one dropdown, **Brush**: Legacy (default), Fixes, Smooth, Round, Freehand and Illustrator-like.

1. Pick a brush and draw: your usual handwriting, cursive loops, the letters **n** and **v**, a translucent colour, and the same at
   30 %, 100 % and 200 % zoom.
2. Pick another brush and draw the same thing again. Compare.
   Or draw once and use **Compare last stroke (black) with**: choose a brush and press **Compare**. The black line is what was drawn;
   the red line is the same pointer events replayed through the chosen brush (positions only). **Clear** removes both.
3. **Show on canvas** switches on dots for what the pen reported (`raw`, red, should sit on your stroke), `stabilized`, `final`
   and `pressure`.
4. **Device** shows the pointer type, the profile in use and the sample rate. A yellow warning means the pen reports itself as a
   mouse (on Windows, check that Windows Ink is on).

## What to paste into #1254

1. Your device, browser and operating system (and driver, for a Wacom).
2. Press **Copy report** and paste it: it holds the configuration, the device report and the last stroke's metrics.
3. A short note: which scenario was best, which letters or situations still look wrong, and a screenshot or photo.

## Pens and stroke eraser

These need a Showcase built with `VITE_PENS_AND_ERASER=true` (rooms and the standalone use case). They come from SDK 5.11.0; until it is
released, run the Showcase from source against a local weavejs checkout: set `DEV_WEAVEJS_REPO_PATH` to its `code/packages` folder in
`code/.env` and use `npm run dev`. Their issues are [#1312](https://github.com/InditexTech/weavejs/issues/1312) (pens) and
[#1313](https://github.com/InditexTech/weavejs/issues/1313) (stroke eraser).

### The pen bar

Choose the **Brush** tool: a bar opens at the bottom centre of the canvas, 8 px above the footer. Its tray holds the seven pens (pencil, pen,
fineliner, marker, highlighter, brush, fountain pen) and the **stroke eraser** (the pink eraser). The tip and a band of each pen show the colour
it will draw with; the highlighter keeps its own colour (yellow at first) and the other pens share one.

The bar changes shape instead of opening menus:

- the **dot** opens **Size and opacity** (two sliders; the eraser has only a size, in screen pixels). Small sizes move in finer steps;
- the **colour wheel** opens the **colours** (pick a chip, or the rainbow chip for any colour);
- the **arrow** (or **Esc**) goes back to the tools;
- the **corner arrows** minimise the bar to a small tile showing the pen in hand. Press the tile to bring it back.

The brush panel in the right sidebar has the same pens, colours and sliders, and the two always agree.

1. Pick a pen, then draw: a line, a loop, a quick scribble and a slow one. Pencil, pen and brush thin out with speed; fineliner and
   highlighter keep a constant width; the fountain pen is thick one way and thin the other.
2. Each pen starts at its own size and opacity (the marker is thicker than the pencil, the highlighter is wide and translucent) and keeps
   what you set for it: change the pencil, pick the marker, pick the pencil again.
3. Change the size and draw again: the pen keeps its character at the new size, and the opacity you set stays.
4. Change the colour. The highlighter darkens where strokes cross.
5. Hold **Shift** while drawing with a mouse: the stroke locks to the nearest of eight directions.
6. Press the eraser, erase, then press a pen (or the Brush button in the toolbar): the brush comes back with the pen, size, opacity and colour you had.
7. Open the right sidebar: with the brush active it shows the pens, colours and sliders instead of the separate Brush size, Stroke color and
   Opacity fields. Change something there and check the bar follows.
8. In the room, check the bar sits 8 px above the footer and, with the right sidebar open, stays clear of it. With the AI chat prompt on, the
   bar can overlap it (known).

### The stroke eraser

Press the eraser in the pen bar, or **Shift+D**. Drag over a stroke: the part under the ring disappears and the rest stays as strokes.
**Erase** (the toolbar button, **D**) still removes whole nodes and must behave as before. The ring keeps its size on screen at any
zoom; set it with **Size** while the stroke eraser is active. Choose its shape with the **Circle** and **Square** buttons next to it (also in the right sidebar while the eraser is active): the size is the diameter of the circle or the side of the square, and the choice is kept when you switch to a pen and back.

Check these:

| What | Expect |
| --- | --- |
| Erase across the middle of one stroke | Two strokes remain; the first keeps its id |
| Fast drag over several strokes | No stroke is skipped |
| Press **Esc** while dragging | Nothing is erased |
| Undo, redo | One undo restores the whole gesture; one redo cuts it again |
| Drag over an image, a shape, text | They do not change |
| Drag over a locked stroke | It does not change |
| Strokes inside a frame or a group | They are erased like any other |
| Zoom to 25 % and 400 % | The ring has the same size on screen |
| Square eraser: drag across a stroke | A square area is erased, to the edge of the square; the ring is a square of the same size |
| Square eraser inside a rotated or scaled frame or group | The erased area is still a square on screen |
| Switch Circle and Square while the eraser is active | The ring changes at once and the next drag uses the new shape |
| Erase, then reload the page | The erased state is still there |
| Two browsers erase the same stroke at once | Both end up with the same strokes and no error; a short overlap of pieces is a known limit |
| A viewer on an older SDK opens the room | Pen strokes and cut pieces draw as plain round strokes |

### Devices to try

| Device | Draw with each pen | Erase | Shift line lock |
| --- | --- | --- | --- |
| Mouse | yes | yes | yes |
| Trackpad | yes | yes | yes |
| iPad + Apple Pencil | yes (pressure) | yes | not available |
| Wacom | yes (pressure) | yes | not available |

At each device also try 25 %, 100 % and 400 % zoom.

### What to report

Your device, browser and operating system, which pen or situation looked wrong, whether it also happens with **Brush Lab** off, and a
screenshot. For an erase problem add what was under the ring (stroke, frame, group, locked or not).

## Privacy

The lab does not store, upload or download your strokes or recordings. The comparison and the metrics live only in the open page and
disappear on reload. The only thing the browser remembers (in `localStorage`) is the **configuration** (the settings), so a
reload keeps them. *Reset to legacy* clears it.
