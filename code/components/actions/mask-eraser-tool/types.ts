// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { MASK_ERASER_TOOL_STATE } from "./constants";

export type MaskEraserToolActionStateKeys = keyof typeof MASK_ERASER_TOOL_STATE;
export type MaskEraserToolActionState =
  (typeof MASK_ERASER_TOOL_STATE)[MaskEraserToolActionStateKeys];
