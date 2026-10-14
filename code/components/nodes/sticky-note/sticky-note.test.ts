// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { beforeAll, describe, expect, it } from "vitest";
import Konva from "konva";
import { StickyNoteNode } from "./sticky-note";
import {
  DEFAULT_DOG_EAR_SIZE,
  DEFAULT_STICKY_NOTE_COLOR,
  DEFAULT_STICKY_NOTE_FONT_FAMILY,
  DEFAULT_STICKY_NOTE_FONT_SIZE,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_TEXT,
  DEFAULT_STICKY_NOTE_WIDTH,
  MIN_STICKY_NOTE_SIZE,
  STICKY_NOTE_NODE_TYPE,
  STICKY_NOTE_PALETTE,
} from "./constants";

beforeAll(() => {
  // Mock canvas 2d context for JSDOM environment in Vitest
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

describe("StickyNoteNode", () => {
  it("initializes with the correct nodeType and constants", () => {
    const node = new StickyNoteNode();
    expect(STICKY_NOTE_NODE_TYPE).toBe("sticky-note");
    expect(DEFAULT_STICKY_NOTE_WIDTH).toBe(220);
    expect(DEFAULT_STICKY_NOTE_HEIGHT).toBe(220);
    expect(MIN_STICKY_NOTE_SIZE).toBe(120);
    expect(DEFAULT_DOG_EAR_SIZE).toBe(28);
    expect(node).toBeInstanceOf(StickyNoteNode);
  });

  it("verifies the curated pastel palette contains harmonious colors", () => {
    expect(STICKY_NOTE_PALETTE.YELLOW).toBe("#FEF3C7");
    expect(STICKY_NOTE_PALETTE.MINT).toBe("#D1FAE5");
    expect(STICKY_NOTE_PALETTE.ROSE).toBe("#FEE2E2");
    expect(STICKY_NOTE_PALETTE.LAVENDER).toBe("#EDE9FE");
    expect(STICKY_NOTE_PALETTE.SKY).toBe("#E0F2FE");
    expect(STICKY_NOTE_PALETTE.AMBER).toBe("#FDE68A");
    expect(STICKY_NOTE_PALETTE.CORAL).toBe("#FFEDD5");
    expect(STICKY_NOTE_PALETTE.WHITE).toBe("#FFFFFF");
  });

  it("renders a Konva Group with physical 3D dog-ear fold and default attributes", () => {
    const node = new StickyNoteNode();
    const group = node.onRender({
      id: "note-1",
      x: 100,
      y: 150,
    });

    expect(group).toBeInstanceOf(Konva.Group);
    expect(group.name()).toBe("node");
    expect(group.width()).toBe(DEFAULT_STICKY_NOTE_WIDTH);
    expect(group.height()).toBe(DEFAULT_STICKY_NOTE_HEIGHT);

    // Verify shadow rect
    const shadow = group.findOne("#note-1-shadow") as Konva.Rect;
    expect(shadow).toBeDefined();
    expect(shadow.shadowBlur()).toBe(14);

    // Verify main sheet polygon
    const mainSheet = group.findOne("#note-1-main-sheet") as Konva.Line;
    expect(mainSheet).toBeDefined();
    expect(mainSheet.fill()).toBe(DEFAULT_STICKY_NOTE_COLOR);
    expect(mainSheet.closed()).toBe(true);
    // 5 points (10 numbers) for clipped corner polygon
    expect(mainSheet.points().length).toBe(10);

    // Verify adhesive strip
    const adhesiveStrip = group.findOne("#note-1-adhesive-strip") as Konva.Rect;
    expect(adhesiveStrip).toBeDefined();
    expect(adhesiveStrip.height()).toBe(6);

    // Verify fold flap triangle
    const foldFlap = group.findOne("#note-1-fold-flap") as Konva.Line;
    expect(foldFlap).toBeDefined();
    expect(foldFlap.closed()).toBe(true);
    // 3 points (6 numbers) for triangle
    expect(foldFlap.points().length).toBe(6);

    // Verify note text
    const noteText = group.findOne("#note-1-text") as Konva.Text;
    expect(noteText).toBeDefined();
    expect(noteText.text()).toBe(DEFAULT_STICKY_NOTE_TEXT);
    expect(noteText.fontSize()).toBe(DEFAULT_STICKY_NOTE_FONT_SIZE);
    expect(noteText.fontFamily()).toBe(DEFAULT_STICKY_NOTE_FONT_FAMILY);

    // Author should not exist when not provided
    expect(group.findOne("#note-1-author")).toBeUndefined();
  });

  it("renders author tag when author prop is supplied", () => {
    const node = new StickyNoteNode();
    const group = node.onRender({
      id: "note-author",
      text: "Coordinate BIM model with store layout",
      author: "jmcaamanog",
      color: STICKY_NOTE_PALETTE.MINT,
    });

    const authorText = group.findOne("#note-author-author") as Konva.Text;
    expect(authorText).toBeDefined();
    expect(authorText.text()).toBe("@JMCAAMANOG");

    const mainSheet = group.findOne("#note-author-main-sheet") as Konva.Line;
    expect(mainSheet.fill()).toBe(STICKY_NOTE_PALETTE.MINT);
  });

  it("enforces minimum dimensions on render", () => {
    const node = new StickyNoteNode();
    const group = node.onRender({
      id: "note-small",
      width: 50,
      height: 40,
    });

    expect(group.width()).toBe(MIN_STICKY_NOTE_SIZE);
    expect(group.height()).toBe(MIN_STICKY_NOTE_SIZE);
  });

  it("updates node attributes and recalculates geometric fold points on onUpdate", () => {
    const node = new StickyNoteNode();
    const group = node.onRender({
      id: "note-update",
      width: 200,
      height: 200,
      color: STICKY_NOTE_PALETTE.YELLOW,
      text: "Initial text",
    });

    // Update to new dimensions, color and text
    node.onUpdate(group, {
      id: "note-update",
      width: 300,
      height: 250,
      color: STICKY_NOTE_PALETTE.ROSE,
      text: "Updated technical spec note",
      fontSize: 18,
      author: "jmcaamanog",
    });

    expect(group.width()).toBe(300);
    expect(group.height()).toBe(250);

    const mainSheet = group.findOne("#note-update-main-sheet") as Konva.Line;
    expect(mainSheet.fill()).toBe(STICKY_NOTE_PALETTE.ROSE);
    // Point 4: width = 300, height - foldSize = 250 - 28 = 222
    const points = mainSheet.points();
    expect(points[2]).toBe(300); // Top-right x
    expect(points[4]).toBe(300); // Bevel cut top x
    expect(points[5]).toBe(250 - DEFAULT_DOG_EAR_SIZE); // Bevel cut top y

    const noteText = group.findOne("#note-update-text") as Konva.Text;
    expect(noteText.text()).toBe("Updated technical spec note");
    expect(noteText.fontSize()).toBe(18);

    const authorText = group.findOne("#note-update-author") as Konva.Text;
    if (authorText) {
      expect(authorText.text()).toBe("@JMCAAMANOG");
    }
  });

  it("configures 8 transformer resize anchors", () => {
    const node = new StickyNoteNode();
    const group = node.onRender({ id: "note-anchors" });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const anchors = group.allowedAnchors();
    expect(anchors).toContain("top-left");
    expect(anchors).toContain("top-right");
    expect(anchors).toContain("bottom-left");
    expect(anchors).toContain("bottom-right");
    expect(anchors).toContain("middle-left");
    expect(anchors).toContain("middle-right");
    expect(anchors).toContain("top-center");
    expect(anchors).toContain("bottom-center");
    expect(anchors.length).toBe(8);
  });
});
