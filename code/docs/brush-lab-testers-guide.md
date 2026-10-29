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

## Try a scenario

1. In the **Try** tab, pick a scenario (**A** to **F**). **A** is how the brush has always behaved. Hover a button for what it
   changes.
2. Draw with the brush tool: your usual handwriting, cursive loops, the letters **n** and **v**, a translucent colour, and the same
   at 30 %, 100 % and 200 % zoom.
3. Switch scenario and draw the same thing again. Compare.

## See what the device sends

- **Show on canvas** (Try tab): switch on `raw` (red dots, where the pen reported), `stabilized` (blue), `final` (green) and `pressure`. Raw dots
  should sit on your stroke. If they do not, say so.
- **Device** tab: pointer type, profile in use, sample rate, pressure range, tilt, frames per second and the metrics of your
  last stroke. A yellow warning means the pen reports itself as a mouse (on Windows, check that Windows Ink is on).
- **Ghosts** (Advanced → Ghosts): after drawing, switch on presets to see the same strokes redrawn through other presets.
  *Clear ghosts* removes them.

## Tune it

- **Advanced** tab (pick a section): *Profile settings* per device (mouse, touch, Apple Pencil, desktop pen). Pick a preset or move the sliders; the change
  applies to the next stroke.
- *Look settings*: how the stroke is drawn (round outline, width, tapers). *Preview on this screen* shows a look on every stroke
  here only; nobody else sees it.

## What to paste into #1254

1. Your device, browser and operating system (and driver, for a Wacom).
2. Press **Copy report** in the Try tab and paste it: it holds the configuration, the device report and the last stroke's metrics.
3. (Optional) the **Device** tab shows the same report live.
4. A short note: which scenario was best, which letters or situations still look wrong, and a screenshot or photo.

## Privacy

The lab does not store, upload or download your strokes or recordings. Ghosts and metrics live only in the open page and
disappear on reload. The only thing the browser remembers (in `localStorage`) is the **configuration** (the settings), so a
reload keeps them. *Reset to legacy* clears it.
