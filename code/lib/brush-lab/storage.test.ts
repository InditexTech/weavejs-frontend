// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";
import {
  BRUSH_LAB_STORAGE_KEY,
  clearBrushLabConfig,
  loadBrushLabConfig,
  saveBrushLabConfig,
} from "./storage";

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: vi.fn((k: string, v: string) => void data.set(k, v)),
    removeItem: (k: string) => void data.delete(k),
  };
};

describe("brush lab storage", () => {
  it("restores what was saved, so a reload keeps the configuration", () => {
    const s = memory();
    expect(saveBrushLabConfig('{"version":1}', s)).toBe(true);
    expect(loadBrushLabConfig(s)).toBe('{"version":1}');
  });

  it("only ever writes under its one configuration key", () => {
    const s = memory();
    saveBrushLabConfig("{}", s);
    saveBrushLabConfig("{}", s);
    expect([...s.data.keys()]).toEqual([BRUSH_LAB_STORAGE_KEY]);
    expect(s.setItem).toHaveBeenCalledTimes(2);
  });

  it("clears the configuration", () => {
    const s = memory();
    saveBrushLabConfig("{}", s);
    clearBrushLabConfig(s);
    expect(loadBrushLabConfig(s)).toBeNull();
  });

  it("copes with no storage and with storage that throws", () => {
    expect(saveBrushLabConfig("{}", null)).toBe(false);
    expect(loadBrushLabConfig(null)).toBeNull();
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("full");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(saveBrushLabConfig("{}", broken)).toBe(false);
    expect(loadBrushLabConfig(broken)).toBeNull();
    expect(() => clearBrushLabConfig(broken)).not.toThrow();
  });
});
