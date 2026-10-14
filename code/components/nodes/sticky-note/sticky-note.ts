// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveNode } from "@inditextech/weave-sdk";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import Konva from "konva";
import {
  DEFAULT_DOG_EAR_SIZE,
  DEFAULT_STICKY_NOTE_COLOR,
  DEFAULT_STICKY_NOTE_FONT_FAMILY,
  DEFAULT_STICKY_NOTE_FONT_SIZE,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_LINE_HEIGHT,
  DEFAULT_STICKY_NOTE_TEXT,
  DEFAULT_STICKY_NOTE_TEXT_COLOR,
  DEFAULT_STICKY_NOTE_WIDTH,
  MIN_STICKY_NOTE_SIZE,
  STICKY_NOTE_NODE_TYPE,
} from "./constants";
import type { StickyNoteAttributes } from "./types";

export class StickyNoteNode extends WeaveNode {
  protected nodeType = STICKY_NOTE_NODE_TYPE;
  initialize = undefined;

  /**
   * Helper to calculate the main 5-point polygon for the paper body with folded bottom-right corner.
   */
  private getMainSheetPoints(width: number, height: number, foldSize: number): number[] {
    return [
      0, 0,
      width, 0,
      width, height - foldSize,
      width - foldSize, height,
      0, height,
    ];
  }

  /**
   * Helper to calculate the 3-point triangle for the dog-ear flap.
   */
  private getDogEarFlapPoints(width: number, height: number, foldSize: number): number[] {
    return [
      width - foldSize, height - foldSize,
      width, height - foldSize,
      width - foldSize, height,
    ];
  }

  onRender(props: StickyNoteAttributes) {
    const { id } = props;

    const width = Math.max(props.width ?? DEFAULT_STICKY_NOTE_WIDTH, MIN_STICKY_NOTE_SIZE);
    const height = Math.max(props.height ?? DEFAULT_STICKY_NOTE_HEIGHT, MIN_STICKY_NOTE_SIZE);
    const noteColor = props.color ?? DEFAULT_STICKY_NOTE_COLOR;
    const dogEarSize = props.dogEarSize ?? DEFAULT_DOG_EAR_SIZE;
    const textContent = props.text ?? DEFAULT_STICKY_NOTE_TEXT;
    const fontSize = props.fontSize ?? DEFAULT_STICKY_NOTE_FONT_SIZE;
    const fontFamily = props.fontFamily ?? DEFAULT_STICKY_NOTE_FONT_FAMILY;
    const fontColor = props.fontColor ?? DEFAULT_STICKY_NOTE_TEXT_COLOR;
    const author = props.author;

    const stickyParams = { ...props };
    delete stickyParams.zIndex;

    const stickyGroup = new Konva.Group({
      ...stickyParams,
      width,
      height,
      name: "node",
    });

    if (this.instance) {
      this.setupDefaultNodeAugmentation(stickyGroup);
    }

    // 1. Soft atmospheric drop shadow (behind note)
    const shadowRect = new Konva.Rect({
      id: `${id}-shadow`,
      groupId: id,
      nodeId: id,
      x: 2,
      y: 4,
      width: width - 4,
      height: height - 4,
      cornerRadius: 4,
      fill: "rgba(0, 0, 0, 0.04)",
      shadowColor: "rgba(15, 23, 42, 0.16)",
      shadowBlur: 14,
      shadowOffset: { x: 3, y: 7 },
      shadowOpacity: 0.8,
      listening: false,
      draggable: false,
    });
    stickyGroup.add(shadowRect);

    // 2. Main paper body (5-point polygon with clipped bottom-right corner)
    const mainSheet = new Konva.Line({
      id: `${id}-main-sheet`,
      groupId: id,
      nodeId: id,
      points: this.getMainSheetPoints(width, height, dogEarSize),
      fill: noteColor,
      closed: true,
      stroke: "rgba(0, 0, 0, 0.08)",
      strokeWidth: 1,
      listening: true,
      draggable: false,
    });
    stickyGroup.add(mainSheet);

    // 3. Faint adhesive top strip (mimics real physical post-it glue strip)
    const adhesiveStrip = new Konva.Rect({
      id: `${id}-adhesive-strip`,
      groupId: id,
      nodeId: id,
      x: 0,
      y: 0,
      width,
      height: 6,
      fill: "rgba(255, 255, 255, 0.35)",
      listening: false,
      draggable: false,
    });
    stickyGroup.add(adhesiveStrip);

    // 4. Dog-ear fold shadow (casts onto the canvas under the turned paper)
    const foldShadow = new Konva.Line({
      id: `${id}-fold-shadow`,
      groupId: id,
      nodeId: id,
      points: this.getDogEarFlapPoints(width, height, dogEarSize),
      fill: "rgba(0, 0, 0, 0.08)",
      closed: true,
      listening: false,
      draggable: false,
    });
    stickyGroup.add(foldShadow);

    // 5. Dog-ear flap (turned-over corner triangle)
    const foldFlap = new Konva.Line({
      id: `${id}-fold-flap`,
      groupId: id,
      nodeId: id,
      points: this.getDogEarFlapPoints(width, height, dogEarSize),
      fill: "rgba(0, 0, 0, 0.06)",
      closed: true,
      stroke: "rgba(0, 0, 0, 0.10)",
      strokeWidth: 1,
      shadowColor: "rgba(0, 0, 0, 0.15)",
      shadowBlur: 4,
      shadowOffset: { x: -2, y: 2 },
      listening: false,
      draggable: false,
    });
    stickyGroup.add(foldFlap);

    // 6. Multi-line note text body
    const textPaddingX = 18;
    const textPaddingTop = 18;
    const authorMargin = author ? 22 : 0;
    const textAvailableWidth = Math.max(width - textPaddingX * 2, 20);
    const textAvailableHeight = Math.max(height - textPaddingTop - dogEarSize - authorMargin, 20);

    const noteText = new Konva.Text({
      id: `${id}-text`,
      groupId: id,
      nodeId: id,
      x: textPaddingX,
      y: textPaddingTop,
      width: textAvailableWidth,
      height: textAvailableHeight,
      text: textContent,
      fontSize,
      fontFamily,
      lineHeight: DEFAULT_STICKY_NOTE_LINE_HEIGHT,
      fill: fontColor,
      wrap: "word",
      ellipsis: true,
      listening: false,
      draggable: false,
    });
    stickyGroup.add(noteText);

    // 7. Author badge pill (optional bottom-left label)
    if (author) {
      const authorText = new Konva.Text({
        id: `${id}-author`,
        groupId: id,
        nodeId: id,
        x: textPaddingX,
        y: height - 24,
        text: `@${author.toUpperCase()}`,
        fontSize: 10,
        fontFamily,
        fontStyle: "bold",
        fill: "rgba(31, 41, 55, 0.45)",
        listening: false,
        draggable: false,
      });
      stickyGroup.add(authorText);
    }

    // Transformer & Anchor setup
    stickyGroup.getTransformerProperties = () => {
      const baseConfig = this.instance
        ? this.defaultGetTransformerProperties({})
        : {};
      return {
        ...baseConfig,
        resizeEnabled: true,
        rotateEnabled: true,
        borderStrokeWidth: 1.5,
        borderStroke: "#2563EB",
        enabledAnchors: [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
          "top-center",
          "bottom-center",
          "middle-left",
          "middle-right",
        ],
      };
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stickyGroup.allowedAnchors = () => [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "top-center",
      "bottom-center",
      "middle-left",
      "middle-right",
    ];

    if (this.instance) {
      this.setupDefaultNodeEvents(stickyGroup);
    }

    return stickyGroup;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: StickyNoteAttributes,
  ) {
    const { id, text, color, fontSize, fontFamily, fontColor, dogEarSize, author } = nextProps;
    const stickyGroup = nodeInstance as Konva.Group;

    const width = Math.max(nextProps.width ?? stickyGroup.width(), MIN_STICKY_NOTE_SIZE);
    const height = Math.max(nextProps.height ?? stickyGroup.height(), MIN_STICKY_NOTE_SIZE);
    const foldSize = dogEarSize ?? DEFAULT_DOG_EAR_SIZE;
    const noteColor = color ?? DEFAULT_STICKY_NOTE_COLOR;

    const currentZIndex = nodeInstance.zIndex();
    nodeInstance.setAttrs({
      ...nextProps,
      width,
      height,
      zIndex: currentZIndex,
    });

    // 1. Update shadow geometry
    const shadowRect = stickyGroup.findOne(`#${id}-shadow`);
    if (shadowRect) {
      shadowRect.setAttrs({
        width: width - 4,
        height: height - 4,
      });
    }

    // 2. Update main sheet points & fill
    const mainSheet = stickyGroup.findOne(`#${id}-main-sheet`) as Konva.Line;
    if (mainSheet) {
      mainSheet.setAttrs({
        points: this.getMainSheetPoints(width, height, foldSize),
        fill: noteColor,
      });
    }

    // 3. Update adhesive strip width
    const adhesiveStrip = stickyGroup.findOne(`#${id}-adhesive-strip`);
    if (adhesiveStrip) {
      adhesiveStrip.setAttrs({
        width,
      });
    }

    // 4. Update dog-ear fold flap points
    const foldPoints = this.getDogEarFlapPoints(width, height, foldSize);
    const foldShadow = stickyGroup.findOne(`#${id}-fold-shadow`) as Konva.Line;
    if (foldShadow) {
      foldShadow.setAttrs({ points: foldPoints });
    }
    const foldFlap = stickyGroup.findOne(`#${id}-fold-flap`) as Konva.Line;
    if (foldFlap) {
      foldFlap.setAttrs({ points: foldPoints });
    }

    // 5. Update note text
    const textPaddingX = 18;
    const textPaddingTop = 18;
    const authorMargin = author ? 22 : 0;
    const textAvailableWidth = Math.max(width - textPaddingX * 2, 20);
    const textAvailableHeight = Math.max(height - textPaddingTop - foldSize - authorMargin, 20);

    const noteText = stickyGroup.findOne(`#${id}-text`) as Konva.Text;
    if (noteText) {
      noteText.setAttrs({
        width: textAvailableWidth,
        height: textAvailableHeight,
        text: text ?? noteText.text(),
        fontSize: fontSize ?? noteText.fontSize(),
        fontFamily: fontFamily ?? noteText.fontFamily(),
        fill: fontColor ?? noteText.fill(),
      });
    }

    // 6. Update author text if present
    const authorText = stickyGroup.findOne(`#${id}-author`) as Konva.Text;
    if (authorText) {
      authorText.setAttrs({
        y: height - 24,
        text: author ? `@${author.toUpperCase()}` : "",
      });
    }
  }
}
