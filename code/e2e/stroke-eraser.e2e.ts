// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const TRAY = [
  "Pencil",
  "Pen",
  "Fineliner",
  "Marker",
  "Highlighter",
  "Brush",
  "Fountain pen",
  "Stroke eraser",
];

// The toolbar buttons only have a tooltip, so they are found by their icon.
const brushButton = (page: Page) =>
  page.locator("button:has(svg.lucide-brush)").first();
const selectionButton = (page: Page) =>
  page.locator("button:has(svg.lucide-mouse-pointer)").first();
const penBar = (page: Page) => page.getByRole("toolbar", { name: "Pen bar" });
const tool = (page: Page, name: string) =>
  penBar(page).getByRole("button", { name, exact: true });
const inkOf = (page: Page, pen: string) =>
  page.locator(`svg[data-pen="${pen}"]`).first().getAttribute("data-ink");

test("reaches the canvas toolbar", async ({ canvas }) => {
  await expect(brushButton(canvas)).toBeVisible();
});

test("the main toolbar has no stroke eraser button", async ({ canvas }) => {
  await expect(canvas.locator("button:has(svg.lucide-eraser)")).toHaveCount(1);
  await expect(
    canvas.getByRole("button", { name: "Stroke eraser" }),
  ).toHaveCount(0);
});

test("the pen bar follows the brush tool", async ({ canvas }) => {
  await expect(penBar(canvas)).toBeHidden();

  await brushButton(canvas).click();
  await expect(penBar(canvas)).toBeVisible();

  await selectionButton(canvas).click();
  await expect(penBar(canvas)).toBeHidden();
});

test("the tray lists the pens in order, then the eraser, with the size and colour buttons", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  const names = await penBar(canvas)
    .getByRole("button")
    .evaluateAll((buttons) =>
      buttons.map((b) => b.getAttribute("aria-label") ?? ""),
    );
  expect(names.slice(0, TRAY.length)).toEqual(TRAY);
  await expect(
    penBar(canvas).getByRole("button", { name: "Size and opacity" }),
  ).toBeVisible();
  await expect(
    penBar(canvas).getByRole("button", { name: "Colour" }),
  ).toBeVisible();
  await expect(
    penBar(canvas).getByRole("button", { name: "Hide tools" }),
  ).toBeVisible();
});

test("the pen bar sits 8px above the footer, centred", async ({ canvas }) => {
  await brushButton(canvas).click();
  const bar = await penBar(canvas).boundingBox();
  const footer = await canvas
    .locator("div.absolute.bottom-0.h-\\[40px\\]")
    .first()
    .boundingBox();
  expect(bar).not.toBeNull();
  expect(footer).not.toBeNull();
  expect(Math.round(footer!.y - (bar!.y + bar!.height))).toBe(8);

  const viewport = canvas.viewportSize()!;
  expect(Math.abs(bar!.x + bar!.width / 2 - viewport.width / 2)).toBeLessThan(
    2,
  );
});

test("choosing a pen lifts it", async ({ canvas }) => {
  await brushButton(canvas).click();
  await tool(canvas, "Marker").click();
  await expect(tool(canvas, "Marker")).toHaveAttribute("aria-pressed", "true");
  await tool(canvas, "Pen").click();
  await expect(tool(canvas, "Marker")).toHaveAttribute("aria-pressed", "false");
});

test("the colour panel changes the ink on the tips, except the highlighter's", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  await tool(canvas, "Pen").click();
  expect(await inkOf(canvas, "pencil")).toBe("#000000");
  expect(await inkOf(canvas, "highlighter")).toBe("#fff01f");

  await penBar(canvas).getByRole("button", { name: "Colour" }).click();
  // the tools are out of reach while the colours are shown
  await expect(tool(canvas, "Marker")).toHaveCount(0);
  await penBar(canvas).getByRole("button", { name: "Color #e03131" }).click();
  await expect(
    penBar(canvas).getByRole("button", { name: "Color #e03131" }),
  ).toHaveAttribute("aria-pressed", "true");
  await penBar(canvas).getByRole("button", { name: "Back to tools" }).click();

  expect(await inkOf(canvas, "pencil")).toBe("#e03131");
  expect(await inkOf(canvas, "brush")).toBe("#e03131");
  expect(await inkOf(canvas, "highlighter")).toBe("#fff01f");

  await tool(canvas, "Highlighter").click();
  await penBar(canvas).getByRole("button", { name: "Colour" }).click();
  await penBar(canvas).getByRole("button", { name: "Color #2f9e44" }).click();
  await penBar(canvas).getByRole("button", { name: "Back to tools" }).click();
  expect(await inkOf(canvas, "highlighter")).toBe("#2f9e44");
  expect(await inkOf(canvas, "pen")).toBe("#e03131");
});

test("the size panel has size and opacity sliders that move", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  await tool(canvas, "Marker").click();
  await penBar(canvas)
    .getByRole("button", { name: "Size and opacity" })
    .click();

  const size = penBar(canvas).getByRole("slider", { name: "Size" });
  const opacity = penBar(canvas).getByRole("slider", { name: "Opacity" });
  await expect(size).toBeVisible();
  await expect(opacity).toBeVisible();
  // the marker starts at its own size
  await expect(size).toHaveAttribute("aria-valuenow", "18");

  await size.focus();
  await size.press("ArrowRight");
  await expect(size).toHaveAttribute("aria-valuenow", "19");
  await opacity.focus();
  await opacity.press("ArrowLeft");
  await expect(opacity).toHaveAttribute("aria-valuetext", "98%");

  await penBar(canvas).getByRole("button", { name: "Back to tools" }).click();
  await expect(tool(canvas, "Marker")).toBeVisible();
});

test("the brush always opens on the pens", async ({ canvas }) => {
  await brushButton(canvas).click();
  await penBar(canvas).getByRole("button", { name: "Colour" }).click();
  await expect(tool(canvas, "Marker")).toHaveCount(0);

  await selectionButton(canvas).click();
  await expect(penBar(canvas)).toBeHidden();
  await brushButton(canvas).click();
  await expect(tool(canvas, "Marker")).toBeVisible();

  await penBar(canvas)
    .getByRole("button", { name: "Size and opacity" })
    .click();
  await canvas.keyboard.press("Shift+D");
  await expect(penBar(canvas)).toBeVisible();
  await selectionButton(canvas).click();
  await brushButton(canvas).click();
  await expect(tool(canvas, "Marker")).toBeVisible();
});

test("each pen keeps its own size", async ({ canvas }) => {
  await brushButton(canvas).click();
  await tool(canvas, "Pencil").click();
  await penBar(canvas)
    .getByRole("button", { name: "Size and opacity" })
    .click();
  const size = penBar(canvas).getByRole("slider", { name: "Size" });
  await expect(size).toHaveAttribute("aria-valuenow", "1");
  await size.focus();
  await size.press("ArrowRight");
  await penBar(canvas).getByRole("button", { name: "Back to tools" }).click();

  await tool(canvas, "Marker").click();
  await tool(canvas, "Pencil").click();
  await penBar(canvas)
    .getByRole("button", { name: "Size and opacity" })
    .click();
  await expect(
    penBar(canvas).getByRole("slider", { name: "Size" }),
  ).toHaveAttribute("aria-valuenow", "2");
});

test("the bar minimises to a tile where it was and comes back", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  const open = await penBar(canvas).boundingBox();

  await penBar(canvas).getByRole("button", { name: "Hide tools" }).click();
  const restore = penBar(canvas).getByRole("button", {
    name: "Show drawing tools",
  });
  await expect(restore).toBeVisible();
  await expect
    .poll(async () => (await penBar(canvas).boundingBox())?.width)
    .toBe(56);
  await expect(tool(canvas, "Marker")).toHaveCount(0);

  // still centred, and 8px above the footer
  const viewport = canvas.viewportSize()!;
  const footer = await canvas
    .locator("div.absolute.bottom-0.h-\\[40px\\]")
    .first()
    .boundingBox();
  const tile = await restore.boundingBox();
  expect(Math.abs(tile!.x + tile!.width / 2 - viewport.width / 2)).toBeLessThan(
    2,
  );
  expect(Math.round(footer!.y - (tile!.y + tile!.height))).toBe(8);

  await restore.click();
  await expect(tool(canvas, "Marker")).toBeVisible();
  await expect
    .poll(async () => (await penBar(canvas).boundingBox())?.width)
    .toBe(open!.width);
});

test("the eraser in the bar shows only its size, and a pen brings the brush back", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  const eraser = tool(canvas, "Stroke eraser");

  await eraser.click();
  await expect(eraser).toHaveAttribute("aria-pressed", "true");
  await expect(
    penBar(canvas).getByRole("button", { name: "Colour" }),
  ).toHaveCount(0);

  await penBar(canvas)
    .getByRole("button", { name: "Size and opacity" })
    .click();
  await expect(
    penBar(canvas).getByRole("slider", { name: "Size" }),
  ).toBeVisible();
  await expect(
    penBar(canvas).getByRole("slider", { name: "Opacity" }),
  ).toHaveCount(0);
  await penBar(canvas).getByRole("button", { name: "Back to tools" }).click();

  await tool(canvas, "Pen").click();
  await expect(tool(canvas, "Pen")).toHaveAttribute("aria-pressed", "true");
  await expect(eraser).toHaveAttribute("aria-pressed", "false");
  await expect(
    penBar(canvas).getByRole("button", { name: "Colour" }),
  ).toBeVisible();
});

test("the eraser can be a circle or a square, and keeps the choice", async ({
  canvas,
}) => {
  await brushButton(canvas).click();
  await expect(
    penBar(canvas).getByRole("group", { name: "Eraser shape" }),
  ).toHaveCount(0);

  await tool(canvas, "Stroke eraser").click();
  const circle = penBar(canvas).getByRole("button", { name: "Circle eraser" });
  const square = penBar(canvas).getByRole("button", { name: "Square eraser" });
  await expect(circle).toHaveAttribute("aria-pressed", "true");
  await expect(square).toHaveAttribute("aria-pressed", "false");

  await square.click();
  await expect(square).toHaveAttribute("aria-pressed", "true");
  await expect(circle).toHaveAttribute("aria-pressed", "false");
  await expect(
    penBar(canvas).locator('[data-shape="square"]').first(),
  ).toBeVisible();

  // the tool keeps the shape while a pen is used
  await tool(canvas, "Pen").click();
  await expect(
    penBar(canvas).getByRole("group", { name: "Eraser shape" }),
  ).toHaveCount(0);
  await tool(canvas, "Stroke eraser").click();
  await expect(
    penBar(canvas).getByRole("button", { name: "Square eraser" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the eraser tooltip shows its shortcut", async ({ canvas }) => {
  await brushButton(canvas).click();
  await expect(tool(canvas, "Stroke eraser")).toHaveAttribute(
    "title",
    "Stroke eraser (Shift+D)",
  );
});

test("Shift+D activates the stroke eraser", async ({ canvas }) => {
  await selectionButton(canvas).click();
  await expect(penBar(canvas)).toBeHidden();

  await canvas.keyboard.press("Shift+D");
  await expect(penBar(canvas)).toBeVisible();
  await expect(tool(canvas, "Stroke eraser")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
