// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type SmartGuidesPluginConfig = {
  snapTolerance?: number;
  guideColor?: string;
  gapColor?: string;
  strokeWidth?: number;
  dash?: number[];
  showGapDistances?: boolean;
  enabled?: boolean;
};

export type SmartGuidesPluginParams = {
  config?: SmartGuidesPluginConfig;
};

export type RectBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AlignmentGuide = {
  orientation: "vertical" | "horizontal";
  position: number;
  start: number;
  end: number;
  snapDelta: number;
};

export type GapDistanceMatch = {
  axis: "horizontal" | "vertical";
  distance: number;
  rect1: RectBounds;
  rect2: RectBounds;
  rect3: RectBounds;
  snapDelta: number;
};
