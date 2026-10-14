// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveNode } from "@inditextech/weave-sdk";
import type { WeaveElementInstance } from "@inditextech/weave-types";
import Konva from "konva";
import {
  DEFAULT_DIMENSION_ARROW_SIZE,
  DEFAULT_DIMENSION_DOT_RADIUS,
  DEFAULT_DIMENSION_FONT_FAMILY,
  DEFAULT_DIMENSION_FONT_SIZE,
  DEFAULT_DIMENSION_OFFSET,
  DEFAULT_DIMENSION_PRECISION,
  DEFAULT_DIMENSION_STROKE,
  DEFAULT_DIMENSION_STROKE_WIDTH,
  DEFAULT_DIMENSION_TERMINATOR,
  DEFAULT_DIMENSION_TICK_SIZE,
  DEFAULT_DIMENSION_UNIT,
  DEFAULT_DIMENSION_UNIT_PER_PIXEL,
  DEFAULT_DIMENSION_WITNESS_GAP,
  DEFAULT_DIMENSION_WITNESS_OVERHANG,
  DIMENSION_NODE_TYPE,
  DIMENSION_TERMINATOR,
  DIMENSION_UNIT,
} from "./constants";
import type { DimensionAttributes, DimensionUnitType } from "./types";

export class DimensionNode extends WeaveNode {
  protected nodeType = DIMENSION_NODE_TYPE;
  initialize = undefined;

  /**
   * Formats distance value according to unit and precision.
   */
  public formatMeasurement(
    pixelDistance: number,
    unit: DimensionUnitType = DEFAULT_DIMENSION_UNIT,
    unitPerPixel: number = DEFAULT_DIMENSION_UNIT_PER_PIXEL,
    precision: number = DEFAULT_DIMENSION_PRECISION,
    customLabel?: string,
  ): string {
    const meters = pixelDistance * unitPerPixel;
    let formatted = "";

    switch (unit) {
      case DIMENSION_UNIT.M:
        formatted = `${meters.toFixed(precision)} m`;
        break;
      case DIMENSION_UNIT.CM:
        formatted = `${(meters * 100).toFixed(precision)} cm`;
        break;
      case DIMENSION_UNIT.MM:
        formatted = `${Math.round(meters * 1000)} mm`;
        break;
      case DIMENSION_UNIT.FT: {
        const totalFeet = meters * 3.28084;
        formatted = `${totalFeet.toFixed(precision)} ft`;
        break;
      }
      case DIMENSION_UNIT.IN: {
        const totalInches = meters * 39.3701;
        formatted = `${totalInches.toFixed(precision)} in`;
        break;
      }
      default:
        formatted = `${meters.toFixed(precision)} m`;
    }

    return customLabel ? `${customLabel} ${formatted}` : formatted;
  }

  /**
   * Computes geometric parameters: distance, unit direction vector, normal vector, and offset endpoints.
   */
  public calculateGeometry(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    offset: number = DEFAULT_DIMENSION_OFFSET,
  ) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.max(Math.hypot(dx, dy), 1);

    const ux = dx / distance;
    const uy = dy / distance;

    // Normal vector perpendicular to line
    const nx = -uy;
    const ny = ux;

    const p1OffX = fromX + offset * nx;
    const p1OffY = fromY + offset * ny;
    const p2OffX = toX + offset * nx;
    const p2OffY = toY + offset * ny;

    const midX = (p1OffX + p2OffX) / 2;
    const midY = (p1OffY + p2OffY) / 2;

    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;

    // Keep badge upright and readable
    if (angleDeg > 90) {
      angleDeg -= 180;
    } else if (angleDeg < -90) {
      angleDeg += 180;
    }

    return {
      distance,
      ux,
      uy,
      nx,
      ny,
      p1OffX,
      p1OffY,
      p2OffX,
      p2OffY,
      midX,
      midY,
      angleDeg,
    };
  }

  private createTerminators(
    id: string,
    geom: ReturnType<typeof this.calculateGeometry>,
    terminatorType: string,
    stroke: string,
    strokeWidth: number,
  ): (Konva.Group | Konva.Shape)[] {
    const nodes: (Konva.Group | Konva.Shape)[] = [];
    const { ux, uy, nx, ny, p1OffX, p1OffY, p2OffX, p2OffY } = geom;

    if (terminatorType === DIMENSION_TERMINATOR.TICK) {
      const halfSize = DEFAULT_DIMENSION_TICK_SIZE / 2;
      // 45 degree architectural tick vector
      const tickUx = (ux + nx) * 0.7071;
      const tickUy = (uy + ny) * 0.7071;

      const tick1 = new Konva.Line({
        id: `${id}-tick-1`,
        points: [
          p1OffX - halfSize * tickUx,
          p1OffY - halfSize * tickUy,
          p1OffX + halfSize * tickUx,
          p1OffY + halfSize * tickUy,
        ],
        stroke,
        strokeWidth: strokeWidth + 0.5,
        listening: false,
      });

      const tick2 = new Konva.Line({
        id: `${id}-tick-2`,
        points: [
          p2OffX - halfSize * tickUx,
          p2OffY - halfSize * tickUy,
          p2OffX + halfSize * tickUx,
          p2OffY + halfSize * tickUy,
        ],
        stroke,
        strokeWidth: strokeWidth + 0.5,
        listening: false,
      });

      nodes.push(tick1, tick2);
    } else if (terminatorType === DIMENSION_TERMINATOR.ARROW) {
      const arrowSize = DEFAULT_DIMENSION_ARROW_SIZE;
      const cos25 = 0.9063;
      const sin25 = 0.4226;

      const arrow1 = new Konva.Line({
        id: `${id}-arrow-1`,
        points: [
          p1OffX + arrowSize * (ux * cos25 + nx * sin25),
          p1OffY + arrowSize * (uy * cos25 + ny * sin25),
          p1OffX,
          p1OffY,
          p1OffX + arrowSize * (ux * cos25 - nx * sin25),
          p1OffY + arrowSize * (uy * cos25 - ny * sin25),
        ],
        stroke,
        strokeWidth,
        listening: false,
      });

      const arrow2 = new Konva.Line({
        id: `${id}-arrow-2`,
        points: [
          p2OffX - arrowSize * (ux * cos25 + nx * sin25),
          p2OffY - arrowSize * (uy * cos25 + ny * sin25),
          p2OffX,
          p2OffY,
          p2OffX - arrowSize * (ux * cos25 - nx * sin25),
          p2OffY - arrowSize * (uy * cos25 - ny * sin25),
        ],
        stroke,
        strokeWidth,
        listening: false,
      });

      nodes.push(arrow1, arrow2);
    } else if (terminatorType === DIMENSION_TERMINATOR.DOT) {
      const dot1 = new Konva.Circle({
        id: `${id}-dot-1`,
        x: p1OffX,
        y: p1OffY,
        radius: DEFAULT_DIMENSION_DOT_RADIUS,
        fill: stroke,
        listening: false,
      });

      const dot2 = new Konva.Circle({
        id: `${id}-dot-2`,
        x: p2OffX,
        y: p2OffY,
        radius: DEFAULT_DIMENSION_DOT_RADIUS,
        fill: stroke,
        listening: false,
      });

      nodes.push(dot1, dot2);
    }

    return nodes;
  }

  onRender(props: DimensionAttributes) {
    const { id } = props;

    const fromX = props.fromX ?? 0;
    const fromY = props.fromY ?? 0;
    const toX = props.toX ?? 200;
    const toY = props.toY ?? 0;
    const offset = props.offset ?? DEFAULT_DIMENSION_OFFSET;
    const terminator = props.terminator ?? DEFAULT_DIMENSION_TERMINATOR;
    const unit = props.unit ?? DEFAULT_DIMENSION_UNIT;
    const unitPerPixel = props.unitPerPixel ?? DEFAULT_DIMENSION_UNIT_PER_PIXEL;
    const precision = props.precision ?? DEFAULT_DIMENSION_PRECISION;
    const stroke = props.stroke ?? DEFAULT_DIMENSION_STROKE;
    const strokeWidth = props.strokeWidth ?? DEFAULT_DIMENSION_STROKE_WIDTH;
    const fontSize = props.fontSize ?? DEFAULT_DIMENSION_FONT_SIZE;
    const customLabel = props.customLabel;

    const geom = this.calculateGeometry(fromX, fromY, toX, toY, offset);

    const groupConfig = { ...props } as Record<string, unknown>;
    delete groupConfig.offset;
    delete groupConfig.zIndex;

    const dimensionGroup = new Konva.Group({
      ...(groupConfig as Konva.ContainerConfig),
      name: "node",
    });

    if (this.instance) {
      this.setupDefaultNodeAugmentation(dimensionGroup);
    }

    // 1. Witness extension lines (if offset is significant)
    if (Math.abs(offset) > 2) {
      const sgn = Math.sign(offset);
      const gap = DEFAULT_DIMENSION_WITNESS_GAP;
      const overhang = DEFAULT_DIMENSION_WITNESS_OVERHANG;

      const witness1 = new Konva.Line({
        id: `${id}-witness-1`,
        groupId: id,
        nodeId: id,
        points: [
          fromX + sgn * gap * geom.nx,
          fromY + sgn * gap * geom.ny,
          geom.p1OffX + sgn * overhang * geom.nx,
          geom.p1OffY + sgn * overhang * geom.ny,
        ],
        stroke,
        strokeWidth: 1,
        dash: [4, 3],
        opacity: 0.7,
        listening: false,
      });
      dimensionGroup.add(witness1);

      const witness2 = new Konva.Line({
        id: `${id}-witness-2`,
        groupId: id,
        nodeId: id,
        points: [
          toX + sgn * gap * geom.nx,
          toY + sgn * gap * geom.ny,
          geom.p2OffX + sgn * overhang * geom.nx,
          geom.p2OffY + sgn * overhang * geom.ny,
        ],
        stroke,
        strokeWidth: 1,
        dash: [4, 3],
        opacity: 0.7,
        listening: false,
      });
      dimensionGroup.add(witness2);
    }

    // 2. Main Dimension line
    const dimensionLine = new Konva.Line({
      id: `${id}-dimension-line`,
      groupId: id,
      nodeId: id,
      points: [geom.p1OffX, geom.p1OffY, geom.p2OffX, geom.p2OffY],
      stroke,
      strokeWidth,
      listening: true,
    });
    dimensionGroup.add(dimensionLine);

    // 3. Terminators (ticks, arrows, or dots)
    const terminatorNodes = this.createTerminators(
      id ?? "",
      geom,
      terminator,
      stroke,
      strokeWidth,
    );
    for (const tNode of terminatorNodes) {
      dimensionGroup.add(tNode);
    }

    // 4. Centered Measurement Badge & Label
    const formattedText = this.formatMeasurement(
      geom.distance,
      unit,
      unitPerPixel,
      precision,
      customLabel,
    );

    const badgeGroup = new Konva.Group({
      id: `${id}-badge-group`,
      x: geom.midX,
      y: geom.midY,
      rotation: geom.angleDeg,
      listening: false,
    });

    const badgePaddingX = 8;
    const badgePaddingY = 3;
    const badgeWidth = Math.max(formattedText.length * 7.5 + badgePaddingX * 2, 45);
    const badgeHeight = fontSize + badgePaddingY * 2 + 4;

    const badgeBg = new Konva.Rect({
      id: `${id}-badge-bg`,
      x: -badgeWidth / 2,
      y: -badgeHeight / 2,
      width: badgeWidth,
      height: badgeHeight,
      cornerRadius: 4,
      fill: "#FFFFFFF0",
      stroke,
      strokeWidth: 1,
      shadowColor: "rgba(0, 0, 0, 0.10)",
      shadowBlur: 4,
      shadowOffset: { x: 0, y: 1 },
      listening: false,
    });
    badgeGroup.add(badgeBg);

    const badgeText = new Konva.Text({
      id: `${id}-badge-text`,
      x: -badgeWidth / 2,
      y: -badgeHeight / 2 + badgePaddingY,
      width: badgeWidth,
      text: formattedText,
      fontSize,
      fontFamily: DEFAULT_DIMENSION_FONT_FAMILY,
      fontStyle: "600",
      fill: stroke,
      align: "center",
      listening: false,
    });
    badgeGroup.add(badgeText);

    dimensionGroup.add(badgeGroup);

    // Transformer properties
    dimensionGroup.getTransformerProperties = () => {
      const baseConfig = this.instance
        ? this.defaultGetTransformerProperties({})
        : {};
      return {
        ...baseConfig,
        resizeEnabled: true,
        rotateEnabled: true,
        borderStrokeWidth: 1.5,
        borderStroke: stroke,
        enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      };
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dimensionGroup.allowedAnchors = () => [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];

    if (this.instance) {
      this.setupDefaultNodeEvents(dimensionGroup);
    }

    return dimensionGroup;
  }

  onUpdate(
    nodeInstance: WeaveElementInstance,
    nextProps: DimensionAttributes,
  ) {
    const { id, fromX, fromY, toX, toY, offset, terminator, unit, unitPerPixel, precision, stroke, strokeWidth, fontSize, customLabel } = nextProps;
    const group = nodeInstance as Konva.Group;

    const currentZIndex = nodeInstance.zIndex();
    const updateParams = { ...nextProps };
    delete updateParams.offset;
    nodeInstance.setAttrs({
      ...updateParams,
      zIndex: currentZIndex,
    });

    const activeFromX = fromX ?? 0;
    const activeFromY = fromY ?? 0;
    const activeToX = toX ?? 200;
    const activeToY = toY ?? 0;
    const activeOffset = offset ?? DEFAULT_DIMENSION_OFFSET;
    const activeStroke = stroke ?? DEFAULT_DIMENSION_STROKE;
    const activeStrokeWidth = strokeWidth ?? DEFAULT_DIMENSION_STROKE_WIDTH;
    const activeTerminator = terminator ?? DEFAULT_DIMENSION_TERMINATOR;
    const activeUnit = unit ?? DEFAULT_DIMENSION_UNIT;
    const activeUnitPerPixel = unitPerPixel ?? DEFAULT_DIMENSION_UNIT_PER_PIXEL;
    const activePrecision = precision ?? DEFAULT_DIMENSION_PRECISION;
    const activeFontSize = fontSize ?? DEFAULT_DIMENSION_FONT_SIZE;

    const geom = this.calculateGeometry(activeFromX, activeFromY, activeToX, activeToY, activeOffset);

    // 1. Update witness lines
    const witness1 = group.findOne(`#${id}-witness-1`) as Konva.Line;
    const witness2 = group.findOne(`#${id}-witness-2`) as Konva.Line;
    const sgn = Math.sign(activeOffset);
    const gap = DEFAULT_DIMENSION_WITNESS_GAP;
    const overhang = DEFAULT_DIMENSION_WITNESS_OVERHANG;

    if (witness1) {
      witness1.setAttrs({
        points: [
          activeFromX + sgn * gap * geom.nx,
          activeFromY + sgn * gap * geom.ny,
          geom.p1OffX + sgn * overhang * geom.nx,
          geom.p1OffY + sgn * overhang * geom.ny,
        ],
        stroke: activeStroke,
      });
    }

    if (witness2) {
      witness2.setAttrs({
        points: [
          activeToX + sgn * gap * geom.nx,
          activeToY + sgn * gap * geom.ny,
          geom.p2OffX + sgn * overhang * geom.nx,
          geom.p2OffY + sgn * overhang * geom.ny,
        ],
        stroke: activeStroke,
      });
    }

    // 2. Update dimension line
    const dimensionLine = group.findOne(`#${id}-dimension-line`) as Konva.Line;
    if (dimensionLine) {
      dimensionLine.setAttrs({
        points: [geom.p1OffX, geom.p1OffY, geom.p2OffX, geom.p2OffY],
        stroke: activeStroke,
        strokeWidth: activeStrokeWidth,
      });
    }

    // 3. Update or recreate terminators
    const terminator1 = group.findOne(`#${id}-tick-1`) || group.findOne(`#${id}-arrow-1`) || group.findOne(`#${id}-dot-1`);
    const terminator2 = group.findOne(`#${id}-tick-2`) || group.findOne(`#${id}-arrow-2`) || group.findOne(`#${id}-dot-2`);
    if (terminator1) terminator1.destroy();
    if (terminator2) terminator2.destroy();

    const newTerminators = this.createTerminators(
      id ?? "",
      geom,
      activeTerminator,
      activeStroke,
      activeStrokeWidth,
    );
    for (const tNode of newTerminators) {
      group.add(tNode);
    }

    // 4. Update badge
    const badgeGroup = group.findOne(`#${id}-badge-group`) as Konva.Group;
    const badgeText = group.findOne(`#${id}-badge-text`) as Konva.Text;
    const badgeBg = group.findOne(`#${id}-badge-bg`) as Konva.Rect;

    const formattedText = this.formatMeasurement(
      geom.distance,
      activeUnit,
      activeUnitPerPixel,
      activePrecision,
      customLabel,
    );

    const badgePaddingX = 8;
    const badgePaddingY = 3;
    const badgeWidth = Math.max(formattedText.length * 7.5 + badgePaddingX * 2, 45);
    const badgeHeight = activeFontSize + badgePaddingY * 2 + 4;

    if (badgeGroup) {
      badgeGroup.setAttrs({
        x: geom.midX,
        y: geom.midY,
        rotation: geom.angleDeg,
      });
    }

    if (badgeBg) {
      badgeBg.setAttrs({
        x: -badgeWidth / 2,
        y: -badgeHeight / 2,
        width: badgeWidth,
        height: badgeHeight,
        stroke: activeStroke,
      });
    }

    if (badgeText) {
      badgeText.setAttrs({
        x: -badgeWidth / 2,
        y: -badgeHeight / 2 + badgePaddingY,
        width: badgeWidth,
        text: formattedText,
        fontSize: activeFontSize,
        fill: activeStroke,
      });
    }
  }
}
