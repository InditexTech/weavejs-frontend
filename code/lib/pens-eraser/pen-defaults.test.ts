// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import {
  FALLBACK_PEN_SIZE,
  PEN_ORDER,
  penDefaultSize,
  sortPens,
} from "./pen-defaults";

describe("pen defaults", () => {
  it("lists the pens in the tray order", () => {
    expect(PEN_ORDER).toEqual([
      "pencil",
      "pen",
      "fineliner",
      "marker",
      "highlighter",
      "brush",
      "fountainPen",
    ]);
  });

  it("gives the marker a larger default size than the pencil", () => {
    expect(penDefaultSize("marker")).toBeGreaterThan(penDefaultSize("pencil"));
    expect(penDefaultSize("highlighter")).toBeGreaterThan(
      penDefaultSize("marker"),
    );
  });

  it("falls back for an unknown pen", () => {
    expect(penDefaultSize("quill")).toBe(FALLBACK_PEN_SIZE);
  });

  it("sorts into the tray order and puts unknown pens last", () => {
    const sorted = sortPens(
      ["brush", "quill", "pencil", "fountainPen"].map((id) => ({ id })),
    );
    expect(sorted.map((p) => p.id)).toEqual([
      "pencil",
      "brush",
      "fountainPen",
      "quill",
    ]);
  });
});
