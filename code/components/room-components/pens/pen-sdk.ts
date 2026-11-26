// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { inkFor, usePens } from "@/store/pens";
import { penDefaultSize } from "@/lib/pens-eraser/pen-defaults";
import { BRUSH_TOOL, toStrokeColor } from "@/lib/pens-eraser/pen-bar";

type Writer = {
  updatePropsAction: (name: string, props: Record<string, unknown>) => void;
};

type Brush = {
  setInstrument: (id: never) => { applied: boolean };
};

/**
 * Writes what the bar remembers for the chosen pen to the brush tool, in the
 * order that works: activating the brush resets its props, and
 * `setInstrument` scales the pen's tapers from the width and resets the
 * opacity, so the width and colour go first and the opacity last.
 */
export function applyPenMemory(instance: Writer, brush: Brush): void {
  const state = usePens.getState();
  const pen = state.pen;
  if (!pen) return;

  const tuned = state.tuned[pen];
  instance.updatePropsAction(BRUSH_TOOL, {
    strokeWidth: tuned?.size ?? penDefaultSize(pen),
    stroke: toStrokeColor(inkFor(state, pen)),
  });
  brush.setInstrument(pen as never);
  if (tuned?.opacity !== undefined) {
    instance.updatePropsAction(BRUSH_TOOL, { opacity: tuned.opacity });
  }
}
