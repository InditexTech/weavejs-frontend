// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const brush = {
  setInstrument: vi.fn(),
  getInstrument: vi.fn(),
  getProps: vi.fn(),
};
const instance = {
  getActionHandler: vi.fn(),
  triggerAction: vi.fn(),
  updatePropsAction: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
let actualAction: string | undefined;

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
  BRUSH_INSTRUMENTS: [
    ["pencil", "Pencil"],
    ["pen", "Pen"],
    ["marker", "Marker"],
  ].map(([id, label]) => ({ id, label })),
}));
vi.mock("@inditextech/weave-react", () => ({
  useWeave: (selector: (s: unknown) => unknown) =>
    selector({ instance, actions: { actual: actualAction } }),
}));
vi.mock("../inputs/color-picker", () => ({ ColorPickerInput: () => null }));

import { PenSection } from "./pen-section";
import { PENS_INITIAL, usePens } from "@/store/pens";

describe("PenSection", () => {
  beforeEach(() => {
    brush.setInstrument.mockReset().mockReturnValue({ applied: true });
    brush.getInstrument.mockReset().mockReturnValue(null);
    brush.getProps
      .mockReset()
      .mockReturnValue({ strokeWidth: 4, stroke: "#000000ff", opacity: 1 });
    instance.triggerAction.mockReset();
    instance.updatePropsAction.mockReset();
    instance.getActionHandler
      .mockReset()
      .mockImplementation((name: string) =>
        name === "brushTool" ? brush : { getProps: () => ({ size: 24 }) },
      );
    actualAction = "brushTool";
    usePens.setState({ ...PENS_INITIAL });
  });
  afterEach(() => cleanup());

  it("renders nothing when the flag is off", () => {
    render(<PenSection enabled={false} />);
    expect(screen.queryByRole("group", { name: "Pens" })).toBeNull();
  });

  it("lists the pens and the stroke eraser, the colours and both sliders", () => {
    render(<PenSection enabled />);
    for (const name of ["Pencil", "Pen", "Marker", "Stroke eraser"]) {
      expect(screen.getByRole("button", { name })).toBeTruthy();
    }
    expect(screen.getAllByRole("button", { name: /^Color #/ })).toHaveLength(
      12,
    );
    expect(screen.getByRole("slider", { name: "Size" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Opacity" })).toBeTruthy();
  });

  it("applies a pen to the brush tool", () => {
    render(<PenSection enabled />);
    fireEvent.click(screen.getByRole("button", { name: "Marker" }));
    expect(brush.setInstrument).toHaveBeenCalledWith("marker");
  });

  it("sets the colour and the opacity", () => {
    render(<PenSection enabled />);
    fireEvent.click(screen.getByRole("button", { name: "Color #1c7ed6" }));
    expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
      stroke: "#1c7ed6ff",
    });
    fireEvent.keyDown(screen.getByRole("slider", { name: "Opacity" }), {
      key: "ArrowLeft",
    });
    expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
      opacity: 0.98,
    });
  });

  it("switches to the stroke eraser and then offers only its size", () => {
    const view = render(<PenSection enabled />);
    fireEvent.click(screen.getByRole("button", { name: "Stroke eraser" }));
    expect(instance.triggerAction).toHaveBeenCalledWith("strokeEraserTool");
    actualAction = "strokeEraserTool";
    view.rerender(<PenSection enabled />);
    expect(screen.queryByRole("slider", { name: "Opacity" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Color #/ })).toBeNull();
    expect(
      screen
        .getByRole("slider", { name: "Size" })
        .getAttribute("aria-valuenow"),
    ).toBe("24");
  });

  it("shares the chosen pen with the pen bar through the store", () => {
    render(<PenSection enabled />);
    fireEvent.click(screen.getByRole("button", { name: "Pen" }));
    expect(usePens.getState().pen).toBe("pen");
  });
});
