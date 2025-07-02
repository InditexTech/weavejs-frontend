// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { FUZZY_MASK_TOOL_STATE } from "./constants";

export type FuzzyMaskToolActionStateKeys = keyof typeof FUZZY_MASK_TOOL_STATE;
export type FuzzyMaskToolActionState =
  (typeof FUZZY_MASK_TOOL_STATE)[FuzzyMaskToolActionStateKeys];

export type FuzzyMaskCircle = {
  x: number;
  y: number;
  radius: number;
};
