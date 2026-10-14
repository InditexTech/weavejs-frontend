// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll } from "vitest";
import Konva from "konva";
import { SmartGuidesPlugin } from "./smart-guides";
import { SMART_GUIDES_PLUGIN_KEY } from "./constants";
import { RectBounds } from "./types";

beforeAll(() => {
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = (() => ({
      measureText: (text: string) => ({
        width: text.length * 8,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 2,
      }),
      fillText: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
      setTransform: () => {},
      resetTransform: () => {},
      arc: () => {},
      arcTo: () => {},
      bezierCurveTo: () => {},
      quadraticCurveTo: () => {},
      drawImage: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => null,
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      putImageData: () => {},
      font: "",
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
});

describe("SmartGuidesPlugin", () => {
  it("initializes with correct plugin key and default configuration", () => {
    const plugin = new SmartGuidesPlugin();
    expect(plugin.getName()).toBe(SMART_GUIDES_PLUGIN_KEY);
    expect(plugin.isEnabled()).toBe(true);
  });

  it("toggles enabled state correctly", () => {
    const plugin = new SmartGuidesPlugin();
    expect(plugin.isEnabled()).toBe(true);
    plugin.disable();
    expect(plugin.isEnabled()).toBe(false);
    plugin.enable();
    expect(plugin.isEnabled()).toBe(true);
    expect(plugin.toggle()).toBe(false);
    expect(plugin.toggle()).toBe(true);
  });

  describe("Alignment Guide Calculations", () => {
    const plugin = new SmartGuidesPlugin({
      config: { snapTolerance: 6 },
    });

    it("detects left-to-left edge alignment and snaps", () => {
      const targetRect: RectBounds = { x: 103, y: 50, width: 100, height: 100 };
      const siblingRects: RectBounds[] = [
        { x: 100, y: 200, width: 80, height: 80 },
      ];

      const { guides, snapX, snapY } = plugin.findAlignments(targetRect, siblingRects);

      expect(snapX).toBe(3); // 103 - 100 = 3
      expect(snapY).toBe(0);
      expect(guides).toHaveLength(1);
      expect(guides[0].orientation).toBe("vertical");
      expect(guides[0].position).toBe(100);
      expect(guides[0].start).toBe(50);
      expect(guides[0].end).toBe(280);
    });

    it("detects center-to-center alignment and snaps", () => {
      // Target center is 200 + 40 = 240; Sibling center is 182 + 60 = 242 (delta = -2)
      // Left-to-left is 200 - 182 = 18 (> 6), Right-to-right is 280 - 302 = -22 (> 6)
      const targetRect: RectBounds = { x: 200, y: 100, width: 80, height: 100 };
      const siblingRects: RectBounds[] = [
        { x: 182, y: 300, width: 120, height: 100 },
      ];

      const { guides, snapX } = plugin.findAlignments(targetRect, siblingRects);

      expect(snapX).toBe(-2);
      expect(guides).toHaveLength(1);
      expect(guides[0].orientation).toBe("vertical");
      expect(guides[0].position).toBe(242);
    });

    it("detects top-to-top horizontal edge alignment", () => {
      const targetRect: RectBounds = { x: 50, y: 102, width: 100, height: 60 };
      const siblingRects: RectBounds[] = [
        { x: 200, y: 100, width: 120, height: 80 },
      ];

      const { guides, snapX, snapY } = plugin.findAlignments(targetRect, siblingRects);

      expect(snapX).toBe(0);
      expect(snapY).toBe(2); // 102 - 100 = 2
      expect(guides).toHaveLength(1);
      expect(guides[0].orientation).toBe("horizontal");
      expect(guides[0].position).toBe(100);
    });

    it("ignores candidates beyond snap tolerance", () => {
      const targetRect: RectBounds = { x: 300, y: 300, width: 50, height: 50 };
      const siblingRects: RectBounds[] = [
        { x: 100, y: 100, width: 50, height: 50 },
      ];

      const { guides, snapX, snapY } = plugin.findAlignments(targetRect, siblingRects);

      expect(guides).toHaveLength(0);
      expect(snapX).toBe(0);
      expect(snapY).toBe(0);
    });
  });

  describe("Equidistant Gap Detection", () => {
    const plugin = new SmartGuidesPlugin({
      config: { snapTolerance: 6, showGapDistances: true },
    });

    it("detects equidistant horizontal spacing between three nodes", () => {
      // Left box: x = 0..100
      // Target box: x = 198..298 (gapLeft = 98)
      // Right box: x = 400..500 (gapRight = 102)
      // Target gap = 100, diff = 4 <= 12
      const targetRect: RectBounds = { x: 198, y: 100, width: 100, height: 60 };
      const siblingRects: RectBounds[] = [
        { x: 0, y: 100, width: 100, height: 60 },
        { x: 400, y: 100, width: 100, height: 60 },
      ];

      const match = plugin.findEquidistantGaps(targetRect, siblingRects);

      expect(match).not.toBeNull();
      expect(match?.axis).toBe("horizontal");
      expect(match?.distance).toBe(100);
      expect(match?.snapDelta).toBe(-2);
    });

    it("detects equidistant vertical spacing between three nodes", () => {
      // Top box: y = 0..80
      // Target box: y = 129..209 (gapTop = 49)
      // Bottom box: y = 260..340 (gapBottom = 51)
      const targetRect: RectBounds = { x: 50, y: 129, width: 80, height: 80 };
      const siblingRects: RectBounds[] = [
        { x: 50, y: 0, width: 80, height: 80 },
        { x: 50, y: 260, width: 80, height: 80 },
      ];

      const match = plugin.findEquidistantGaps(targetRect, siblingRects);

      expect(match).not.toBeNull();
      expect(match?.axis).toBe("vertical");
      expect(match?.distance).toBe(50);
      expect(match?.snapDelta).toBe(-1);
    });

    it("returns null when fewer than two sibling nodes are present", () => {
      const targetRect: RectBounds = { x: 100, y: 100, width: 50, height: 50 };
      const siblingRects: RectBounds[] = [
        { x: 0, y: 100, width: 50, height: 50 },
      ];

      const match = plugin.findEquidistantGaps(targetRect, siblingRects);
      expect(match).toBeNull();
    });
  });

  describe("Rendering & Layer Management", () => {
    it("renders guide lines and clears them properly", () => {
      const stage = new Konva.Stage({
        container: document.createElement("div"),
        width: 800,
        height: 600,
      });

      const plugin = new SmartGuidesPlugin();
      // Attach mock instance
      (plugin as unknown as { instance: { getStage: () => Konva.Stage } }).instance = {
        getStage: () => stage,
      };

      plugin.onInit();

      const layer = stage.findOne("#smart-guides-layer") as Konva.Layer;
      expect(layer).toBeDefined();

      plugin.renderGuides(
        [
          {
            orientation: "vertical",
            position: 150,
            start: 50,
            end: 250,
            snapDelta: 2,
          },
        ],
        null,
      );

      expect(layer.children.length).toBe(1);

      plugin.clearGuides();
      expect(layer.children.length).toBe(0);
    });
  });
});
