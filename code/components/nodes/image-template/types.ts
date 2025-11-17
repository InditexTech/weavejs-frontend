// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { IMAGE_TEMPLATE_FIT } from "./constants";

export type ImageTemplateFitKeys = keyof typeof IMAGE_TEMPLATE_FIT;
export type ImageTemplateFit =
  (typeof IMAGE_TEMPLATE_FIT)[ImageTemplateFitKeys];
