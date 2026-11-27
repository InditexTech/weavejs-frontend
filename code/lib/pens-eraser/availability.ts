// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PENS_AND_ERASER_ENABLED } from "./flag";
import { PENS_AND_ERASER_SUPPORTED } from "./sdk";

/** The pens and the stroke eraser show up only when asked for and supported by the SDK. */
export const PENS_AND_ERASER_AVAILABLE =
  PENS_AND_ERASER_ENABLED && PENS_AND_ERASER_SUPPORTED;
