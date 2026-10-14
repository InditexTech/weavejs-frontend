// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Vector2d } from "konva/lib/types";
import { STICKY_NOTE_TOOL_STATE } from "./constants";

export type StickyNoteToolActionState =
  (typeof STICKY_NOTE_TOOL_STATE)[keyof typeof STICKY_NOTE_TOOL_STATE];

export interface StickyNoteToolActionTriggerParams {
  color?: string;
  text?: string;
  position?: Vector2d;
  author?: string;
}

export type StickyNoteToolActionOnAddingEvent = "onAddingStickyNote";
export type StickyNoteToolActionOnAddedEvent = "onAddedStickyNote";
