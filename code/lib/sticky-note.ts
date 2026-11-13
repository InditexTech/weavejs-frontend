// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

// Sticky note is only available in builds made with VITE_STICKY_NOTE=true
// while InditexTech/weavejs#1233 is under review.
export const STICKY_NOTE_ENABLED = import.meta.env.VITE_STICKY_NOTE === "true";

export const STICKY_NOTE_TOOL_NAME = "stickyNoteTool";
