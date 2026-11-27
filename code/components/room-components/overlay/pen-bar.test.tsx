// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

const brush = {
  setInstrument: vi.fn(),
  getInstrument: vi.fn(),
  getProps: vi.fn(),
};
const eraser = { getProps: vi.fn() };
const listeners: Record<string, (payload: unknown) => void> = {};
const instance = {
  getActionHandler: vi.fn(),
  triggerAction: vi.fn(),
  updatePropsAction: vi.fn(),
  addEventListener: vi.fn((name: string, fn: (payload: unknown) => void) => {
    listeners[name] = fn;
  }),
  removeEventListener: vi.fn((name: string) => {
    delete listeners[name];
  }),
};
let actualAction: string | undefined;

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
  BRUSH_INSTRUMENTS: [
    ["pencil", "Pencil"],
    ["pen", "Pen"],
    ["fountainPen", "Fountain pen"],
    ["brush", "Brush"],
    ["fineliner", "Fineliner"],
    ["marker", "Marker"],
    ["highlighter", "Highlighter"],
  ].map(([id, label]) => ({ id, label })),
}));
vi.mock("@inditextech/weave-react", () => ({
  useWeave: (selector: (s: unknown) => unknown) =>
    selector({ instance, actions: { actual: actualAction } }),
}));
vi.mock("../inputs/color-picker", () => ({ ColorPickerInput: () => null }));

import { PenBar } from "./pen-bar";
import { PENS_INITIAL, usePens } from "@/store/pens";

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

const inkOf = (pen: string) =>
  document.querySelector(`svg[data-pen="${pen}"]`)?.getAttribute("data-ink");

describe("PenBar", () => {
  beforeEach(() => {
    brush.setInstrument.mockReset().mockReturnValue({ applied: true });
    brush.getInstrument.mockReset().mockReturnValue(null);
    brush.getProps
      .mockReset()
      .mockReturnValue({ strokeWidth: 4, stroke: "#000000ff", opacity: 1 });
    eraser.getProps.mockReset().mockReturnValue({ size: 30, shape: "circle" });
    instance.triggerAction.mockReset();
    instance.updatePropsAction.mockReset();
    instance.getActionHandler
      .mockReset()
      .mockImplementation((name: string) =>
        name === "brushTool" ? brush : eraser,
      );
    actualAction = "brushTool";
    usePens.setState({ ...PENS_INITIAL });
  });
  afterEach(() => cleanup());

  describe("visibility and place", () => {
    it("renders nothing when the flag is off", () => {
      render(<PenBar enabled={false} />);
      expect(screen.queryByRole("toolbar")).toBeNull();
    });

    it.each(["brushTool", "strokeEraserTool"])("shows with %s", (action) => {
      actualAction = action;
      render(<PenBar enabled />);
      expect(screen.getByRole("toolbar")).toBeTruthy();
    });

    it.each(["selectionTool", "eraserTool", "rectangleTool", undefined])(
      "is hidden with %s",
      (action) => {
        actualAction = action;
        render(<PenBar enabled />);
        expect(screen.queryByRole("toolbar")).toBeNull();
      },
    );

    it("sits 8px above the bottom when there is no footer under it", () => {
      render(<PenBar enabled />);
      const wrapper = screen.getByRole("toolbar").parentElement!;
      expect(wrapper.style.bottom).toBe("8px");
    });

    it("sits 8px above a footer the layer runs underneath", () => {
      render(<PenBar enabled footerHeight={40} />);
      const wrapper = screen.getByRole("toolbar").parentElement!;
      expect(wrapper.style.bottom).toBe("48px");
    });

    it("stays clear of the sidebars it is given", () => {
      render(<PenBar enabled insetLeft={500} insetRight={508} />);
      const wrapper = screen.getByRole("toolbar").parentElement!;
      expect([wrapper.style.left, wrapper.style.right]).toEqual([
        "500px",
        "508px",
      ]);
    });
  });

  describe("tools panel", () => {
    it("lists the pens in the tray order, then the eraser", () => {
      render(<PenBar enabled />);
      const names = within(screen.getByRole("toolbar"))
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-label"));
      expect(names.slice(0, TRAY.length)).toEqual(TRAY);
    });

    it("puts the shortcut in the eraser tooltip", () => {
      render(<PenBar enabled />);
      expect(
        screen
          .getByRole("button", { name: "Stroke eraser" })
          .getAttribute("title"),
      ).toBe("Stroke eraser (Shift+D)");
    });

    it("dims the pens only once one is chosen", () => {
      const art = (name: string) =>
        screen.getByRole("button", { name }).querySelector("svg")!;
      render(<PenBar enabled />);
      expect(art("Pen").getAttribute("class")).not.toContain("opacity-80");
      fireEvent.click(screen.getByRole("button", { name: "Marker" }));
      expect(art("Pen").getAttribute("class")).toContain("opacity-80");
      expect(art("Marker").getAttribute("class")).not.toContain("opacity-80");
    });

    it("does not choose a pen on its own", () => {
      render(<PenBar enabled />);
      expect(brush.setInstrument).not.toHaveBeenCalled();
    });

    it("applies the pen's default size, the colour and the pen, in that order", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Marker" }));
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        strokeWidth: 18,
        stroke: "#000000ff",
      });
      expect(brush.setInstrument).toHaveBeenCalledWith("marker");
      expect(
        instance.updatePropsAction.mock.invocationCallOrder[0],
      ).toBeLessThan(brush.setInstrument.mock.invocationCallOrder[0]);
      expect(instance.triggerAction).not.toHaveBeenCalled();
      expect(
        screen
          .getByRole("button", { name: "Marker" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("returns from the eraser to the brush before applying the pen", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Pen" }));
      expect(instance.triggerAction).toHaveBeenCalledWith("brushTool");
      expect(instance.triggerAction.mock.invocationCallOrder[0]).toBeLessThan(
        brush.setInstrument.mock.invocationCallOrder[0],
      );
      expect(brush.setInstrument).toHaveBeenCalledWith("pen");
    });

    it("activates the stroke eraser", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Stroke eraser" }));
      expect(instance.triggerAction).toHaveBeenCalledWith("strokeEraserTool");
    });

    it("has no colour button while erasing, and the eraser is pressed", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      expect(screen.queryByRole("button", { name: "Colour" })).toBeNull();
      expect(
        screen
          .getByRole("button", { name: "Stroke eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });

  describe("colour", () => {
    it("opens the colour panel and goes back", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Colour" }));
      expect(screen.getAllByRole("button", { name: /^Color #/ })).toHaveLength(
        12,
      );
      expect(screen.queryByRole("button", { name: "Marker" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Back to tools" }));
      expect(screen.getByRole("button", { name: "Marker" })).toBeTruthy();
    });

    it("goes back with Escape", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Colour" }));
      fireEvent.keyDown(screen.getByRole("toolbar"), { key: "Escape" });
      expect(screen.getByRole("button", { name: "Marker" })).toBeTruthy();
    });

    it("writes the colour as an opaque 8-digit hex and marks the chip", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Colour" }));
      fireEvent.click(screen.getByRole("button", { name: "Color #e03131" }));
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        stroke: "#e03131ff",
      });
      expect(
        screen
          .getByRole("button", { name: "Color #e03131" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("shows the colour on the tips of every pen but the highlighter", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Pen" }));
      fireEvent.click(screen.getByRole("button", { name: "Colour" }));
      fireEvent.click(screen.getByRole("button", { name: "Color #e03131" }));
      fireEvent.click(screen.getByRole("button", { name: "Back to tools" }));
      expect(inkOf("pencil")).toBe("#e03131");
      expect(inkOf("brush")).toBe("#e03131");
      expect(inkOf("highlighter")).toBe("#fff01f");
    });

    it("changes only the highlighter while it is selected", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Highlighter" }));
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        strokeWidth: 28,
        stroke: "#fff01fff",
      });
      fireEvent.click(screen.getByRole("button", { name: "Colour" }));
      fireEvent.click(screen.getByRole("button", { name: "Color #2f9e44" }));
      fireEvent.click(screen.getByRole("button", { name: "Back to tools" }));
      expect(inkOf("highlighter")).toBe("#2f9e44");
      expect(inkOf("pen")).toBe("#000000");
    });
  });

  describe("size and opacity", () => {
    const openSizes = () =>
      fireEvent.click(screen.getByRole("button", { name: "Size and opacity" }));

    it("starts from the brush's width and opacity", () => {
      render(<PenBar enabled />);
      openSizes();
      expect(
        screen
          .getByRole("slider", { name: "Size" })
          .getAttribute("aria-valuenow"),
      ).toBe("4");
      expect(
        screen
          .getByRole("slider", { name: "Opacity" })
          .getAttribute("aria-valuenow"),
      ).toBe("1");
    });

    it("sets the brush width", () => {
      render(<PenBar enabled />);
      openSizes();
      fireEvent.keyDown(screen.getByRole("slider", { name: "Size" }), {
        key: "ArrowRight",
      });
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        strokeWidth: 5,
      });
      expect(brush.setInstrument).not.toHaveBeenCalled();
    });

    it("applies the pen again after a width change and then writes the opacity back", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Highlighter" }));
      openSizes();
      fireEvent.keyDown(screen.getByRole("slider", { name: "Opacity" }), {
        key: "ArrowLeft",
      });
      brush.setInstrument.mockClear();
      instance.updatePropsAction.mockClear();

      fireEvent.keyDown(screen.getByRole("slider", { name: "Size" }), {
        key: "ArrowRight",
      });
      expect(brush.setInstrument).toHaveBeenCalledTimes(1);
      expect(brush.setInstrument).toHaveBeenCalledWith("highlighter");
      const [width, opacity] = instance.updatePropsAction.mock.calls;
      expect(width[1]).toHaveProperty("strokeWidth");
      expect(opacity[1]).toEqual({ opacity: expect.any(Number) });
      expect(
        instance.updatePropsAction.mock.invocationCallOrder[0],
      ).toBeLessThan(brush.setInstrument.mock.invocationCallOrder[0]);
      expect(brush.setInstrument.mock.invocationCallOrder[0]).toBeLessThan(
        instance.updatePropsAction.mock.invocationCallOrder[1],
      );
    });

    it("sets the opacity", () => {
      render(<PenBar enabled />);
      openSizes();
      fireEvent.keyDown(screen.getByRole("slider", { name: "Opacity" }), {
        key: "ArrowLeft",
      });
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        opacity: 0.98,
      });
    });

    it("shows only the eraser size, in screen pixels, while erasing", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      openSizes();
      expect(screen.queryByRole("slider", { name: "Opacity" })).toBeNull();
      const size = screen.getByRole("slider", { name: "Size" });
      expect(size.getAttribute("aria-valuenow")).toBe("30");
      fireEvent.keyDown(size, { key: "ArrowRight" });
      expect(instance.updatePropsAction).toHaveBeenCalledWith(
        "strokeEraserTool",
        { size: 34 },
      );
    });

    it("follows the tool when something else changes its props", () => {
      render(<PenBar enabled />);
      openSizes();
      act(() => {
        listeners.onPropsChange({
          instance: { getName: () => "brushTool" },
          props: { strokeWidth: 9, stroke: "#0090ffff", opacity: 0.4 },
        });
      });
      expect(
        screen
          .getByRole("slider", { name: "Size" })
          .getAttribute("aria-valuenow"),
      ).toBe("9");
      expect(
        screen
          .getByRole("slider", { name: "Opacity" })
          .getAttribute("aria-valuenow"),
      ).toBe("0.4");
    });

    it("ignores the props of other tools", () => {
      render(<PenBar enabled />);
      openSizes();
      act(() => {
        listeners.onPropsChange({
          instance: { getName: () => "rectangleTool" },
          props: { strokeWidth: 40 },
        });
      });
      expect(
        screen
          .getByRole("slider", { name: "Size" })
          .getAttribute("aria-valuenow"),
      ).toBe("4");
    });
  });

  describe("memory", () => {
    it("restores each pen's own size", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Pencil" }));
      fireEvent.click(screen.getByRole("button", { name: "Size and opacity" }));
      fireEvent.keyDown(screen.getByRole("slider", { name: "Size" }), {
        key: "ArrowRight",
      });
      fireEvent.click(screen.getByRole("button", { name: "Back to tools" }));
      fireEvent.click(screen.getByRole("button", { name: "Marker" }));
      instance.updatePropsAction.mockClear();
      fireEvent.click(screen.getByRole("button", { name: "Pencil" }));
      // the mocked brush reports a width of 4, one step up is 5
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        strokeWidth: 5,
        stroke: "#000000ff",
      });
    });

    it("applies the memory when the brush becomes active from elsewhere", () => {
      actualAction = "selectionTool";
      render(<PenBar enabled />);
      usePens.setState({ pen: "marker", tuned: { marker: { size: 22 } } });
      act(() => {
        listeners.onActiveActionChange("brushTool");
      });
      expect(instance.updatePropsAction).toHaveBeenCalledWith("brushTool", {
        strokeWidth: 22,
        stroke: "#000000ff",
      });
      expect(brush.setInstrument).toHaveBeenCalledWith("marker");
    });

    it("leaves the brush alone when no pen was ever chosen", () => {
      actualAction = "selectionTool";
      render(<PenBar enabled />);
      act(() => {
        listeners.onActiveActionChange("brushTool");
      });
      expect(instance.updatePropsAction).not.toHaveBeenCalled();
    });

    it("adopts the pen the tool already has", () => {
      brush.getInstrument.mockReturnValue("brush");
      render(<PenBar enabled />);
      expect(
        screen
          .getByRole("button", { name: "Brush" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });

  describe("opening", () => {
    it("always starts on the pens, whatever panel was left open", () => {
      actualAction = "selectionTool";
      usePens.setState({ panel: "size" });
      const view = render(<PenBar enabled />);
      actualAction = "brushTool";
      view.rerender(<PenBar enabled />);
      expect(screen.getByRole("button", { name: "Marker" })).toBeTruthy();
      expect(screen.queryByRole("slider", { name: "Size" })).toBeNull();
    });

    it("keeps the panel while switching between the brush and the eraser", () => {
      const view = render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Size and opacity" }));
      actualAction = "strokeEraserTool";
      view.rerender(<PenBar enabled />);
      expect(screen.getByRole("slider", { name: "Size" })).toBeTruthy();
    });
  });

  describe("eraser shape", () => {
    const sizeDot = () =>
      screen
        .getByRole("button", { name: "Size and opacity" })
        .querySelector("[data-shape]") as HTMLElement;

    it("offers a circle and a square only while erasing", () => {
      const view = render(<PenBar enabled />);
      expect(screen.queryByRole("group", { name: "Eraser shape" })).toBeNull();
      actualAction = "strokeEraserTool";
      view.rerender(<PenBar enabled />);
      expect(screen.getByRole("group", { name: "Eraser shape" })).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Circle eraser" }),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Square eraser" }),
      ).toBeTruthy();
    });

    it("starts with the shape the tool has", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      expect(
        screen
          .getByRole("button", { name: "Circle eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
      expect(
        screen
          .getByRole("button", { name: "Square eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("false");

      cleanup();
      eraser.getProps.mockReturnValue({ size: 30, shape: "square" });
      render(<PenBar enabled />);
      expect(
        screen
          .getByRole("button", { name: "Square eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("writes the shape to the tool", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Square eraser" }));
      expect(instance.updatePropsAction).toHaveBeenCalledWith(
        "strokeEraserTool",
        { shape: "square" },
      );
      expect(
        screen
          .getByRole("button", { name: "Square eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("follows the tool when something else changes the shape", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      act(() => {
        listeners.onPropsChange({
          instance: { getName: () => "strokeEraserTool" },
          props: { size: 30, shape: "square" },
        });
      });
      expect(
        screen
          .getByRole("button", { name: "Square eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("ignores a shape it does not know", () => {
      actualAction = "strokeEraserTool";
      render(<PenBar enabled />);
      act(() => {
        listeners.onPropsChange({
          instance: { getName: () => "strokeEraserTool" },
          props: { size: 30, shape: "triangle" },
        });
      });
      expect(
        screen
          .getByRole("button", { name: "Circle eraser" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("gives the size dot the shape of the eraser", () => {
      actualAction = "strokeEraserTool";
      eraser.getProps.mockReturnValue({ size: 30, shape: "square" });
      render(<PenBar enabled />);
      expect(sizeDot().getAttribute("data-shape")).toBe("square");
      expect(sizeDot().className).toContain("rounded-none");
    });

    it("keeps a round dot for the pens", () => {
      render(<PenBar enabled />);
      expect(sizeDot().getAttribute("data-shape")).toBe("circle");
      expect(sizeDot().className).toContain("rounded-full");
    });
  });

  describe("minimise", () => {
    it("shrinks to a tile and comes back", () => {
      render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Hide tools" }));
      expect(screen.queryByRole("button", { name: "Marker" })).toBeNull();
      fireEvent.click(
        screen.getByRole("button", { name: "Show drawing tools" }),
      );
      expect(screen.getByRole("button", { name: "Marker" })).toBeTruthy();
    });

    it("stays minimised while the tool changes", () => {
      const view = render(<PenBar enabled />);
      fireEvent.click(screen.getByRole("button", { name: "Hide tools" }));
      actualAction = "strokeEraserTool";
      view.rerender(<PenBar enabled />);
      expect(
        screen.getByRole("button", { name: "Show drawing tools" }),
      ).toBeTruthy();
    });
  });
});
