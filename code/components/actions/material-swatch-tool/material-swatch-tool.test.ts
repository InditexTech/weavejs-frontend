// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from "vitest";
import { MaterialSwatchToolAction } from "./material-swatch-tool";
import { MATERIAL_SWATCH_ACTION_NAME } from "./constants";
import {
  DEFAULT_MATERIAL_HEIGHT,
  DEFAULT_MATERIAL_WIDTH,
  RETAIL_MATERIAL_PRESETS,
} from "@/components/nodes/material-swatch/constants";

describe("MaterialSwatchToolAction", () => {
  it("returns correct action name", () => {
    const action = new MaterialSwatchToolAction();
    expect(action.getName()).toBe(MATERIAL_SWATCH_ACTION_NAME);
  });

  it("provides correct initial properties from default retail preset", () => {
    const action = new MaterialSwatchToolAction();
    const props = action.initProps();
    const defaultPreset = RETAIL_MATERIAL_PRESETS[0];

    expect(props.materialName).toBe(defaultPreset.name);
    expect(props.finishCode).toBe(defaultPreset.finish);
    expect(props.category).toBe(defaultPreset.category);
    expect(props.color).toBe(defaultPreset.color);
    expect(props.width).toBe(DEFAULT_MATERIAL_WIDTH);
    expect(props.height).toBe(DEFAULT_MATERIAL_HEIGHT);
  });
});
