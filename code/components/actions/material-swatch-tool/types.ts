// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { MaterialSwatchAttributes } from "@/components/nodes/material-swatch/types";
import { MATERIAL_SWATCH_TOOL_STATE } from "./constants";

export type MaterialSwatchToolActionState =
  (typeof MATERIAL_SWATCH_TOOL_STATE)[keyof typeof MATERIAL_SWATCH_TOOL_STATE];

export type MaterialSwatchToolActionTriggerParams =
  Partial<MaterialSwatchAttributes> & {
    position?: { x: number; y: number };
  };

export type MaterialSwatchToolActionOnAddingEvent = {
  element: MaterialSwatchAttributes;
};

export type MaterialSwatchToolActionOnAddedEvent = {
  element: MaterialSwatchAttributes;
};
