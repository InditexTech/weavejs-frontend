// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from "vitest";
import { PENS_INITIAL, inkFor, usePens } from "./pens";

describe("pens store", () => {
  beforeEach(() => usePens.setState({ ...PENS_INITIAL }));

  it("shares one ink between the pens", () => {
    usePens.getState().setPen("pencil");
    usePens.getState().setInk("#e03131");
    const state = usePens.getState();
    expect(inkFor(state, "pencil")).toBe("#e03131");
    expect(inkFor(state, "marker")).toBe("#e03131");
  });

  it("gives the highlighter its own ink, yellow by default", () => {
    const state = usePens.getState();
    expect(inkFor(state, "highlighter")).toBe("#fff01f");
    expect(inkFor(state, "pen")).toBe("#000000");
  });

  it("changes only the highlighter's ink while it is selected", () => {
    usePens.getState().setPen("highlighter");
    usePens.getState().setInk("#2f9e44");
    const state = usePens.getState();
    expect(inkFor(state, "highlighter")).toBe("#2f9e44");
    expect(inkFor(state, "pen")).toBe("#000000");
  });

  it("remembers size and opacity for each pen", () => {
    usePens.getState().setTuned("pencil", { size: 3 });
    usePens.getState().setTuned("pencil", { opacity: 0.5 });
    usePens.getState().setTuned("marker", { size: 20 });
    expect(usePens.getState().tuned).toEqual({
      pencil: { size: 3, opacity: 0.5 },
      marker: { size: 20 },
    });
  });

  it("starts on the tools panel, not minimised, with no pen chosen", () => {
    const state = usePens.getState();
    expect([state.panel, state.collapsed, state.pen]).toEqual([
      "tools",
      false,
      null,
    ]);
  });
});
