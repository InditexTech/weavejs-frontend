// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PenButton } from "./pen-button";

function setup(props: Partial<Parameters<typeof PenButton>[0]> = {}) {
  const onClick = vi.fn();
  const view = render(
    <PenButton
      id="marker"
      label="Marker"
      ink="#e03131"
      active={false}
      onClick={onClick}
      {...props}
    />,
  );
  const button = screen.getByRole("button", { name: "Marker" });
  return { view, button, onClick, art: button.querySelector("svg")! };
}

describe("PenButton", () => {
  afterEach(() => cleanup());

  it("is pressed only when chosen", () => {
    const first = setup();
    expect(first.button.getAttribute("aria-pressed")).toBe("false");
    cleanup();
    const second = setup({ active: true });
    expect(second.button.getAttribute("aria-pressed")).toBe("true");
  });

  it("marks the chosen pen with a slot and an underline", () => {
    const idle = setup();
    expect(idle.button.querySelector("[data-slot]")).toBeNull();
    expect(idle.button.querySelector("[data-underline]")).toBeNull();
    cleanup();
    const chosen = setup({ active: true });
    expect(chosen.button.querySelector("[data-slot]")).toBeTruthy();
    expect(chosen.button.querySelector("[data-underline]")).toBeTruthy();
  });

  it("lifts the chosen pen above the others", () => {
    const idle = setup();
    expect(idle.art.getAttribute("class")).toContain("translate-y-[12px]");
    cleanup();
    const chosen = setup({ active: true });
    expect(chosen.art.getAttribute("class")).toContain("-translate-y-[6px]");
  });

  it("dims the pens that are not chosen, unless told not to", () => {
    expect(setup().art.getAttribute("class")).toContain("opacity-80");
    cleanup();
    expect(setup({ dimIdle: false }).art.getAttribute("class")).not.toContain(
      "opacity-80",
    );
    cleanup();
    expect(setup({ active: true }).art.getAttribute("class")).not.toContain(
      "opacity-80",
    );
  });

  it("takes the colour of the slot from its caller", () => {
    const { button } = setup({ active: true, slotClassName: "bg-white" });
    expect(
      button.querySelector("[data-slot]")?.getAttribute("class"),
    ).toContain("bg-white");
  });

  it("reports a click", () => {
    const { button, onClick } = setup();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
