// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveElementAttributes } from "@inditextech/weave-types";
import { DIMENSION_TERMINATOR, DIMENSION_UNIT } from "./constants";

export type DimensionTerminatorType =
  (typeof DIMENSION_TERMINATOR)[keyof typeof DIMENSION_TERMINATOR];

export type DimensionUnitType =
  (typeof DIMENSION_UNIT)[keyof typeof DIMENSION_UNIT];

export interface DimensionAttributes extends WeaveElementAttributes {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  offset?: number;
  terminator?: DimensionTerminatorType;
  unit?: DimensionUnitType;
  unitPerPixel?: number;
  precision?: number;
  customLabel?: string;
  showWitnessLines?: boolean;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
}
