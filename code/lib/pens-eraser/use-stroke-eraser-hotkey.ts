// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useHotkey } from "@tanstack/react-hotkeys";
import { PENS_AND_ERASER_ENABLED } from "./flag";
import { STROKE_ERASER_SHORTCUT } from "./shortcut";
import { STROKE_ERASER_TOOL } from "./tool";

/** Activates the stroke eraser with its shortcut, only when the flag is on. */
export function useStrokeEraserHotkey(
  triggerTool: (toolName: string) => void,
  {
    enabled,
    flagEnabled = PENS_AND_ERASER_ENABLED,
  }: { enabled: boolean; flagEnabled?: boolean },
) {
  useHotkey(
    { ...STROKE_ERASER_SHORTCUT },
    () => triggerTool(STROKE_ERASER_TOOL),
    { enabled: enabled && flagEnabled },
  );
}
