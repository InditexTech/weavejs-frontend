// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  DimensionToolActionOnAddedEvent,
  DimensionToolActionOnAddingEvent,
  DimensionToolActionState,
  DimensionToolActionTriggerParams,
} from "./types";
import { DIMENSION_ACTION_NAME, DIMENSION_TOOL_STATE } from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";
import { DimensionNode } from "@/components/nodes/dimension/dimension";
import {
  DEFAULT_DIMENSION_FONT_SIZE,
  DEFAULT_DIMENSION_OFFSET,
  DEFAULT_DIMENSION_PRECISION,
  DEFAULT_DIMENSION_STROKE,
  DEFAULT_DIMENSION_STROKE_WIDTH,
  DEFAULT_DIMENSION_TERMINATOR,
  DEFAULT_DIMENSION_UNIT,
  DEFAULT_DIMENSION_UNIT_PER_PIXEL,
  DIMENSION_NODE_TYPE,
} from "@/components/nodes/dimension/constants";

export class DimensionToolAction extends WeaveAction {
  protected initialized!: boolean;
  protected state!: DimensionToolActionState;
  protected pointers!: Map<number, Vector2d>;
  protected dimensionId!: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected startPoint!: Vector2d | null;
  protected previewLine!: Konva.Line | null;
  protected previewBadgeGroup!: Konva.Group | null;
  protected previewBadgeText!: Konva.Text | null;
  protected cancelAction!: () => void;
  onInit = undefined;
  onPropsChange = undefined;

  constructor() {
    super();
    this.initialize();
  }

  initialize(): void {
    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.state = DIMENSION_TOOL_STATE.IDLE;
    this.dimensionId = null;
    this.container = undefined;
    this.startPoint = null;
    this.previewLine = null;
    this.previewBadgeGroup = null;
    this.previewBadgeText = null;
  }

  getName(): string {
    return DIMENSION_ACTION_NAME;
  }

  initProps() {
    return {
      stroke: DEFAULT_DIMENSION_STROKE,
      strokeWidth: DEFAULT_DIMENSION_STROKE_WIDTH,
      terminator: DEFAULT_DIMENSION_TERMINATOR,
      unit: DEFAULT_DIMENSION_UNIT,
      unitPerPixel: DEFAULT_DIMENSION_UNIT_PER_PIXEL,
      precision: DEFAULT_DIMENSION_PRECISION,
      offset: DEFAULT_DIMENSION_OFFSET,
      fontSize: DEFAULT_DIMENSION_FONT_SIZE,
    };
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.cleanupPreview();
        this.cancelAction();
        return;
      }
    });

    stage.on("pointerdown", (e) => {
      this.setTapStart(e);

      this.pointers.set(e.evt.pointerId, {
        x: e.evt.clientX,
        y: e.evt.clientY,
      });

      if (this.state === DIMENSION_TOOL_STATE.IDLE) {
        const { mousePoint, container } = this.instance.getMousePointer();
        this.startPoint = mousePoint;
        this.container = container as Konva.Layer | Konva.Group;
        this.state = DIMENSION_TOOL_STATE.DRAWING;
        this.setupPreview();
        this.instance.emitEvent<DimensionToolActionOnAddingEvent>(
          "onAddingDimension",
        );
      }
    });

    stage.on("pointermove", (e) => {
      if (this.state !== DIMENSION_TOOL_STATE.DRAWING || !this.startPoint) return;

      this.setCursor();

      const { mousePoint } = this.instance.getMousePointer();
      let endX = mousePoint.x;
      let endY = mousePoint.y;

      // Angle snapping with Shift key (0, 45, 90, 135, 180 degrees)
      if (e.evt.shiftKey) {
        const dx = endX - this.startPoint.x;
        const dy = endY - this.startPoint.y;
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dist = Math.hypot(dx, dy);
        endX = this.startPoint.x + dist * Math.cos(snappedAngle);
        endY = this.startPoint.y + dist * Math.sin(snappedAngle);
      }

      this.updatePreview(this.startPoint.x, this.startPoint.y, endX, endY);
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      if (this.state === DIMENSION_TOOL_STATE.DRAWING && this.startPoint) {
        const { mousePoint } = this.instance.getMousePointer();
        let endX = mousePoint.x;
        let endY = mousePoint.y;

        if (e.evt.shiftKey) {
          const dx = endX - this.startPoint.x;
          const dy = endY - this.startPoint.y;
          const angle = Math.atan2(dy, dx);
          const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
          const dist = Math.hypot(dx, dy);
          endX = this.startPoint.x + dist * Math.cos(snappedAngle);
          endY = this.startPoint.y + dist * Math.sin(snappedAngle);
        }

        const dist = Math.hypot(endX - this.startPoint.x, endY - this.startPoint.y);

        // If distance is too small (accidental click without drag), provide a default 200px horizontal segment
        if (dist < 5) {
          endX = this.startPoint.x + 200;
          endY = this.startPoint.y;
        }

        this.handleCreateDimension(this.startPoint.x, this.startPoint.y, endX, endY);
      }
    });

    this.initialized = true;
  }

  private setupPreview() {
    const utilityLayer = this.instance.getUtilityLayer();
    if (!utilityLayer) return;

    this.previewLine = new Konva.Line({
      points: [0, 0, 0, 0],
      stroke: this.props?.stroke ?? DEFAULT_DIMENSION_STROKE,
      strokeWidth: 1.5,
      dash: [6, 4],
      listening: false,
    });
    utilityLayer.add(this.previewLine);

    this.previewBadgeGroup = new Konva.Group({
      listening: false,
    });

    const badgeBg = new Konva.Rect({
      x: -30,
      y: -10,
      width: 60,
      height: 20,
      cornerRadius: 4,
      fill: "#FFFFFFF0",
      stroke: this.props?.stroke ?? DEFAULT_DIMENSION_STROKE,
      strokeWidth: 1,
    });
    this.previewBadgeGroup.add(badgeBg);

    this.previewBadgeText = new Konva.Text({
      x: -30,
      y: -7,
      width: 60,
      text: "",
      fontSize: 10,
      fontFamily: "Inter, sans-serif",
      fontStyle: "bold",
      fill: this.props?.stroke ?? DEFAULT_DIMENSION_STROKE,
      align: "center",
    });
    this.previewBadgeGroup.add(this.previewBadgeText);

    utilityLayer.add(this.previewBadgeGroup);
  }

  private updatePreview(x1: number, y1: number, x2: number, y2: number) {
    if (this.previewLine) {
      this.previewLine.points([x1, y1, x2, y2]);
    }

    if (this.previewBadgeGroup && this.previewBadgeText) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const unitPerPixel = this.props?.unitPerPixel ?? DEFAULT_DIMENSION_UNIT_PER_PIXEL;
      const unit = this.props?.unit ?? DEFAULT_DIMENSION_UNIT;
      const meters = dist * unitPerPixel;

      let text = `${meters.toFixed(2)} m`;
      if (unit === "cm") text = `${(meters * 100).toFixed(0)} cm`;
      if (unit === "mm") text = `${(meters * 1000).toFixed(0)} mm`;

      this.previewBadgeText.text(text);
      this.previewBadgeGroup.setAttrs({
        x: midX,
        y: midY,
      });
    }
  }

  private cleanupPreview() {
    if (this.previewLine) {
      this.previewLine.destroy();
      this.previewLine = null;
    }
    if (this.previewBadgeGroup) {
      this.previewBadgeGroup.destroy();
      this.previewBadgeGroup = null;
      this.previewBadgeText = null;
    }
  }

  private handleCreateDimension(fromX: number, fromY: number, toX: number, toY: number) {
    this.cleanupPreview();

    this.dimensionId = uuidv4();
    const nodeHandler = this.instance.getNodeHandler<DimensionNode>(DIMENSION_NODE_TYPE);

    if (nodeHandler) {
      const node = nodeHandler.create(this.dimensionId, {
        ...this.props,
        fromX,
        fromY,
        toX,
        toY,
      });

      this.instance.addNode(node, this.container?.getAttrs().id);

      this.instance.emitEvent<DimensionToolActionOnAddedEvent>(
        "onAddedDimension",
      );
    }

    this.cancelAction();
  }

  trigger(
    cancelAction: () => void,
    params?: DimensionToolActionTriggerParams,
  ) {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.setupEvents();
    }
    const stage = this.instance.getStage();

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.cancelAction = cancelAction;
    this.props = this.initProps();

    if (params?.stroke) this.props.stroke = params.stroke;
    if (params?.unit) this.props.unit = params.unit;
    if (params?.unitPerPixel) this.props.unitPerPixel = params.unitPerPixel;
    if (params?.terminator) this.props.terminator = params.terminator;

    this.state = DIMENSION_TOOL_STATE.IDLE;
    this.setCursor();
  }

  cleanup() {
    this.cleanupPreview();
    const stage = this.instance.getStage();
    stage.container().style.cursor = "default";

    const selectionPlugin = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin && this.dimensionId) {
      const node = stage.findOne(`#${this.dimensionId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.dimensionId = null;
    this.container = undefined;
    this.startPoint = null;
    this.state = DIMENSION_TOOL_STATE.IDLE;
  }

  private setCursor() {
    const stage = this.instance.getStage();
    stage.container().style.cursor = "crosshair";
  }
}
