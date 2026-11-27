// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { STROKE_ERASER_TOOL_ACTION_NAME } from "./sdk";

export const STROKE_ERASER_TOOL = STROKE_ERASER_TOOL_ACTION_NAME;
export const STROKE_ERASER_LABEL = "Stroke eraser";

/** Tools during which the stage can still be zoomed. */
export const ZOOM_ALLOWED_ACTIONS: string[] = [
  "selectionTool",
  "moveTool",
  "eraserTool",
  STROKE_ERASER_TOOL,
];

export function isZoomingAllowed(action: string | undefined): boolean {
  if (action === undefined) {
    return true;
  }
  return ZOOM_ALLOWED_ACTIONS.includes(action);
}
