// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const BRUSH_LAB_SEARCH_PARAM = "lab";
export const BRUSH_LAB_SEARCH_VALUE = "brush";

/**
 * The lab is a testers' tool: it exists only in builds made with
 * `VITE_BRUSH_LAB=true`. Without the flag the Weave instance is created
 * exactly as before and no menu entry is shown.
 */
export function isBrushLabEnabled(
  env: { VITE_BRUSH_LAB?: string } = import.meta.env as {
    VITE_BRUSH_LAB?: string;
  },
): boolean {
  return env.VITE_BRUSH_LAB === "true";
}

/** Whether the address asks for the lab panel to open on load (`?lab=brush`). */
export function isBrushLabRequested(search: string): boolean {
  return (
    new URLSearchParams(search).get(BRUSH_LAB_SEARCH_PARAM) ===
    BRUSH_LAB_SEARCH_VALUE
  );
}
