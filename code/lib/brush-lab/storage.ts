// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/**
 * The lab saves its *configuration* (profiles and look) so a reload keeps
 * the tester's settings. It never saves strokes, samples or recordings: the
 * only thing written is the configuration document the SDK exports.
 */
export const BRUSH_LAB_STORAGE_KEY = "weave.brushLab.config";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

/** Saves a configuration document (JSON text). Returns whether it was saved. */
export function saveBrushLabConfig(
  json: string,
  storage: StorageLike | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(BRUSH_LAB_STORAGE_KEY, json);
    return true;
  } catch {
    return false;
  }
}

/** The saved configuration document (JSON text), if there is a readable one. */
export function loadBrushLabConfig(
  storage: StorageLike | null = defaultStorage(),
): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(BRUSH_LAB_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearBrushLabConfig(
  storage: StorageLike | null = defaultStorage(),
): void {
  try {
    storage?.removeItem(BRUSH_LAB_STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}
