// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveElementAttributes } from "@inditextech/weave-types";
import { STICKY_NOTE_PALETTE } from "./constants";

export type StickyNotePaletteColor =
  (typeof STICKY_NOTE_PALETTE)[keyof typeof STICKY_NOTE_PALETTE];

export interface StickyNoteAttributes extends WeaveElementAttributes {
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  fontColor?: string;
  author?: string;
  dogEarSize?: number;
}
