// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

async function loadWith(sdk: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("@inditextech/weave-sdk", () => sdk);
  return import("./sdk");
}

describe("the SDK pens and stroke eraser", () => {
  afterEach(() => {
    vi.doUnmock("@inditextech/weave-sdk");
    vi.resetModules();
  });

  it("falls back safely when the SDK does not have them", async () => {
    const mod = await loadWith({});
    expect(mod.STROKE_ERASER_TOOL_ACTION_NAME).toBe("strokeEraserTool");
    expect(mod.BRUSH_INSTRUMENTS).toEqual([]);
    expect(mod.PENS_AND_ERASER_SUPPORTED).toBe(false);
    expect(mod.createStrokeEraser()).toBeUndefined();
  });

  it("uses them when the SDK has them", async () => {
    class Eraser {
      getName() {
        return "sdkEraser";
      }
    }
    const mod = await loadWith({
      STROKE_ERASER_TOOL_ACTION_NAME: "sdkEraser",
      BRUSH_INSTRUMENTS: [{ id: "pencil", label: "Pencil" }],
      WeaveStrokeEraserToolAction: Eraser,
    });
    expect(mod.STROKE_ERASER_TOOL_ACTION_NAME).toBe("sdkEraser");
    expect(mod.BRUSH_INSTRUMENTS).toHaveLength(1);
    expect(mod.PENS_AND_ERASER_SUPPORTED).toBe(true);
    expect(mod.createStrokeEraser()).toBeInstanceOf(Eraser);
  });

  it("needs both the pens and the eraser to count as supported", async () => {
    const mod = await loadWith({
      BRUSH_INSTRUMENTS: [{ id: "pencil", label: "Pencil" }],
    });
    expect(mod.PENS_AND_ERASER_SUPPORTED).toBe(false);
  });
});
