// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const IMAGES_TOOL_ACTION_NAME = "imagesTool";

export const IMAGES_TOOL_STATE = {
  ["IDLE"]: "idle",
  ["UPLOADING"]: "uploading",
  ["DEFINING_POSITION"]: "definingPosition",
  ["SELECTED_POSITION"]: "selectedPosition",
  ["ADDING"]: "adding",
  ["FINISHED"]: "finished",
} as const;
