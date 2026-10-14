// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { WeavePlugin } from "@inditextech/weave-sdk";
import {
  AlignmentGuide,
  GapDistanceMatch,
  RectBounds,
  SmartGuidesPluginConfig,
  SmartGuidesPluginParams,
} from "./types";
import {
  DEFAULT_GAP_COLOR,
  DEFAULT_GUIDE_COLOR,
  DEFAULT_GUIDE_DASH,
  DEFAULT_GUIDE_STROKE_WIDTH,
  DEFAULT_SNAP_TOLERANCE,
  SMART_GUIDES_PLUGIN_KEY,
} from "./constants";

export class SmartGuidesPlugin extends WeavePlugin {
  private config: SmartGuidesPluginConfig;
  private guidesLayer: Konva.Layer | null = null;
  protected override enabled: boolean = true;
  private snapTolerance: number;
  private guideColor: string;
  private gapColor: string;
  private strokeWidth: number;
  private dash: number[];
  private showGapDistances: boolean;

  getLayerName = undefined;
  initLayer = undefined;
  onRender = undefined;

  constructor(params?: SmartGuidesPluginParams) {
    super();
    this.config = params?.config ?? {};
    this.snapTolerance = this.config.snapTolerance ?? DEFAULT_SNAP_TOLERANCE;
    this.guideColor = this.config.guideColor ?? DEFAULT_GUIDE_COLOR;
    this.gapColor = this.config.gapColor ?? DEFAULT_GAP_COLOR;
    this.strokeWidth = this.config.strokeWidth ?? DEFAULT_GUIDE_STROKE_WIDTH;
    this.dash = this.config.dash ?? DEFAULT_GUIDE_DASH;
    this.showGapDistances = this.config.showGapDistances ?? true;
    this.enabled = this.config.enabled ?? true;

    this.initialize();
  }

  initialize(): void {
    this.guidesLayer = null;
  }

  getName(): string {
    return SMART_GUIDES_PLUGIN_KEY;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
    this.clearGuides();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.clearGuides();
    }
    return this.enabled;
  }

  setSnapTolerance(tolerance: number): void {
    this.snapTolerance = tolerance;
  }

  setGuideColor(color: string): void {
    this.guideColor = color;
  }

  setShowGapDistances(show: boolean): void {
    this.showGapDistances = show;
  }

  onInit(): void {
    const stage = this.instance.getStage();

    this.guidesLayer = new Konva.Layer({
      id: "smart-guides-layer",
      listening: false,
    });

    stage.add(this.guidesLayer);
    this.guidesLayer.moveToTop();

    stage.on("dragmove.smartguides", (e) => {
      this.handleDragMove(e);
    });

    stage.on("dragend.smartguides", () => {
      this.clearGuides();
    });

    stage.on("pointerup.smartguides", () => {
      this.clearGuides();
    });
  }

  /**
   * Pure calculation: Finds alignment guides and snap offsets for a target rect against sibling rects.
   */
  findAlignments(
    targetRect: RectBounds,
    siblingRects: RectBounds[],
    tolerance: number = this.snapTolerance,
  ): { guides: AlignmentGuide[]; snapX: number; snapY: number } {
    const guides: AlignmentGuide[] = [];
    if (siblingRects.length === 0) {
      return { guides, snapX: 0, snapY: 0 };
    }

    const targetXEdges = [
      { edge: "left", value: targetRect.x, offset: 0 },
      { edge: "center", value: targetRect.x + targetRect.width / 2, offset: targetRect.width / 2 },
      { edge: "right", value: targetRect.x + targetRect.width, offset: targetRect.width },
    ];

    const targetYEdges = [
      { edge: "top", value: targetRect.y, offset: 0 },
      { edge: "middle", value: targetRect.y + targetRect.height / 2, offset: targetRect.height / 2 },
      { edge: "bottom", value: targetRect.y + targetRect.height, offset: targetRect.height },
    ];

    let minDeltaX = Infinity;
    let bestSnapX = 0;
    let bestVerticalGuide: AlignmentGuide | null = null;

    let minDeltaY = Infinity;
    let bestSnapY = 0;
    let bestHorizontalGuide: AlignmentGuide | null = null;

    for (const sib of siblingRects) {
      const sibXEdges = [
        sib.x,
        sib.x + sib.width / 2,
        sib.x + sib.width,
      ];

      const sibYEdges = [
        sib.y,
        sib.y + sib.height / 2,
        sib.y + sib.height,
      ];

      // Vertical alignment lines (matching X coordinate)
      for (const tX of targetXEdges) {
        for (const sX of sibXEdges) {
          const delta = tX.value - sX;
          if (Math.abs(delta) <= tolerance && Math.abs(delta) < Math.abs(minDeltaX)) {
            minDeltaX = delta;
            bestSnapX = delta;
            const startY = Math.min(targetRect.y, sib.y);
            const endY = Math.max(targetRect.y + targetRect.height, sib.y + sib.height);
            bestVerticalGuide = {
              orientation: "vertical",
              position: sX,
              start: startY,
              end: endY,
              snapDelta: delta,
            };
          }
        }
      }

      // Horizontal alignment lines (matching Y coordinate)
      for (const tY of targetYEdges) {
        for (const sY of sibYEdges) {
          const delta = tY.value - sY;
          if (Math.abs(delta) <= tolerance && Math.abs(delta) < Math.abs(minDeltaY)) {
            minDeltaY = delta;
            bestSnapY = delta;
            const startX = Math.min(targetRect.x, sib.x);
            const endX = Math.max(targetRect.x + targetRect.width, sib.x + sib.width);
            bestHorizontalGuide = {
              orientation: "horizontal",
              position: sY,
              start: startX,
              end: endX,
              snapDelta: delta,
            };
          }
        }
      }
    }

    if (bestVerticalGuide) {
      guides.push(bestVerticalGuide);
    }
    if (bestHorizontalGuide) {
      guides.push(bestHorizontalGuide);
    }

    return {
      guides,
      snapX: bestSnapX,
      snapY: bestSnapY,
    };
  }

  /**
   * Pure calculation: Detects equidistant distribution between target and pairs of neighboring rects.
   */
  findEquidistantGaps(
    targetRect: RectBounds,
    siblingRects: RectBounds[],
    tolerance: number = this.snapTolerance,
  ): GapDistanceMatch | null {
    if (siblingRects.length < 2) return null;

    // Check horizontal equidistance
    const leftSiblings = siblingRects
      .filter((s) => s.x + s.width <= targetRect.x + tolerance)
      .sort((a, b) => b.x + b.width - (a.x + a.width));

    const rightSiblings = siblingRects
      .filter((s) => s.x >= targetRect.x + targetRect.width - tolerance)
      .sort((a, b) => a.x - b.x);

    if (leftSiblings.length > 0 && rightSiblings.length > 0) {
      const left = leftSiblings[0];
      const right = rightSiblings[0];

      const gapLeft = targetRect.x - (left.x + left.width);
      const gapRight = right.x - (targetRect.x + targetRect.width);

      if (gapLeft > 0 && gapRight > 0) {
        const diff = Math.abs(gapLeft - gapRight);
        if (diff <= tolerance * 2) {
          const targetGap = (gapLeft + gapRight) / 2;
          const snapDelta = gapLeft - targetGap;
          return {
            axis: "horizontal",
            distance: Math.round(targetGap),
            rect1: left,
            rect2: targetRect,
            rect3: right,
            snapDelta,
          };
        }
      }
    }

    // Check vertical equidistance
    const topSiblings = siblingRects
      .filter((s) => s.y + s.height <= targetRect.y + tolerance)
      .sort((a, b) => b.y + b.height - (a.y + a.height));

    const bottomSiblings = siblingRects
      .filter((s) => s.y >= targetRect.y + targetRect.height - tolerance)
      .sort((a, b) => a.y - b.y);

    if (topSiblings.length > 0 && bottomSiblings.length > 0) {
      const top = topSiblings[0];
      const bottom = bottomSiblings[0];

      const gapTop = targetRect.y - (top.y + top.height);
      const gapBottom = bottom.y - (targetRect.y + targetRect.height);

      if (gapTop > 0 && gapBottom > 0) {
        const diff = Math.abs(gapTop - gapBottom);
        if (diff <= tolerance * 2) {
          const targetGap = (gapTop + gapBottom) / 2;
          const snapDelta = gapTop - targetGap;
          return {
            axis: "vertical",
            distance: Math.round(targetGap),
            rect1: top,
            rect2: targetRect,
            rect3: bottom,
            snapDelta,
          };
        }
      }
    }

    return null;
  }

  private handleDragMove(e: Konva.KonvaEventObject<DragEvent>): void {
    if (!this.enabled || !this.guidesLayer) return;

    const targetNode = e.target;
    if (!targetNode || targetNode === this.instance.getStage()) return;

    // Collect sibling node bounding boxes
    const layer = targetNode.getLayer() || this.instance.getMainLayer();
    if (!layer) return;

    const siblingRects: RectBounds[] = [];
    layer.getChildren().forEach((child) => {
      if (
        child !== targetNode &&
        child.isVisible() &&
        child.name() === "node"
      ) {
        const clientRect = child.getClientRect({ skipStroke: true });
        siblingRects.push(clientRect);
      }
    });

    if (siblingRects.length === 0) {
      this.clearGuides();
      return;
    }

    const targetRect = targetNode.getClientRect({ skipStroke: true });
    const { guides, snapX, snapY } = this.findAlignments(targetRect, siblingRects);
    const gapMatch = this.showGapDistances
      ? this.findEquidistantGaps(targetRect, siblingRects)
      : null;

    // Magnetic snap application
    if (snapX !== 0) {
      targetNode.x(targetNode.x() - snapX);
    }
    if (snapY !== 0) {
      targetNode.y(targetNode.y() - snapY);
    }

    this.renderGuides(guides, gapMatch);
  }

  /**
   * Renders alignment lines and gap badges onto the dedicated guides layer.
   */
  renderGuides(guides: AlignmentGuide[], gapMatch: GapDistanceMatch | null): void {
    if (!this.guidesLayer) return;

    this.guidesLayer.destroyChildren();

    // Render alignment guides
    for (const guide of guides) {
      if (guide.orientation === "vertical") {
        const line = new Konva.Line({
          points: [
            guide.position,
            guide.start - 12,
            guide.position,
            guide.end + 12,
          ],
          stroke: this.guideColor,
          strokeWidth: this.strokeWidth,
          dash: this.dash,
          listening: false,
        });
        this.guidesLayer.add(line);
      } else {
        const line = new Konva.Line({
          points: [
            guide.start - 12,
            guide.position,
            guide.end + 12,
            guide.position,
          ],
          stroke: this.guideColor,
          strokeWidth: this.strokeWidth,
          dash: this.dash,
          listening: false,
        });
        this.guidesLayer.add(line);
      }
    }

    // Render equidistant spacing badges
    if (gapMatch) {
      if (gapMatch.axis === "horizontal") {
        this.renderGapBadge(
          (gapMatch.rect1.x + gapMatch.rect1.width + gapMatch.rect2.x) / 2,
          gapMatch.rect2.y + gapMatch.rect2.height / 2,
          `${gapMatch.distance}px`,
        );
        this.renderGapBadge(
          (gapMatch.rect2.x + gapMatch.rect2.width + gapMatch.rect3.x) / 2,
          gapMatch.rect2.y + gapMatch.rect2.height / 2,
          `${gapMatch.distance}px`,
        );
      } else {
        this.renderGapBadge(
          gapMatch.rect2.x + gapMatch.rect2.width / 2,
          (gapMatch.rect1.y + gapMatch.rect1.height + gapMatch.rect2.y) / 2,
          `${gapMatch.distance}px`,
        );
        this.renderGapBadge(
          gapMatch.rect2.x + gapMatch.rect2.width / 2,
          (gapMatch.rect2.y + gapMatch.rect2.height + gapMatch.rect3.y) / 2,
          `${gapMatch.distance}px`,
        );
      }
    }

    this.guidesLayer.batchDraw();
  }

  private renderGapBadge(centerX: number, centerY: number, text: string): void {
    if (!this.guidesLayer) return;

    const badgeGroup = new Konva.Group({
      x: centerX,
      y: centerY,
      listening: false,
    });

    const badgeText = new Konva.Text({
      text,
      fontSize: 10,
      fontFamily: "Inter, sans-serif",
      fontStyle: "bold",
      fill: "#FFFFFF",
      align: "center",
      listening: false,
    });

    const textWidth = badgeText.width();
    const textHeight = badgeText.height();
    const padX = 6;
    const padY = 2;

    const badgeBg = new Konva.Rect({
      x: -textWidth / 2 - padX,
      y: -textHeight / 2 - padY,
      width: textWidth + padX * 2,
      height: textHeight + padY * 2,
      fill: this.gapColor,
      cornerRadius: 4,
      listening: false,
    });

    badgeText.x(-textWidth / 2);
    badgeText.y(-textHeight / 2);

    badgeGroup.add(badgeBg);
    badgeGroup.add(badgeText);
    this.guidesLayer.add(badgeGroup);
  }

  clearGuides(): void {
    if (this.guidesLayer) {
      this.guidesLayer.destroyChildren();
      this.guidesLayer.batchDraw();
    }
  }

  destroy(): void {
    this.clearGuides();
    if (this.guidesLayer) {
      this.guidesLayer.destroy();
      this.guidesLayer = null;
    }
  }
}
