// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

vi.mock("@inditextech/weave-sdk", () => ({
  WeaveStrokeEraserToolAction: class {
    getName() {
      return "strokeEraserTool";
    }
  },
}));

import { findDuplicateActionNames, strokeEraserActions } from "./actions";

describe("strokeEraserActions", () => {
  it("registers nothing when the flag is off", () => {
    expect(strokeEraserActions(false)).toEqual([]);
  });

  it("registers one action when the flag is on", () => {
    const actions = strokeEraserActions(true);
    expect(actions).toHaveLength(1);
    expect(actions[0].getName()).toBe("strokeEraserTool");
  });

  it("does not clash with the other erasers", () => {
    const names = [
      { getName: () => "eraserTool" },
      { getName: () => "maskEraserTool" },
      ...strokeEraserActions(true),
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
