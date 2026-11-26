// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveStrokeEraserToolAction } from "@inditextech/weave-sdk";
import { PENS_AND_ERASER_ENABLED } from "./flag";

/** The stroke eraser action, registered only when the feature flag is on. */
export function strokeEraserActions(enabled = PENS_AND_ERASER_ENABLED) {
  return enabled ? [new WeaveStrokeEraserToolAction()] : [];
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
