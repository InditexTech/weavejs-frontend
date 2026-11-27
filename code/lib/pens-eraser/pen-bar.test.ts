// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
}));

import {
  BRUSH_MAX_SIZE,
  BRUSH_MIN_SIZE,
  MIN_OPACITY,
  PEN_BAR_COLORS,
  clampBrushSize,
  clampOpacity,
  isPenBarTool,
  toInk,
  toStrokeColor,
} from "./pen-bar";

describe("isPenBarTool", () => {
  it("is true for the brush and the stroke eraser only", () => {
    expect(isPenBarTool("brushTool")).toBe(true);
    expect(isPenBarTool("strokeEraserTool")).toBe(true);
    expect(isPenBarTool("eraserTool")).toBe(false);
    expect(isPenBarTool("selectionTool")).toBe(false);
    expect(isPenBarTool(undefined)).toBe(false);
  });
});

describe("toStrokeColor and toInk", () => {
  it("makes 6-digit colours opaque and keeps 8-digit ones", () => {
    expect(toStrokeColor("#E5484D")).toBe("#e5484dff");
    expect(toStrokeColor("#11223380")).toBe("#11223380");
  });

  it("falls back to opaque black for anything else", () => {
    expect(toStrokeColor("red")).toBe("#000000ff");
    expect(toStrokeColor("")).toBe("#000000ff");
  });

  it("gives the 6-digit ink of a stroke colour", () => {
    expect(toInk("#e5484dff")).toBe("#e5484d");
    expect(toInk("#112233")).toBe("#112233");
  });

  it("accepts every palette colour", () => {
    expect(PEN_BAR_COLORS).toHaveLength(12);
    for (const c of PEN_BAR_COLORS) expect(toStrokeColor(c)).toBe(`${c}ff`);
  });
});

describe("clampBrushSize", () => {
  it("keeps the size inside the brush limits", () => {
    expect(clampBrushSize(8.4)).toBe(8);
    expect(clampBrushSize(0)).toBe(BRUSH_MIN_SIZE);
    expect(clampBrushSize(999)).toBe(BRUSH_MAX_SIZE);
    expect(clampBrushSize(Number.NaN)).toBe(BRUSH_MIN_SIZE);
  });
});

describe("clampOpacity", () => {
  it("keeps the opacity between the minimum and 1, in whole percents", () => {
    expect(clampOpacity(0.456)).toBe(0.46);
    expect(clampOpacity(0)).toBe(MIN_OPACITY);
    expect(clampOpacity(7)).toBe(1);
    expect(clampOpacity(Number.NaN)).toBe(1);
  });
});
