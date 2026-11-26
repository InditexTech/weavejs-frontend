// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import {
  STROKE_ERASER_DEFAULT_SIZE,
  STROKE_ERASER_MAX_SIZE,
  STROKE_ERASER_MIN_SIZE,
  clampEraserSize,
} from "./size";

describe("clampEraserSize", () => {
  it("keeps sizes inside the limits and rounds to whole pixels", () => {
    expect(clampEraserSize(24)).toBe(24);
    expect(clampEraserSize(24.6)).toBe(25);
    expect(clampEraserSize(-5)).toBe(STROKE_ERASER_MIN_SIZE);
    expect(clampEraserSize(5000)).toBe(STROKE_ERASER_MAX_SIZE);
  });

  it("falls back to the default for values that are not numbers", () => {
    expect(clampEraserSize(Number.NaN)).toBe(STROKE_ERASER_DEFAULT_SIZE);
  });
});
