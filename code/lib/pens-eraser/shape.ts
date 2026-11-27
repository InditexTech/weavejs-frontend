// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/** The shapes the stroke eraser can have. */
export const ERASER_SHAPES = ["circle", "square"] as const;

export type EraserShape = (typeof ERASER_SHAPES)[number];

export const DEFAULT_ERASER_SHAPE: EraserShape = "circle";

export const ERASER_SHAPE_LABELS: Record<EraserShape, string> = {
  circle: "Circle",
  square: "Square",
};

export function toEraserShape(value: unknown): EraserShape | undefined {
  return ERASER_SHAPES.find((shape) => shape === value);
}
