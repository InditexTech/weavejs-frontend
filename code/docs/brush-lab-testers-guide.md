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

## Privacy

The lab does not store, upload or download your strokes or recordings. The comparison and the metrics live only in the open page and
disappear on reload. The only thing the browser remembers (in `localStorage`) is the **configuration** (the settings), so a
reload keeps them. *Reset to legacy* clears it.
