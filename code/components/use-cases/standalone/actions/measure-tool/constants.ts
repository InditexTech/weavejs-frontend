// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { MeasureToolProperties } from "./types";

export const MEASURE_TOOL_ACTION_NAME = "customMeasureTool";

export const MEASURE_TOOL_STATE = {
  ["IDLE"]: "idle",
  ["SET_FROM"]: "set_from",
  ["SET_TO"]: "set_to",
  ["FINISHED"]: "finished",
} as const;

export const MEASURE_TOOL_DEFAULT_CONFIG: MeasureToolProperties = {
  style: {
    stroke: "#FF3366",
  },
};
