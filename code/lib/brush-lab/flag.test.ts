// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { isBrushLabEnabled, isBrushLabRequested } from "./flag";

describe("isBrushLabEnabled", () => {
  it("is on only when the build flag is exactly true", () => {
    expect(isBrushLabEnabled({ VITE_BRUSH_LAB: "true" })).toBe(true);
    expect(isBrushLabEnabled({ VITE_BRUSH_LAB: "false" })).toBe(false);
    expect(isBrushLabEnabled({ VITE_BRUSH_LAB: "1" })).toBe(false);
    expect(isBrushLabEnabled({})).toBe(false);
  });
});

describe("isBrushLabRequested", () => {
  it.each(["?lab=brush", "?a=1&lab=brush", "lab=brush"])("accepts %s", (s) =>
    expect(isBrushLabRequested(s)).toBe(true),
  );
  it.each(["", "?lab=other", "?lab=", "?laboratory=brush"])("rejects %s", (s) =>
    expect(isBrushLabRequested(s)).toBe(false),
  );
});
