// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { getOneTrustConfig } from "./onetrust";

describe("getOneTrustConfig", () => {
  it("resolves dev", () => {
    const c = getOneTrustConfig("dev");
    expect(c?.domainId).toBe("01a212a5-64d4-7234-8198-fe3033eae3b4");
  });

  it("resolves pro", () => {
    const c = getOneTrustConfig("pro");
    expect(c?.domainId).toBe("01a20d38-4629-711e-afd3-95befbf4127e");
  });

  it("uses the same id in the auto-block URL", () => {
    for (const env of ["dev", "pro"]) {
      const c = getOneTrustConfig(env)!;
      expect(c.autoBlockSrc).toBe(
        `https://cdn.cookielaw.org/consent/${c.domainId}/OtAutoBlock.js`,
      );
    }
  });

  it.each([undefined, null, "", "DEV", "prod", "staging", "toString", 1])(
    "returns undefined for %s",
    (v) => expect(getOneTrustConfig(v)).toBeUndefined(),
  );
});
