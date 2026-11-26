// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BarSlider } from "./bar-slider";

// jsdom has no PointerEvent, so give it one that carries the coordinates.
if (!("PointerEvent" in window)) {
  class PointerEventShim extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  }
  Object.defineProperty(window, "PointerEvent", { value: PointerEventShim });
}

function setup(props: Partial<Parameters<typeof BarSlider>[0]> = {}) {
  const onChange = vi.fn();
  render(
    <BarSlider
      label="Size"
      value={10}
      min={0}
      max={100}
      display="10"
      color="#000"
      onChange={onChange}
      {...props}
    />,
  );
  const slider = screen.getByRole("slider", { name: "Size" });
  slider.getBoundingClientRect = () =>
    ({
      left: 0,
      width: 216,
      top: 0,
      height: 16,
      right: 216,
      bottom: 16,
    }) as DOMRect;
  return { slider, onChange };
}

describe("BarSlider", () => {
  afterEach(() => cleanup());

  it("shows its label and value and exposes them to assistive tech", () => {
    const { slider } = setup({ display: "10px" });
    expect(screen.getByText("Size")).toBeTruthy();
    expect(screen.getByText("10px")).toBeTruthy();
    expect(slider.getAttribute("aria-valuenow")).toBe("10");
    expect(slider.getAttribute("aria-valuetext")).toBe("10px");
  });

  it("moves in steps of a fiftieth of the range with the arrow keys", () => {
    const { slider, onChange } = setup();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(12);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(8);
  });

  it("stays inside its range with the keys", () => {
    const { slider, onChange } = setup({ value: 100 });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it("takes the value from where the track is pressed", () => {
    const { slider, onChange } = setup();
    fireEvent.pointerDown(slider, { clientX: 108, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("is finer at the low end with a curve", () => {
    const { slider, onChange } = setup({ curve: 2 });
    fireEvent.pointerDown(slider, { clientX: 108, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(25);
  });

  it("follows a drag and stops on release", () => {
    const { slider, onChange } = setup();
    fireEvent.pointerDown(slider, { clientX: 8, pointerId: 1 });
    fireEvent.pointerMove(slider, { clientX: 208, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.pointerUp(slider, { pointerId: 1 });
    onChange.mockClear();
    fireEvent.pointerMove(slider, { clientX: 100, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
