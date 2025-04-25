// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveActionCallbacks } from "@inditextech/weavejs-sdk";
import { PANTONE_TOOL_STATE } from "./constants";

export type PantoneToolActionStateKeys = keyof typeof PANTONE_TOOL_STATE;
export type PantoneToolActionState =
  (typeof PANTONE_TOOL_STATE)[PantoneToolActionStateKeys];

export type PantoneToolCallbacks = WeaveActionCallbacks;

export type PantoneToolActionTriggerParams = {
  color?: string;
};
