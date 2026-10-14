// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { WeaveNode } from "@inditextech/weave-sdk";
import {
  DEFAULT_MATERIAL_HEIGHT,
  DEFAULT_MATERIAL_WIDTH,
  MATERIAL_SWATCH_NODE_TYPE,
  MIN_MATERIAL_HEIGHT,
  MIN_MATERIAL_WIDTH,
  RETAIL_MATERIAL_PRESETS,
  SPEC_CARD_HEIGHT,
} from "./constants";
import { MaterialSwatchAttributes } from "./types";

export class MaterialSwatchNode extends WeaveNode {
  protected nodeType = MATERIAL_SWATCH_NODE_TYPE;
  initialize = undefined;

  getName(): string {
    return MATERIAL_SWATCH_NODE_TYPE;
  }

  getTransformerProperties() {
    return {
      resizeEnabled: true,
      rotateEnabled: true,
      keepRatio: false,
      boundBoxFunc: (oldBox: { width: number; height: number }, newBox: { width: number; height: number }) => {
        if (
          Math.abs(newBox.width) < MIN_MATERIAL_WIDTH ||
          Math.abs(newBox.height) < MIN_MATERIAL_HEIGHT
        ) {
          return oldBox;
        }
        return newBox;
      },
    };
  }

  onRender(props: MaterialSwatchAttributes): Konva.Group {
    const id = props.id ?? "";
    const width = Math.max(props.width ?? DEFAULT_MATERIAL_WIDTH, MIN_MATERIAL_WIDTH);
    const height = Math.max(props.height ?? DEFAULT_MATERIAL_HEIGHT, MIN_MATERIAL_HEIGHT);
    const x = props.x ?? 0;
    const y = props.y ?? 0;

    const defaultPreset = RETAIL_MATERIAL_PRESETS[0];
    const color = props.color ?? defaultPreset.color;
    const materialName = props.materialName ?? defaultPreset.name;
    const finishCode = props.finishCode ?? defaultPreset.finish;
    const category = props.category ?? defaultPreset.category;
    const isDark = Boolean(props.darkTheme);

    const specH = Math.min(SPEC_CARD_HEIGHT, height * 0.45);
    const sampleH = height - specH;

    const swatchGroup = new Konva.Group({
      id,
      name: "node",
      nodeType: MATERIAL_SWATCH_NODE_TYPE,
      x,
      y,
      width,
      height,
    });

    if (this.instance) {
      this.setupDefaultNodeAugmentation(swatchGroup);
    }

    // 1. Ambient Drop Shadow & Background Card
    const cardShadow = new Konva.Rect({
      id: `${id}-shadow-card`,
      x: 0,
      y: 0,
      width,
      height,
      cornerRadius: 10,
      fill: isDark ? "#18181B" : "#FFFFFF",
      shadowColor: "rgba(0, 0, 0, 0.14)",
      shadowBlur: 16,
      shadowOffset: { x: 0, y: 6 },
      shadowOpacity: 1,
      stroke: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
      strokeWidth: 1,
      listening: true,
    });
    swatchGroup.add(cardShadow);

    // 2. Material Sample Area
    const sampleRect = new Konva.Rect({
      id: `${id}-sample-rect`,
      x: 0,
      y: 0,
      width,
      height: sampleH,
      fill: color,
      cornerRadius: [10, 10, 0, 0],
      listening: true,
    });
    swatchGroup.add(sampleRect);

    // 3. Subtle Gloss Highlight Sheen
    const sheen = new Konva.Line({
      id: `${id}-sheen`,
      points: [0, 0, width * 0.45, 0, 0, sampleH * 0.45],
      fill: "rgba(255, 255, 255, 0.12)",
      closed: true,
      listening: false,
    });
    swatchGroup.add(sheen);

    // 4. Spec Card Divider Line
    const divider = new Konva.Line({
      id: `${id}-divider`,
      points: [0, sampleH, width, sampleH],
      stroke: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
      strokeWidth: 1,
      listening: false,
    });
    swatchGroup.add(divider);

    // 5. Spec Card Details Group
    const specGroup = new Konva.Group({
      id: `${id}-spec-group`,
      x: 0,
      y: sampleH,
      width,
      height: specH,
      listening: false,
    });

    // Category Pill Badge
    const categoryText = new Konva.Text({
      id: `${id}-category-text`,
      x: 14,
      y: 11,
      text: category.toUpperCase(),
      fontSize: 8,
      fontFamily: "Inter, sans-serif",
      fontStyle: "bold",
      fill: isDark ? "#A1A1AA" : "#71717A",
      listening: false,
    });

    const pillPadX = 6;
    const pillPadY = 2;
    const pillW = categoryText.width() + pillPadX * 2;
    const pillH = categoryText.height() + pillPadY * 2;

    const categoryBg = new Konva.Rect({
      id: `${id}-category-bg`,
      x: 14 - pillPadX,
      y: 11 - pillPadY,
      width: pillW,
      height: pillH,
      fill: isDark ? "rgba(255, 255, 255, 0.08)" : "#F4F4F5",
      cornerRadius: 3,
      listening: false,
    });

    // Material Name Title
    const nameText = new Konva.Text({
      id: `${id}-name-text`,
      x: 14,
      y: 28,
      text: materialName,
      fontSize: 12,
      fontFamily: "Inter, sans-serif",
      fontStyle: "bold",
      fill: isDark ? "#FAFAFA" : "#18181B",
      width: width - 36,
      ellipsis: true,
      listening: false,
    });

    // Finish Code
    const finishText = new Konva.Text({
      id: `${id}-finish-text`,
      x: 14,
      y: 47,
      text: finishCode,
      fontSize: 10,
      fontFamily: "Inter, sans-serif",
      fill: isDark ? "#A1A1AA" : "#71717A",
      width: width - 28,
      ellipsis: true,
      listening: false,
    });

    // Color Indicator Chip
    const colorChip = new Konva.Circle({
      id: `${id}-color-chip`,
      x: width - 20,
      y: 18,
      radius: 6,
      fill: color,
      stroke: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
      strokeWidth: 1,
      listening: false,
    });

    specGroup.add(categoryBg);
    specGroup.add(categoryText);
    specGroup.add(nameText);
    specGroup.add(finishText);
    specGroup.add(colorChip);

    swatchGroup.add(specGroup);

    if (this.instance) {
      this.setupDefaultNodeEvents(swatchGroup);
    }

    return swatchGroup;
  }

  onUpdate(group: Konva.Group, props: MaterialSwatchAttributes): void {
    const id = props.id ?? group.id();
    const width = Math.max(props.width ?? group.width(), MIN_MATERIAL_WIDTH);
    const height = Math.max(props.height ?? group.height(), MIN_MATERIAL_HEIGHT);

    const defaultPreset = RETAIL_MATERIAL_PRESETS[0];
    const color = props.color ?? defaultPreset.color;
    const materialName = props.materialName ?? defaultPreset.name;
    const finishCode = props.finishCode ?? defaultPreset.finish;
    const category = props.category ?? defaultPreset.category;
    const isDark = Boolean(props.darkTheme);

    const specH = Math.min(SPEC_CARD_HEIGHT, height * 0.45);
    const sampleH = height - specH;

    group.setAttrs({ width, height });

    this.updateCardSurfaces(group, id, width, height, sampleH, isDark, color);
    this.updateCardTypography(group, id, width, specH, sampleH, isDark, category, materialName, finishCode, color);
  }

  private updateCardSurfaces(
    group: Konva.Group,
    id: string,
    width: number,
    height: number,
    sampleH: number,
    isDark: boolean,
    color: string,
  ): void {
    const cardShadow = group.findOne(`#${id}-shadow-card`) as Konva.Rect | undefined;
    cardShadow?.setAttrs({
      width,
      height,
      fill: isDark ? "#18181B" : "#FFFFFF",
      stroke: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    });

    const sampleRect = group.findOne(`#${id}-sample-rect`) as Konva.Rect | undefined;
    sampleRect?.setAttrs({ width, height: sampleH, fill: color });

    const sheen = group.findOne(`#${id}-sheen`) as Konva.Line | undefined;
    sheen?.setAttrs({ points: [0, 0, width * 0.45, 0, 0, sampleH * 0.45] });

    const divider = group.findOne(`#${id}-divider`) as Konva.Line | undefined;
    divider?.setAttrs({
      points: [0, sampleH, width, sampleH],
      stroke: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    });
  }

  private updateCardTypography(
    group: Konva.Group,
    id: string,
    width: number,
    specH: number,
    sampleH: number,
    isDark: boolean,
    category: string,
    materialName: string,
    finishCode: string,
    color: string,
  ): void {
    const specGroup = group.findOne(`#${id}-spec-group`) as Konva.Group | undefined;
    specGroup?.setAttrs({ y: sampleH, width, height: specH });

    const categoryText = group.findOne(`#${id}-category-text`) as Konva.Text | undefined;
    const categoryBg = group.findOne(`#${id}-category-bg`) as Konva.Rect | undefined;
    if (categoryText && categoryBg) {
      categoryText.setAttrs({
        text: category.toUpperCase(),
        fill: isDark ? "#A1A1AA" : "#71717A",
      });
      categoryBg.setAttrs({
        width: categoryText.width() + 12,
        height: categoryText.height() + 4,
        fill: isDark ? "rgba(255, 255, 255, 0.08)" : "#F4F4F5",
      });
    }

    const nameText = group.findOne(`#${id}-name-text`) as Konva.Text | undefined;
    nameText?.setAttrs({
      text: materialName,
      fill: isDark ? "#FAFAFA" : "#18181B",
      width: width - 36,
    });

    const finishText = group.findOne(`#${id}-finish-text`) as Konva.Text | undefined;
    finishText?.setAttrs({
      text: finishCode,
      fill: isDark ? "#A1A1AA" : "#71717A",
      width: width - 28,
    });

    const colorChip = group.findOne(`#${id}-color-chip`) as Konva.Circle | undefined;
    colorChip?.setAttrs({
      x: width - 20,
      fill: color,
      stroke: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
    });
  }
}
