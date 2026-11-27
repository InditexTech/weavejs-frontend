// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from "vitest";

let available = true;
let sdkHasEraser = true;

vi.mock("./availability", () => ({
  get PENS_AND_ERASER_AVAILABLE() {
    return available;
  },
}));
vi.mock("./sdk", () => ({
  createStrokeEraser: () =>
    sdkHasEraser ? { getName: () => "strokeEraserTool" } : undefined,
}));

import { findDuplicateActionNames, strokeEraserActions } from "./actions";

describe("strokeEraserActions", () => {
  beforeEach(() => {
    available = true;
    sdkHasEraser = true;
  });

  it("registers nothing when the feature is not available", () => {
    available = false;
    expect(strokeEraserActions()).toEqual([]);
  });

  it("registers one action when the feature is available", () => {
    const actions = strokeEraserActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].getName()).toBe("strokeEraserTool");
  });

  it("registers nothing when the SDK has no stroke eraser", () => {
    sdkHasEraser = false;
    expect(strokeEraserActions()).toEqual([]);
  });

  it("does not clash with the other erasers", () => {
    const names = [
      { getName: () => "eraserTool" },
      { getName: () => "maskEraserTool" },
      ...strokeEraserActions(),
    ];
    expect(findDuplicateActionNames(names)).toEqual([]);
  });
});

describe("findDuplicateActionNames", () => {
  it("reports repeated names", () => {
    const a = { getName: () => "a" };
    const b = { getName: () => "b" };
    expect(findDuplicateActionNames([a, b, a])).toEqual(["a"]);
    expect(findDuplicateActionNames([a, b])).toEqual([]);
  });
});
