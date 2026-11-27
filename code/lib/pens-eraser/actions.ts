// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { WeaveAction } from "@inditextech/weave-sdk";
import { PENS_AND_ERASER_AVAILABLE } from "./availability";
import { createStrokeEraser } from "./sdk";

/** The stroke eraser action, registered only when the feature is available. */
export function strokeEraserActions(): WeaveAction[] {
  if (!PENS_AND_ERASER_AVAILABLE) return [];
  const action = createStrokeEraser();
  return action ? [action] : [];
}

/** Action names registered more than once. */
export function findDuplicateActionNames(
  actions: { getName(): string }[],
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const action of actions) {
    const name = action.getName();
    if (seen.has(name)) duplicates.add(name);
    seen.add(name);
  }
  return [...duplicates];
}
