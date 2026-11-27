// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Brush pens and the stroke eraser are only available in builds made with
 * `VITE_PENS_AND_ERASER=true`, until the SDK that ships them is released.
 */
export function isPensAndEraserEnabled(
  env: { VITE_PENS_AND_ERASER?: string } = import.meta.env as {
    VITE_PENS_AND_ERASER?: string;
  },
): boolean {
  return env.VITE_PENS_AND_ERASER === "true";
}

export const PENS_AND_ERASER_ENABLED = isPensAndEraserEnabled();
