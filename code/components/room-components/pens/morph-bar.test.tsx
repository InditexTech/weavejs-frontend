// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MorphBar } from "./morph-bar";

const panels = [
  { id: "a", content: <button>in a</button> },
  { id: "b", content: <button>in b</button> },
];

describe("MorphBar", () => {
  afterEach(() => cleanup());

  it("reaches only the active panel", () => {
    const { rerender } = render(
      <MorphBar
        panels={panels}
        active="a"
        collapsed={false}
        collapsedContent={null}
        onExpand={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "in a" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "in b" })).toBeNull();

    rerender(
      <MorphBar
        panels={panels}
        active="b"
        collapsed={false}
        collapsedContent={null}
        onExpand={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "in a" })).toBeNull();
    expect(screen.queryByRole("button", { name: "in b" })).toBeTruthy();
  });

  it("keeps every panel mounted", () => {
    const { container } = render(
      <MorphBar
        panels={panels}
        active="a"
        collapsed={false}
        collapsedContent={null}
        onExpand={vi.fn()}
      />,
    );
    expect(container.querySelectorAll("[data-panel]")).toHaveLength(2);
    expect(
      container.querySelector('[data-panel="b"]')?.hasAttribute("inert"),
    ).toBe(true);
  });

  it("hides the panels and shows a tile that restores the bar when collapsed", () => {
    const onExpand = vi.fn();
    render(
      <MorphBar
        panels={panels}
        active="a"
        collapsed
        collapsedContent={<span>tile</span>}
        onExpand={onExpand}
      />,
    );
    expect(screen.queryByRole("button", { name: "in a" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show drawing tools" }));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("offers no restore button while open", () => {
    render(
      <MorphBar
        panels={panels}
        active="a"
        collapsed={false}
        collapsedContent={null}
        onExpand={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Show drawing tools" }),
    ).toBeNull();
  });
});
