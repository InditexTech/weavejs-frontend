// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from "vitest";
import { DimensionToolAction } from "./dimension-tool";
import { DIMENSION_ACTION_NAME } from "./constants";
import {
  DEFAULT_DIMENSION_STROKE,
  DEFAULT_DIMENSION_STROKE_WIDTH,
  DEFAULT_DIMENSION_TERMINATOR,
  DEFAULT_DIMENSION_UNIT,
  DEFAULT_DIMENSION_PRECISION,
} from "@/components/nodes/dimension/constants";

describe("DimensionToolAction", () => {
  it("returns correct action name", () => {
    const action = new DimensionToolAction();
    expect(action.getName()).toBe(DIMENSION_ACTION_NAME);
  });

  it("provides correct initial properties", () => {
    const action = new DimensionToolAction();
    const props = action.initProps();

    expect(props.stroke).toBe(DEFAULT_DIMENSION_STROKE);
    expect(props.strokeWidth).toBe(DEFAULT_DIMENSION_STROKE_WIDTH);
    expect(props.terminator).toBe(DEFAULT_DIMENSION_TERMINATOR);
    expect(props.unit).toBe(DEFAULT_DIMENSION_UNIT);
    expect(props.precision).toBe(DEFAULT_DIMENSION_PRECISION);
  });
});
