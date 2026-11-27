// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import * as sdkModule from "@inditextech/weave-sdk";
import type { WeaveAction } from "@inditextech/weave-sdk";

/**
 * The pens and the stroke eraser come from an SDK release newer than the one
 * this app is pinned to. They are read here, by name, so that the app still
 * builds and runs against an SDK that does not have them: the feature is then
 * simply not available (see `availability.ts`).
 */

export type PenInstrument = { id: string; label: string };

/** What the brush tool offers once the SDK has pens. */
export type BrushToolLike = {
  setInstrument(id: string): { applied: boolean; errors?: string[] };
  getInstrument(): string | null;
  getProps(): Record<string, unknown>;
};

function read<T>(key: string): T | undefined {
  try {
    return (sdkModule as unknown as Record<string, unknown>)[key] as
      T | undefined;
  } catch {
    return undefined;
  }
}

export const STROKE_ERASER_TOOL_ACTION_NAME =
  read<string>("STROKE_ERASER_TOOL_ACTION_NAME") ?? "strokeEraserTool";

export const BRUSH_INSTRUMENTS: PenInstrument[] =
  read<PenInstrument[]>("BRUSH_INSTRUMENTS") ?? [];

const StrokeEraserToolAction = read<new () => WeaveAction>(
  "WeaveStrokeEraserToolAction",
);

/** Whether the SDK in use has the pens and the stroke eraser. */
export const PENS_AND_ERASER_SUPPORTED =
  StrokeEraserToolAction !== undefined && BRUSH_INSTRUMENTS.length > 0;

export function createStrokeEraser(): WeaveAction | undefined {
  return StrokeEraserToolAction ? new StrokeEraserToolAction() : undefined;
}
