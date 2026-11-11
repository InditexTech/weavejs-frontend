// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { readHeapMemory } from "./memory.toolbar";

describe("readHeapMemory", () => {
  it("reads the heap in megabytes where performance.memory exists", () => {
    const perf = {
      memory: {
        usedJSHeapSize: 5 * 1024 * 1024,
        totalJSHeapSize: 10 * 1024 * 1024,
      },
    } as unknown as Performance;
    expect(readHeapMemory(perf)).toEqual({ used: 5, total: 10 });
  });

  it("returns null, without throwing, on Safari and Firefox", () => {
    expect(readHeapMemory({} as Performance)).toBeNull();
    expect(
      readHeapMemory({ memory: undefined } as unknown as Performance),
    ).toBeNull();
    expect(readHeapMemory({ memory: {} } as unknown as Performance)).toBeNull();
  });
});
