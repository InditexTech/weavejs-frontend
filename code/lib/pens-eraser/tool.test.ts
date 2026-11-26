// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
}));

import {
  STROKE_ERASER_LABEL,
  STROKE_ERASER_TOOL,
  isZoomingAllowed,
} from "./tool";

describe("isZoomingAllowed", () => {
  it.each(["selectionTool", "moveTool", "eraserTool", "strokeEraserTool"])(
    "allows zooming with %s",
    (action) => expect(isZoomingAllowed(action)).toBe(true),
  );

  it("allows zooming when no tool is active", () => {
    expect(isZoomingAllowed(undefined)).toBe(true);
  });

  it.each(["brushTool", "rectangleTool", "maskEraserTool"])(
    "blocks zooming with %s",
    (action) => expect(isZoomingAllowed(action)).toBe(false),
  );
});

describe("stroke eraser tool", () => {
  it("has a name and a display label", () => {
    expect(STROKE_ERASER_TOOL).toBe("strokeEraserTool");
    expect(STROKE_ERASER_LABEL).toBe("Stroke eraser");
  });
});
