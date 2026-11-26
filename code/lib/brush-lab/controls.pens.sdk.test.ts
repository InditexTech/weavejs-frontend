// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { buildControlGroups, type TunableLike } from "./controls";

const PEN_FIELDS: { scope: "profile" | "look"; path: string }[] = [
  { scope: "profile", path: "pressure.synth" },
  { scope: "look", path: "ends" },
  { scope: "look", path: "variance" },
  { scope: "look", path: "width.easing" },
  { scope: "look", path: "width.nibAngle" },
  { scope: "look", path: "width.nibContrast" },
];

describe("with the SDK's descriptors for the pens", () => {
  it("renders one control for every pen field", async () => {
    const mod =
      await import("@weave-sdk-src/actions/brush-tool/tunables/descriptors");
    const tunables = mod.BRUSH_TUNABLES as TunableLike[];
    const rendered = buildControlGroups(tunables).flatMap((g) => [
      ...g.basic,
      ...g.advanced,
    ]);

    for (const field of PEN_FIELDS) {
      const tunable = tunables.find(
        (t) => t.scope === field.scope && t.path.join(".") === field.path,
      );
      expect(tunable, `${field.scope} ${field.path}`).toBeDefined();
      expect(
        rendered.filter((c) => c.key === tunable!.key),
        `${field.scope} ${field.path}`,
      ).toHaveLength(1);
    }
  });
});
