// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { DEFAULT_ERASER_SHAPE, ERASER_SHAPES, toEraserShape } from "./shape";

describe("eraser shape", () => {
  it("offers a circle and a square, starting with the circle", () => {
    expect(ERASER_SHAPES).toEqual(["circle", "square"]);
    expect(DEFAULT_ERASER_SHAPE).toBe("circle");
  });

  it("accepts only known shapes", () => {
    expect(toEraserShape("square")).toBe("square");
    expect(toEraserShape("circle")).toBe("circle");
    expect(toEraserShape("triangle")).toBeUndefined();
    expect(toEraserShape(undefined)).toBeUndefined();
    expect(toEraserShape(3)).toBeUndefined();
  });
});
