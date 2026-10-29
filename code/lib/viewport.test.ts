// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { VIEWPORT_CONTENT } from "./viewport";

describe("viewport", () => {
  it("stops the page from zooming so a pinch zooms the canvas", () => {
    expect(VIEWPORT_CONTENT).toContain("maximum-scale=1");
    expect(VIEWPORT_CONTENT).toContain("user-scalable=no");
  });
});
