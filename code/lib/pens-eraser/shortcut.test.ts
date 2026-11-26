// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STROKE_ERASER_SHORTCUT } from "./shortcut";

type Binding = { key: string; mod: boolean; alt: boolean; shift: boolean };

function bindingsIn(source: string): Binding[] {
  const out: Binding[] = [];
  for (const m of source.matchAll(/^\s*useHotkey\(\s*\{([^}]*)\}/gm)) {
    const body = m[1];
    const key = /key:\s*"([^"]+)"/.exec(body)?.[1];
    if (!key) continue;
    const flag = (name: string) => new RegExp(`${name}:\\s*true`).test(body);
    out.push({
      key,
      mod: flag("mod"),
      alt: flag("alt"),
      shift: flag("shift"),
    });
  }
  return out;
}

const handler = readFileSync(
  path.resolve(
    __dirname,
    "../../components/room-components/hooks/use-keyboard-handler.tsx",
  ),
  "utf8",
);

describe("stroke eraser shortcut", () => {
  const same = (b: Binding) =>
    b.key === STROKE_ERASER_SHORTCUT.key &&
    b.mod === STROKE_ERASER_SHORTCUT.mod &&
    b.alt === STROKE_ERASER_SHORTCUT.alt &&
    b.shift === STROKE_ERASER_SHORTCUT.shift;

  it("finds the existing bindings", () => {
    const bindings = bindingsIn(handler);
    expect(bindings.length).toBeGreaterThan(20);
    expect(bindings.some((b) => b.key === "D" && !b.shift)).toBe(true);
  });

  it("is not bound to anything else", () => {
    expect(bindingsIn(handler).filter(same)).toHaveLength(0);
  });

  it("is registered exactly once, through its own hook", () => {
    expect(handler.match(/useStrokeEraserHotkey\(/g)).toHaveLength(1);
  });

  it("keeps D for the node eraser", () => {
    const plainD = bindingsIn(handler).filter(
      (b) => b.key === "D" && !b.mod && !b.alt && !b.shift,
    );
    expect(plainD).toHaveLength(1);
  });
});
