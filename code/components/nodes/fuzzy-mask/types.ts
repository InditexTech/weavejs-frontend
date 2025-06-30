// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { WeaveNodeTransformerProperties } from "@inditextech/weave-types";

export type FuzzyMaskProperties = {
  transform: WeaveNodeTransformerProperties;
};

export type FuzzyMaskNodeParams = {
  config: Partial<FuzzyMaskProperties>;
};

export type FuzzyMaskCircle = { x: number; y: number; radius: number };
