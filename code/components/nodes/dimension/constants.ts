// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const DIMENSION_NODE_TYPE = "dimension";

export const DIMENSION_TERMINATOR = {
  TICK: "tick",
  ARROW: "arrow",
  DOT: "dot",
} as const;

export const DIMENSION_UNIT = {
  M: "m",
  CM: "cm",
  MM: "mm",
  FT: "ft",
  IN: "in",
} as const;

export const DEFAULT_DIMENSION_STROKE = "#0284C7";
export const DEFAULT_DIMENSION_STROKE_WIDTH = 1.5;
export const DEFAULT_DIMENSION_TERMINATOR = DIMENSION_TERMINATOR.TICK;
export const DEFAULT_DIMENSION_UNIT = DIMENSION_UNIT.M;
export const DEFAULT_DIMENSION_UNIT_PER_PIXEL = 0.01; // 100 pixels = 1 meter
export const DEFAULT_DIMENSION_PRECISION = 2;
export const DEFAULT_DIMENSION_OFFSET = 24;
export const DEFAULT_DIMENSION_TICK_SIZE = 12;
export const DEFAULT_DIMENSION_ARROW_SIZE = 9;
export const DEFAULT_DIMENSION_DOT_RADIUS = 3.5;
export const DEFAULT_DIMENSION_WITNESS_OVERHANG = 8;
export const DEFAULT_DIMENSION_WITNESS_GAP = 4;
export const DEFAULT_DIMENSION_FONT_SIZE = 11;
export const DEFAULT_DIMENSION_FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
