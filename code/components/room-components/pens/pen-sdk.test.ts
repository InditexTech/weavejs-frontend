// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
}));

import { PENS_INITIAL, usePens } from "@/store/pens";
import { applyPenMemory } from "./pen-sdk";

describe("applyPenMemory", () => {
  const calls: string[] = [];
  const instance = {
    updatePropsAction: vi.fn((_: string, props: Record<string, unknown>) => {
      calls.push(`props ${Object.keys(props).join(",")}`);
    }),
  };
  const brush = {
    setInstrument: vi.fn((id: string) => {
      calls.push(`instrument ${id}`);
      return { applied: true };
    }),
  };

  beforeEach(() => {
    calls.length = 0;
    instance.updatePropsAction.mockClear();
    brush.setInstrument.mockClear();
    usePens.setState({ ...PENS_INITIAL });
  });

  it("does nothing until a pen has been chosen", () => {
    applyPenMemory(instance, brush as never);
    expect(calls).toEqual([]);
  });

  it("writes the width and colour, then the pen, then the opacity", () => {
    usePens.setState({
      pen: "marker",
      ink: "#e03131",
      tuned: { marker: { size: 22, opacity: 0.5 } },
    });
    applyPenMemory(instance, brush as never);
    expect(calls).toEqual([
      "props strokeWidth,stroke",
      "instrument marker",
      "props opacity",
    ]);
    expect(instance.updatePropsAction).toHaveBeenNthCalledWith(1, "brushTool", {
      strokeWidth: 22,
      stroke: "#e03131ff",
    });
    expect(instance.updatePropsAction).toHaveBeenNthCalledWith(2, "brushTool", {
      opacity: 0.5,
    });
  });

  it("uses the pen's default size and leaves its opacity when nothing was tuned", () => {
    usePens.setState({ pen: "highlighter" });
    applyPenMemory(instance, brush as never);
    expect(calls).toEqual([
      "props strokeWidth,stroke",
      "instrument highlighter",
    ]);
    expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
      strokeWidth: 28,
      stroke: "#fff01fff",
    });
  });
});
