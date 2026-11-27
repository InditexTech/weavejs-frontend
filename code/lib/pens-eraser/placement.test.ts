// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { penBarInsets } from "./placement";

describe("penBarInsets", () => {
  it("keeps clear of both sidebars in the fixed layout", () => {
    expect(penBarInsets("fixed", false)).toEqual({
      insetLeft: 500,
      insetRight: 500,
    });
    expect(penBarInsets(undefined, false)).toEqual({
      insetLeft: 500,
      insetRight: 500,
    });
  });

  it("uses the whole canvas in the floating layout", () => {
    expect(penBarInsets("floating", false)).toEqual({
      insetLeft: 0,
      insetRight: 0,
    });
  });

  it("keeps clear of the floating sidebar while it is open", () => {
    expect(penBarInsets("floating", true)).toEqual({
      insetLeft: 0,
      insetRight: 508,
    });
  });
});
