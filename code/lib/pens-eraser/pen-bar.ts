// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { STROKE_ERASER_TOOL } from "./tool";

export const BRUSH_TOOL = "brushTool";

/** The pen bar is shown while one of these tools is active. */
export function isPenBarTool(action: string | undefined): boolean {
  return action === BRUSH_TOOL || action === STROKE_ERASER_TOOL;
}

export const PEN_BAR_COLORS = [
  "#000000",
  "#6b6b6b",
  "#ffffff",
  "#e03131",
  "#f76707",
  "#fcc419",
  "#2f9e44",
  "#0c8599",
  "#1c7ed6",
  "#5f3dc4",
  "#ae3ec9",
  "#d6336c",
] as const;

export const BRUSH_MIN_SIZE = 1;
export const BRUSH_MAX_SIZE = 50;

/** The 8-digit hex colour the brush tool uses: `#rrggbbaa`, opaque by default. */
export function toStrokeColor(color: string): string {
  const hex = color.trim().toLowerCase();
  if (/^#[0-9a-f]{8}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{6}$/.test(hex)) return `${hex}ff`;
  return "#000000ff";
}

export function clampBrushSize(value: number): number {
  if (!Number.isFinite(value)) return BRUSH_MIN_SIZE;
  return Math.min(BRUSH_MAX_SIZE, Math.max(BRUSH_MIN_SIZE, Math.round(value)));
}

export const MIN_OPACITY = 0.05;

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(MIN_OPACITY, Math.round(value * 100) / 100));
}

/** `#rrggbbaa` or `#rrggbb` as the `#rrggbb` the colour chips compare with. */
export function toInk(color: string): string {
  return toStrokeColor(color).slice(0, 7);
}
