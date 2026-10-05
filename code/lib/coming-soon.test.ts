// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { isAllowedPath } from "./coming-soon";

describe("isAllowedPath", () => {
  it.each([
    "/v1/liveness",
    "/v1/readiness/",
    "/weavebff/api/v1/x",
    "/coming-soon",
    "/fonts/inter-regular.ttf",
    "/favicon.ico",
  ])("allows %s", (p) => expect(isAllowedPath(p)).toBe(true));

  it.each(["/", "/rooms/abc", "/use-cases/x", "/v1x", "/coming-soonx"])(
    "blocks %s",
    (p) => expect(isAllowedPath(p)).toBe(false),
  );
});
