// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll } from "vitest";
import Konva from "konva";
import { MaterialSwatchNode } from "./material-swatch";
import {
  DEFAULT_MATERIAL_HEIGHT,
  DEFAULT_MATERIAL_WIDTH,
  MATERIAL_CATEGORIES,
  MATERIAL_SWATCH_NODE_TYPE,
  MIN_MATERIAL_HEIGHT,
  MIN_MATERIAL_WIDTH,
  RETAIL_MATERIAL_PRESETS,
} from "./constants";

beforeAll(() => {
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = (() => ({
      measureText: (text: string) => ({
        width: text.length * 7,
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

describe("MaterialSwatchNode", () => {
  const node = new MaterialSwatchNode();

  it("returns correct node type name", () => {
    expect(node.getName()).toBe(MATERIAL_SWATCH_NODE_TYPE);
  });

  describe("Rendering", () => {
    it("renders with default retail preset when properties are omitted", () => {
      const group = node.onRender({ id: "swatch-1" });

      expect(group).toBeInstanceOf(Konva.Group);
      expect(group.width()).toBe(DEFAULT_MATERIAL_WIDTH);
      expect(group.height()).toBe(DEFAULT_MATERIAL_HEIGHT);

      const defaultPreset = RETAIL_MATERIAL_PRESETS[0];
      const sample = group.findOne("#swatch-1-sample-rect") as Konva.Rect;
      expect(sample).toBeDefined();
      expect(sample.fill()).toBe(defaultPreset.color);

      const nameText = group.findOne("#swatch-1-name-text") as Konva.Text;
      expect(nameText.text()).toBe(defaultPreset.name);

      const categoryText = group.findOne("#swatch-1-category-text") as Konva.Text;
      expect(categoryText.text()).toBe(defaultPreset.category.toUpperCase());
    });

    it("enforces minimum width and height boundaries", () => {
      const group = node.onRender({
        id: "swatch-min",
        width: 50,
        height: 60,
      });

      expect(group.width()).toBe(MIN_MATERIAL_WIDTH);
      expect(group.height()).toBe(MIN_MATERIAL_HEIGHT);
    });

    it("renders custom material attributes correctly", () => {
      const group = node.onRender({
        id: "swatch-custom",
        materialName: "Brushed Brass",
        finishCode: "Satin PVD • REF-880",
        category: MATERIAL_CATEGORIES.METAL,
        color: "#D4AF37",
        width: 200,
        height: 280,
      });

      const sample = group.findOne("#swatch-custom-sample-rect") as Konva.Rect;
      expect(sample.fill()).toBe("#D4AF37");

      const nameText = group.findOne("#swatch-custom-name-text") as Konva.Text;
      expect(nameText.text()).toBe("Brushed Brass");

      const finishText = group.findOne("#swatch-custom-finish-text") as Konva.Text;
      expect(finishText.text()).toBe("Satin PVD • REF-880");
    });
  });

  describe("Transformer Constraints", () => {
    it("clamps bounding box resize func below minimum limits", () => {
      const config = node.getTransformerProperties();
      const boundBoxFunc = config.boundBoxFunc;

      const oldBox = { width: 160, height: 200 };
      const invalidBox = { width: 100, height: 120 }; // below min 140x180
      const validBox = { width: 180, height: 220 };

      expect(boundBoxFunc(oldBox, invalidBox)).toEqual(oldBox);
      expect(boundBoxFunc(oldBox, validBox)).toEqual(validBox);
    });
  });

  describe("Updating", () => {
    it("dynamically updates sample color, titles and layout on onUpdate", () => {
      const group = node.onRender({ id: "swatch-update" });

      node.onUpdate(group, {
        id: "swatch-update",
        color: "#27272A",
        materialName: "Black Oxide Steel",
        finishCode: "Micro-Textured • REF-912",
        category: MATERIAL_CATEGORIES.METAL,
        width: 220,
        height: 300,
        darkTheme: true,
      });

      expect(group.width()).toBe(220);
      expect(group.height()).toBe(300);

      const sample = group.findOne("#swatch-update-sample-rect") as Konva.Rect;
      expect(sample.fill()).toBe("#27272A");

      const nameText = group.findOne("#swatch-update-name-text") as Konva.Text;
      expect(nameText.text()).toBe("Black Oxide Steel");

      const card = group.findOne("#swatch-update-shadow-card") as Konva.Rect;
      expect(card.fill()).toBe("#18181B");
    });
  });
});
