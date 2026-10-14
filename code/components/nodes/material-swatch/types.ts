// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveElementAttributes } from "@inditextech/weave-types";
import { MATERIAL_CATEGORIES } from "./constants";

export type MaterialCategoryType =
  (typeof MATERIAL_CATEGORIES)[keyof typeof MATERIAL_CATEGORIES];

export type MaterialSwatchAttributes = WeaveElementAttributes & {
  materialName?: string;
  finishCode?: string;
  category?: MaterialCategoryType;
  color?: string;
  accentColor?: string;
  darkTheme?: boolean;
};
