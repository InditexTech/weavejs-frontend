// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { buildControlGroups, type TunableLike } from "./controls";

describe("with the SDK's own descriptors", () => {
  it("renders one control for every descriptor", async () => {
    const mod =
      await import("@weave-sdk-src/actions/brush-tool/tunables/descriptors");
    const tunables = mod.BRUSH_TUNABLES as TunableLike[];
    const groups = buildControlGroups(tunables);
    const rendered = groups.flatMap((g) => [...g.basic, ...g.advanced]);
    expect(rendered).toHaveLength(tunables.length);
    expect(new Set(rendered.map((c) => c.key))).toEqual(
      new Set(tunables.map((x) => x.key)),
    );
    for (const c of rendered) {
      if (c.control === "slider") expect(c.max).toBeGreaterThan(c.min!);
      if (c.control === "select") expect(c.options!.length).toBeGreaterThan(0);
    }
  });
});
