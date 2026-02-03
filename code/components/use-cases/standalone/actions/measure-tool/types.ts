// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { MEASURE_TOOL_STATE } from "./constants";
import type { DeepPartial } from "@inditextech/weave-types";

export type MeasureToolActionStateKeys = keyof typeof MEASURE_TOOL_STATE;
export type MeasureToolActionState =
  (typeof MEASURE_TOOL_STATE)[MeasureToolActionStateKeys];

export type MeasureToolProperties = {
  style: {
    stroke: string;
  };
};

export type MeasureToolParams = {
  config: DeepPartial<MeasureToolProperties>;
};
