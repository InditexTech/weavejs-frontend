// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

describe("with the SDK's own constants", () => {
  it("names the stroke eraser differently from the other erasers", async () => {
    const strokeEraser =
      await import("@weave-sdk-src/actions/stroke-eraser-tool/constants");
    const eraser = await import("@weave-sdk-src/actions/eraser-tool/constants");
    const name = strokeEraser.STROKE_ERASER_TOOL_ACTION_NAME;
    expect(name).toBe("strokeEraserTool");
    expect(name).not.toBe(eraser.ERASER_TOOL_ACTION_NAME);
    expect(name).not.toBe("maskEraserTool");
  });
});
