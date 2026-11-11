// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import {
  buildControlGroups,
  controlFor,
  getAtPath,
  patchFor,
  type TunableLike,
} from "./controls";

const t = (over: Partial<TunableLike>): TunableLike => ({
  key: "a.b",
  scope: "profile",
  path: ["a", "minCutoff"],
  stage: "stabilizer",
  group: "Stabilizer",
  type: "number",
  default: 1,
  min: 0,
  max: 10,
  step: 0.5,
  help: "help",
  ...over,
});

describe("controlFor", () => {
  it("makes a slider for a number with its range", () => {
    expect(controlFor(t({}))).toMatchObject({
      control: "slider",
      min: 0,
      max: 10,
      step: 0.5,
      label: "Min cutoff",
    });
  });

  it("uses a step of one for integers and a fraction of the range otherwise", () => {
    expect(controlFor(t({ integer: true, step: undefined })).step).toBe(1);
    expect(controlFor(t({ step: undefined })).step).toBeCloseTo(0.1);
  });

  it("makes a switch for a boolean and a select for an enum", () => {
    expect(controlFor(t({ type: "boolean" })).control).toBe("switch");
    expect(controlFor(t({ type: "enum", options: ["x", "y"] }))).toMatchObject({
      control: "select",
      options: ["x", "y"],
    });
  });
});

describe("buildControlGroups", () => {
  it("groups by heading and separates advanced settings", () => {
    const groups = buildControlGroups([
      t({ key: "1", group: "One" }),
      t({ key: "2", group: "One", advanced: true }),
      t({ key: "3", group: "Two" }),
    ]);
    expect(groups.map((g) => g.group)).toEqual(["One", "Two"]);
    expect(groups[0].basic.map((c) => c.key)).toEqual(["1"]);
    expect(groups[0].advanced.map((c) => c.key)).toEqual(["2"]);
  });
});

describe("paths", () => {
  it("reads a nested value, and undefined when it is missing", () => {
    expect(getAtPath({ a: { b: 3 } }, ["a", "b"])).toBe(3);
    expect(getAtPath({ a: 1 }, ["a", "b"])).toBeUndefined();
    expect(getAtPath(null, ["a"])).toBeUndefined();
  });

  it("builds the nested patch for one setting", () => {
    expect(patchFor(["a", "b", "c"], 5)).toEqual({ a: { b: { c: 5 } } });
    expect(patchFor(["a"], false)).toEqual({ a: false });
  });
});
