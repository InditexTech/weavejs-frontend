// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/** Eraser diameter limits, in screen pixels. */
export const STROKE_ERASER_MIN_SIZE = 2;
export const STROKE_ERASER_MAX_SIZE = 200;
export const STROKE_ERASER_DEFAULT_SIZE = 24;

export function clampEraserSize(value: number): number {
  if (!Number.isFinite(value)) return STROKE_ERASER_DEFAULT_SIZE;
  return Math.min(
    STROKE_ERASER_MAX_SIZE,
    Math.max(STROKE_ERASER_MIN_SIZE, Math.round(value)),
  );
}
