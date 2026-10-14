// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const MINIMAP_HUD_PLUGIN_KEY = "minimapHUDPlugin";

export const DEFAULT_MINIMAP_WIDTH = 260;
export const DEFAULT_MINIMAP_HEIGHT = 160;
export const MINIMAP_MARGIN_PADDING = 24;

export const MINIMAP_HUD_THEME = {
  LIGHT: {
    bg: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.12)",
    nodeDefault: "#94A3B8",
    nodeFrame: "rgba(99, 102, 241, 0.2)",
    viewportFill: "rgba(2, 132, 199, 0.18)",
    viewportStroke: "#0284C7",
    viewportHandle: "#0369A1",
    collaboratorRing: "#FFFFFF",
  },
  DARK: {
    bg: "#18181B",
    border: "rgba(255, 255, 255, 0.15)",
    nodeDefault: "#64748B",
    nodeFrame: "rgba(129, 140, 248, 0.25)",
    viewportFill: "rgba(56, 189, 248, 0.22)",
    viewportStroke: "#38BDF8",
    viewportHandle: "#0EA5E9",
    collaboratorRing: "#18181B",
  },
} as const;
