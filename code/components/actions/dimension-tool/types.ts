// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Vector2d } from "konva/lib/types";
import { DIMENSION_TOOL_STATE } from "./constants";
import { DimensionTerminatorType, DimensionUnitType } from "@/components/nodes/dimension/types";

export type DimensionToolActionState =
  (typeof DIMENSION_TOOL_STATE)[keyof typeof DIMENSION_TOOL_STATE];

export interface DimensionToolActionTriggerParams {
  stroke?: string;
  unit?: DimensionUnitType;
  unitPerPixel?: number;
  terminator?: DimensionTerminatorType;
  position?: Vector2d;
}

export type DimensionToolActionOnAddingEvent = "onAddingDimension";
export type DimensionToolActionOnAddedEvent = "onAddedDimension";
