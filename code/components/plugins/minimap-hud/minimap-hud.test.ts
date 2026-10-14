// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from "vitest";
import {
  calculateContentBounds,
  calculatePanToStagePosition,
  calculateViewportRect,
  clampViewportToMinimap,
  computeMinimapScaleAndOffset,
  MinimapHUDPlugin,
  projectMinimapToWorld,
  projectWorldToMinimap,
} from "./minimap-hud";
import {
  MINIMAP_HUD_PLUGIN_KEY,
} from "./constants";

describe("MinimapHUD pure calculation helpers", () => {
  it("calculates content bounds from a set of rectangular canvas items", () => {
    const items = [
      { x: 100, y: 50, width: 200, height: 100 },
      { x: 500, y: 400, width: 300, height: 200 },
    ];
    const bounds = calculateContentBounds(items);

    expect(bounds.minX).toBe(100);
    expect(bounds.minY).toBe(50);
    expect(bounds.maxX).toBe(800);
    expect(bounds.maxY).toBe(600);
    expect(bounds.width).toBe(700);
    expect(bounds.height).toBe(550);
  });

  it("handles empty item collections with fallback content bounds", () => {
    const bounds = calculateContentBounds([]);
    expect(bounds.width).toBeGreaterThanOrEqual(100);
    expect(bounds.height).toBeGreaterThanOrEqual(100);
  });

  it("computes uniform scale and center offsets to fit content in minimap", () => {
    const bounds = {
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 1000,
      width: 1000,
      height: 1000,
    };
    const metrics = computeMinimapScaleAndOffset(bounds, 200, 200, 20);

    // Available width = 160, available height = 160 -> scale = 0.16
    expect(metrics.scale).toBeCloseTo(0.16, 3);
    expect(metrics.offsetX).toBeGreaterThan(0);
    expect(metrics.offsetY).toBeGreaterThan(0);
  });

  it("maps world coordinates to minimap coordinates accurately", () => {
    const metrics = {
      scale: 0.1,
      offsetX: 10,
      offsetY: 20,
      contentBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000, width: 1000, height: 1000 },
    };

    const miniPos = projectWorldToMinimap(200, 300, metrics);
    expect(miniPos.x).toBe(30); // 200 * 0.1 + 10
    expect(miniPos.y).toBe(50); // 300 * 0.1 + 20
  });

  it("reverses minimap coordinates back to world space (bijection)", () => {
    const metrics = {
      scale: 0.25,
      offsetX: 15,
      offsetY: 25,
      contentBounds: { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 },
    };

    const originalWorld = { x: 450, y: 320 };
    const mini = projectWorldToMinimap(originalWorld.x, originalWorld.y, metrics);
    const restored = projectMinimapToWorld(mini.x, mini.y, metrics);

    expect(restored.x).toBeCloseTo(originalWorld.x, 2);
    expect(restored.y).toBeCloseTo(originalWorld.y, 2);
  });

  it("calculates viewport radar rectangle based on main stage camera", () => {
    const metrics = {
      scale: 0.1,
      offsetX: 0,
      offsetY: 0,
      contentBounds: { minX: 0, minY: 0, maxX: 2000, maxY: 2000, width: 2000, height: 2000 },
    };

    const stageWidth = 800;
    const stageHeight = 600;
    const stageScale = 1;
    const stagePosition = { x: -200, y: -100 }; // Viewport is at (200, 100) in world

    const viewport = calculateViewportRect(stageWidth, stageHeight, stageScale, stagePosition, metrics);

    expect(viewport.x).toBe(20); // 200 * 0.1
    expect(viewport.y).toBe(10); // 100 * 0.1
    expect(viewport.width).toBe(80); // 800 * 0.1
    expect(viewport.height).toBe(60); // 600 * 0.1
  });

  it("calculates panTo stage position to center world coordinate in viewport", () => {
    const targetWorld = { x: 500, y: 500 };
    const stageWidth = 1000;
    const stageHeight = 800;
    const stageScale = 1;

    const panPos = calculatePanToStagePosition(
      targetWorld.x,
      targetWorld.y,
      stageWidth,
      stageHeight,
      stageScale,
    );

    // stageWidth / 2 - target * 1 = 500 - 500 = 0
    expect(panPos.x).toBe(0);
    // stageHeight / 2 - target * 1 = 400 - 500 = -100
    expect(panPos.y).toBe(-100);
  });

  it("clamps viewport inside minimap canvas boundaries", () => {
    const clampedNegative = clampViewportToMinimap(-10, -5, 50, 40, 200, 150);
    expect(clampedNegative.x).toBe(0);
    expect(clampedNegative.y).toBe(0);

    const clampedOverflow = clampViewportToMinimap(180, 130, 50, 40, 200, 150);
    expect(clampedOverflow.x).toBe(150); // 200 - 50
    expect(clampedOverflow.y).toBe(110); // 150 - 40
  });
});

describe("MinimapHUDPlugin lifecycle and configuration", () => {
  it("initializes with correct plugin key and defaults", () => {
    const plugin = new MinimapHUDPlugin();
    expect(plugin.getName()).toBe(MINIMAP_HUD_PLUGIN_KEY);
    expect(plugin.isVisible()).toBe(true);
  });

  it("supports enable, disable and toggle methods", () => {
    const plugin = new MinimapHUDPlugin();
    expect(plugin.isVisible()).toBe(true);

    plugin.disable();
    expect(plugin.isVisible()).toBe(false);

    plugin.enable();
    expect(plugin.isVisible()).toBe(true);

    const toggledToFalse = plugin.toggle();
    expect(toggledToFalse).toBe(false);
    expect(plugin.isVisible()).toBe(false);

    const toggledToTrue = plugin.toggle();
    expect(toggledToTrue).toBe(true);
    expect(plugin.isVisible()).toBe(true);
  });

  it("accepts custom dimensions and theme configuration", () => {
    const customWidth = 320;
    const customHeight = 200;
    const plugin = new MinimapHUDPlugin({
      config: {
        width: customWidth,
        height: customHeight,
        theme: "dark",
      },
    });

    expect(plugin.getName()).toBe(MINIMAP_HUD_PLUGIN_KEY);
  });
});
