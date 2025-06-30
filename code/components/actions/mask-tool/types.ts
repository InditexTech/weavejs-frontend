// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { MASK_TOOL_STATE } from "./constants";

export type MaskToolActionStateKeys = keyof typeof MASK_TOOL_STATE;
export type MaskToolActionState =
  (typeof MASK_TOOL_STATE)[MaskToolActionStateKeys];
