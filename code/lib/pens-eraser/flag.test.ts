// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { isPensAndEraserEnabled } from "./flag";

describe("isPensAndEraserEnabled", () => {
  it("is on only when the build flag is exactly true", () => {
    expect(isPensAndEraserEnabled({ VITE_PENS_AND_ERASER: "true" })).toBe(true);
    expect(isPensAndEraserEnabled({ VITE_PENS_AND_ERASER: "false" })).toBe(
      false,
    );
    expect(isPensAndEraserEnabled({ VITE_PENS_AND_ERASER: "1" })).toBe(false);
    expect(isPensAndEraserEnabled({ VITE_PENS_AND_ERASER: "" })).toBe(false);
    expect(isPensAndEraserEnabled({})).toBe(false);
  });
});
