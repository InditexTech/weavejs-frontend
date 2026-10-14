// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type MinimapThemeMode = "light" | "dark";

export interface MinimapHUDPluginConfig {
  width?: number;
  height?: number;
  padding?: number;
  theme?: MinimapThemeMode;
  interactiveRadar?: boolean;
  getContainer?: () => HTMLElement | null;
  id?: string;
}

export interface MinimapHUDPluginParams {
  config?: MinimapHUDPluginConfig;
}

export interface MinimapBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface MinimapTransformMetrics {
  scale: number;
  offsetX: number;
  offsetY: number;
  contentBounds: MinimapBoundingBox;
}

export interface ViewportRectMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
}
