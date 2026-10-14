// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { beforeAll, describe, expect, it } from "vitest";
import Konva from "konva";
import { DimensionNode } from "./dimension";
import {
  DEFAULT_DIMENSION_OFFSET,
  DEFAULT_DIMENSION_PRECISION,
  DEFAULT_DIMENSION_STROKE,
  DEFAULT_DIMENSION_STROKE_WIDTH,
  DEFAULT_DIMENSION_TERMINATOR,
  DEFAULT_DIMENSION_UNIT,
  DEFAULT_DIMENSION_UNIT_PER_PIXEL,
  DIMENSION_NODE_TYPE,
  DIMENSION_TERMINATOR,
  DIMENSION_UNIT,
} from "./constants";

beforeAll(() => {
  // Mock canvas 2D context for JSDOM in Vitest
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (contextType === "2d") {
      return {
        measureText: (text: string) => ({ width: text.length * 10 }),
        fillText: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        clearRect: () => {},
        setTransform: () => {},
        resetTransform: () => {},
        font: "",
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

describe("DimensionNode", () => {
  it("initializes with correct constants and nodeType", () => {
    const node = new DimensionNode();
    expect(DIMENSION_NODE_TYPE).toBe("dimension");
    expect(DEFAULT_DIMENSION_STROKE).toBe("#0284C7");
    expect(DEFAULT_DIMENSION_STROKE_WIDTH).toBe(1.5);
    expect(DEFAULT_DIMENSION_TERMINATOR).toBe("tick");
    expect(DEFAULT_DIMENSION_UNIT).toBe("m");
    expect(DEFAULT_DIMENSION_UNIT_PER_PIXEL).toBe(0.01);
    expect(DEFAULT_DIMENSION_PRECISION).toBe(2);
    expect(DEFAULT_DIMENSION_OFFSET).toBe(24);
    expect(node).toBeInstanceOf(DimensionNode);
  });

  describe("Geometry and Math calculations", () => {
    it("calculates Euclidean distance and perpendicular offset accurately", () => {
      const node = new DimensionNode();
      // Horizontal segment (0, 0) -> (300, 0) with offset 20
      const geom = node.calculateGeometry(0, 0, 300, 0, 20);

      expect(geom.distance).toBe(300);
      expect(geom.ux).toBe(1);
      expect(geom.uy).toBe(0);
      expect(geom.nx).toBe(-0);
      expect(geom.ny).toBe(1);

      // Offset points shifted by +20 along normal (y-axis)
      expect(geom.p1OffX).toBe(0);
      expect(geom.p1OffY).toBe(20);
      expect(geom.p2OffX).toBe(300);
      expect(geom.p2OffY).toBe(20);

      // Midpoint
      expect(geom.midX).toBe(150);
      expect(geom.midY).toBe(20);
      expect(geom.angleDeg).toBe(0);
    });

    it("keeps text angle upright when line is oriented right-to-left", () => {
      const node = new DimensionNode();
      // Right to left line (300, 0) -> (0, 0)
      const geom = node.calculateGeometry(300, 0, 0, 0, 20);
      // Angle should be flipped by 180 degrees to remain upright (0 deg instead of 180 deg)
      expect(geom.angleDeg).toBe(0);
    });
  });

  describe("Measurement formatting", () => {
    it("formats distances across metric and imperial units", () => {
      const node = new DimensionNode();
      const pixelDist = 250; // 250px * 0.01 = 2.50m

      expect(node.formatMeasurement(pixelDist, DIMENSION_UNIT.M, 0.01, 2)).toBe("2.50 m");
      expect(node.formatMeasurement(pixelDist, DIMENSION_UNIT.CM, 0.01, 1)).toBe("250.0 cm");
      expect(node.formatMeasurement(pixelDist, DIMENSION_UNIT.MM, 0.01, 0)).toBe("2500 mm");

      // Custom label prefix
      expect(node.formatMeasurement(pixelDist, DIMENSION_UNIT.M, 0.01, 2, "STORE FRONT:")).toBe(
        "STORE FRONT: 2.50 m",
      );
    });
  });

  describe("Rendering", () => {
    it("renders Konva Group with main dimension line, witness lines, ticks, and badge", () => {
      const node = new DimensionNode();
      const group = node.onRender({
        id: "dim-1",
        fromX: 50,
        fromY: 100,
        toX: 250,
        toY: 100,
        offset: 30,
        terminator: DIMENSION_TERMINATOR.TICK,
      });

      expect(group).toBeInstanceOf(Konva.Group);
      expect(group.name()).toBe("node");

      // Verify dimension line
      const dimLine = group.findOne("#dim-1-dimension-line") as Konva.Line;
      expect(dimLine).toBeDefined();
      expect(dimLine.points()).toEqual([50, 130, 250, 130]);

      // Verify witness lines
      const witness1 = group.findOne("#dim-1-witness-1") as Konva.Line;
      const witness2 = group.findOne("#dim-1-witness-2") as Konva.Line;
      expect(witness1).toBeDefined();
      expect(witness2).toBeDefined();

      // Verify ticks
      const tick1 = group.findOne("#dim-1-tick-1") as Konva.Line;
      const tick2 = group.findOne("#dim-1-tick-2") as Konva.Line;
      expect(tick1).toBeDefined();
      expect(tick2).toBeDefined();

      // Verify badge text
      const badgeText = group.findOne("#dim-1-badge-text") as Konva.Text;
      expect(badgeText).toBeDefined();
      // 200px * 0.01 = 2.00 m
      expect(badgeText.text()).toBe("2.00 m");
    });

    it("renders arrow terminators when terminator is arrow", () => {
      const node = new DimensionNode();
      const group = node.onRender({
        id: "dim-arrow",
        fromX: 0,
        fromY: 0,
        toX: 100,
        toY: 0,
        terminator: DIMENSION_TERMINATOR.ARROW,
      });

      const arrow1 = group.findOne("#dim-arrow-arrow-1") as Konva.Line;
      const arrow2 = group.findOne("#dim-arrow-arrow-2") as Konva.Line;
      expect(arrow1).toBeDefined();
      expect(arrow2).toBeDefined();
    });

    it("renders dot terminators when terminator is dot", () => {
      const node = new DimensionNode();
      const group = node.onRender({
        id: "dim-dot",
        fromX: 0,
        fromY: 0,
        toX: 100,
        toY: 0,
        terminator: DIMENSION_TERMINATOR.DOT,
      });

      const dot1 = group.findOne("#dim-dot-dot-1") as Konva.Circle;
      const dot2 = group.findOne("#dim-dot-dot-2") as Konva.Circle;
      expect(dot1).toBeDefined();
      expect(dot2).toBeDefined();
    });

    it("provides transformer configuration with 4 corner anchors", () => {
      const node = new DimensionNode();
      const group = node.onRender({
        id: "dim-anchors",
        fromX: 0,
        fromY: 0,
        toX: 100,
        toY: 0,
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const anchors = group.allowedAnchors();
      expect(anchors).toEqual(["top-left", "top-right", "bottom-left", "bottom-right"]);
    });
  });

  describe("Updating", () => {
    it("dynamically recalculates geometry and badge text on onUpdate", () => {
      const node = new DimensionNode();
      const group = node.onRender({
        id: "dim-update",
        fromX: 0,
        fromY: 0,
        toX: 200,
        toY: 0,
        offset: 20,
        unit: DIMENSION_UNIT.M,
      });

      const badgeTextBefore = group.findOne("#dim-update-badge-text") as Konva.Text;
      expect(badgeTextBefore.text()).toBe("2.00 m");

      // Update endpoints to (0, 0) -> (450, 0) and unit to cm
      node.onUpdate(group, {
        id: "dim-update",
        fromX: 0,
        fromY: 0,
        toX: 450,
        toY: 0,
        offset: 25,
        unit: DIMENSION_UNIT.CM,
        customLabel: "FACADE:",
      });

      const dimLine = group.findOne("#dim-update-dimension-line") as Konva.Line;
      expect(dimLine.points()).toEqual([0, 25, 450, 25]);

      const badgeTextAfter = group.findOne("#dim-update-badge-text") as Konva.Text;
      // 450px * 0.01 = 4.5m -> 450.00 cm (default precision 2)
      expect(badgeTextAfter.text()).toBe("FACADE: 450.00 cm");
    });
  });
});
