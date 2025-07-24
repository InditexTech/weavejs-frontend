// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Vector2d } from "konva/lib/types";
import { COLOR_TOKEN_TOOL_STATE } from "./constants";

export type ColorTokenToolActionStateKeys = keyof typeof COLOR_TOKEN_TOOL_STATE;
export type ColorTokenToolActionState =
  (typeof COLOR_TOKEN_TOOL_STATE)[ColorTokenToolActionStateKeys];

export type ColorTokenToolActionOnAddingEvent = undefined;
export type ColorTokenToolActionOnAddedEvent = undefined;

export type ColorTokenToolActionTriggerParams = {
  color?: string;
  position?: Vector2d;
};
