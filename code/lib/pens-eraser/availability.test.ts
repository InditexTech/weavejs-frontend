// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

async function load(enabled: boolean, supported: boolean) {
  vi.resetModules();
  vi.doMock("./flag", () => ({ PENS_AND_ERASER_ENABLED: enabled }));
  vi.doMock("./sdk", () => ({ PENS_AND_ERASER_SUPPORTED: supported }));
  return (await import("./availability")).PENS_AND_ERASER_AVAILABLE;
}

describe("PENS_AND_ERASER_AVAILABLE", () => {
  afterEach(() => {
    vi.doUnmock("./flag");
    vi.doUnmock("./sdk");
    vi.resetModules();
  });

  it("needs the flag and an SDK that has the features", async () => {
    expect(await load(true, true)).toBe(true);
    expect(await load(true, false)).toBe(false);
    expect(await load(false, true)).toBe(false);
    expect(await load(false, false)).toBe(false);
  });
});
