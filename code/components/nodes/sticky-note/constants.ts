// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const STICKY_NOTE_NODE_TYPE = "sticky-note";

export const DEFAULT_STICKY_NOTE_WIDTH = 220;
export const DEFAULT_STICKY_NOTE_HEIGHT = 220;
export const MIN_STICKY_NOTE_SIZE = 120;
export const DEFAULT_DOG_EAR_SIZE = 28;

export const STICKY_NOTE_PALETTE = {
  YELLOW: "#FEF3C7", // Classic soft canary
  MINT: "#D1FAE5", // Fresh sage/mint
  ROSE: "#FEE2E2", // Warm blush/rose
  LAVENDER: "#EDE9FE", // Soft violet/lavender
  SKY: "#E0F2FE", // Clean sky pastel
  AMBER: "#FDE68A", // Deep warm amber
  CORAL: "#FFEDD5", // Soft coral/peach
  WHITE: "#FFFFFF", // Crisp modern card
} as const;

export const DEFAULT_STICKY_NOTE_COLOR = STICKY_NOTE_PALETTE.YELLOW;
export const DEFAULT_STICKY_NOTE_TEXT = "New note...";
export const DEFAULT_STICKY_NOTE_FONT_FAMILY = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";
export const DEFAULT_STICKY_NOTE_FONT_SIZE = 16;
export const DEFAULT_STICKY_NOTE_LINE_HEIGHT = 1.4;
export const DEFAULT_STICKY_NOTE_TEXT_COLOR = "#1F2937";
