// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { COLOR_TOKEN_TOOL_STATE } from "./constants";

export type ColorTokenToolActionStateKeys = keyof typeof COLOR_TOKEN_TOOL_STATE;
export type ColorTokenToolActionState =
  (typeof COLOR_TOKEN_TOOL_STATE)[ColorTokenToolActionStateKeys];

export type ColorTokenToolActionTriggerParams = {
  color?: string;
};
