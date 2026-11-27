// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PenArt } from "./pen-art";
import { PEN_ORDER } from "@/lib/pens-eraser/pen-defaults";

describe("PenArt", () => {
  afterEach(() => cleanup());

  it.each(PEN_ORDER)("shows the ink on %s", (id) => {
    const { container } = render(<PenArt id={id} ink="#e03131" />);
    const inked = container.querySelectorAll('[fill="#e03131"]');
    // the fountain pen keeps its gold nib: its ink shows on the band only
    expect(inked.length).toBeGreaterThanOrEqual(id === "fountainPen" ? 1 : 2);
  });

  it("does not carry the ink anywhere on the eraser", () => {
    const { container } = render(<PenArt id="eraser" ink="#e03131" />);
    expect(container.querySelectorAll('[fill="#e03131"]')).toHaveLength(0);
  });

  it("follows a change of ink", () => {
    const { container, rerender } = render(<PenArt id="pen" ink="#e03131" />);
    rerender(<PenArt id="pen" ink="#1c7ed6" />);
    expect(container.querySelectorAll('[fill="#e03131"]')).toHaveLength(0);
    expect(
      container.querySelectorAll('[fill="#1c7ed6"]').length,
    ).toBeGreaterThanOrEqual(2);
  });
});
