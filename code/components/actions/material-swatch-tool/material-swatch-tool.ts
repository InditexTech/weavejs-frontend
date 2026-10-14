// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  MaterialSwatchToolActionOnAddedEvent,
  MaterialSwatchToolActionOnAddingEvent,
  MaterialSwatchToolActionState,
  MaterialSwatchToolActionTriggerParams,
} from "./types";
import {
  MATERIAL_SWATCH_ACTION_NAME,
  MATERIAL_SWATCH_TOOL_STATE,
} from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";
import { MaterialSwatchNode } from "@/components/nodes/material-swatch/material-swatch";
import {
  DEFAULT_MATERIAL_HEIGHT,
  DEFAULT_MATERIAL_WIDTH,
  MATERIAL_SWATCH_NODE_TYPE,
  MIN_MATERIAL_HEIGHT,
  MIN_MATERIAL_WIDTH,
  RETAIL_MATERIAL_PRESETS,
} from "@/components/nodes/material-swatch/constants";

export class MaterialSwatchToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: MaterialSwatchToolActionState = MATERIAL_SWATCH_TOOL_STATE.IDLE;
  protected touchPoints = new Map<number, Vector2d>();
  protected activeSwatchKey: string | null = null;
  protected targetContainer: Konva.Layer | Konva.Group | undefined;
  protected startPoint: Vector2d | null = null;
  protected dragBox: Konva.Group | null = null;
  protected cancelAction!: () => void;
  onInit = undefined;
  onPropsChange = undefined;

  constructor() {
    super();
    this.initialize();
  }

  initialize(): void {
    this.touchPoints.clear();
    this.initialized = false;
    this.state = MATERIAL_SWATCH_TOOL_STATE.IDLE;
    this.activeSwatchKey = null;
    this.dragBox = null;
    this.targetContainer = undefined;
    this.startPoint = null;
  }

  getName(): string {
    return MATERIAL_SWATCH_ACTION_NAME;
  }

  initProps() {
    const basePreset = RETAIL_MATERIAL_PRESETS[0];
    return {
      materialName: basePreset.name,
      finishCode: basePreset.finish,
      category: basePreset.category,
      color: basePreset.color,
      width: DEFAULT_MATERIAL_WIDTH,
      height: DEFAULT_MATERIAL_HEIGHT,
    };
  }

  private initCanvasInteractions() {
    const stage = this.instance.getStage();
    const containerEl = stage.container();

    const handleKeyAbort = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        this.cancelAction();
      }
    };
    containerEl.addEventListener("keydown", handleKeyAbort);

    stage.on("pointerdown", (event) => {
      this.setTapStart(event);
      const { pointerId, clientX, clientY } = event.evt;
      this.touchPoints.set(pointerId, { x: clientX, y: clientY });

      const isCurrentTool = this.instance.getActiveAction() === MATERIAL_SWATCH_ACTION_NAME;
      if (this.touchPoints.size === 2 && isCurrentTool) {
        this.state = MATERIAL_SWATCH_TOOL_STATE.ADDING;
      } else if (this.state === MATERIAL_SWATCH_TOOL_STATE.ADDING) {
        this.state = MATERIAL_SWATCH_TOOL_STATE.DEFINING_SIZE;
      }
    });

    stage.on("pointermove", (e) => {
      if (this.state === MATERIAL_SWATCH_TOOL_STATE.IDLE) return;
      this.setCrosshairCursor();

      if (!this.isPressed(e) || !this.touchPoints.has(e.evt.pointerId)) return;

      if (this.state === MATERIAL_SWATCH_TOOL_STATE.ADDING) {
        const origin = this.touchPoints.get(e.evt.pointerId);
        if (!origin) return;
        const dragDist = Math.hypot(e.evt.clientX - origin.x, e.evt.clientY - origin.y);
        if (dragDist > 6) {
          this.state = MATERIAL_SWATCH_TOOL_STATE.DEFINING_SIZE;
          this.beginDragPreview();
        }
      }

      if (this.state === MATERIAL_SWATCH_TOOL_STATE.DEFINING_SIZE) {
        this.updateDragPreview();
      }
    });

    stage.on("pointerup", (e) => {
      if (this.state === MATERIAL_SWATCH_TOOL_STATE.IDLE) return;
      this.touchPoints.delete(e.evt.pointerId);

      if (this.state === MATERIAL_SWATCH_TOOL_STATE.ADDING) {
        this.placeInstantSwatch();
      } else if (this.state === MATERIAL_SWATCH_TOOL_STATE.DEFINING_SIZE) {
        this.finalizeDragSwatch();
      }
    });

    this.initialized = true;
  }

  private setCrosshairCursor(): void {
    this.instance.getStage().container().style.cursor = "crosshair";
  }

  private beginDragPreview(): void {
    const { mousePoint, container } = this.instance.getMousePointer();
    this.startPoint = mousePoint;
    this.targetContainer = container as Konva.Layer | Konva.Group;
    this.activeSwatchKey = uuidv4();

    const swatchProps = this.instance.getPropsAction(this.getName()) || this.initProps();
    const handler = this.instance.getNodeHandler<MaterialSwatchNode>(MATERIAL_SWATCH_NODE_TYPE);
    if (!handler) return;

    this.dragBox = handler.onRender({
      ...swatchProps,
      id: this.activeSwatchKey,
      x: mousePoint.x,
      y: mousePoint.y,
      width: MIN_MATERIAL_WIDTH,
      height: MIN_MATERIAL_HEIGHT,
      listening: false,
    });

    this.targetContainer.add(this.dragBox);
    this.instance.getStage().batchDraw();
  }

  private updateDragPreview(): void {
    if (!this.dragBox || !this.startPoint) return;

    const { mousePoint } = this.instance.getMousePointer();
    const deltaX = mousePoint.x - this.startPoint.x;
    const deltaY = mousePoint.y - this.startPoint.y;

    const w = Math.max(Math.abs(deltaX), MIN_MATERIAL_WIDTH);
    const h = Math.max(Math.abs(deltaY), MIN_MATERIAL_HEIGHT);
    const x = deltaX < 0 ? this.startPoint.x - w : this.startPoint.x;
    const y = deltaY < 0 ? this.startPoint.y - h : this.startPoint.y;

    this.dragBox.setAttrs({ x, y, width: w, height: h });

    const handler = this.instance.getNodeHandler<MaterialSwatchNode>(MATERIAL_SWATCH_NODE_TYPE);
    if (handler && this.activeSwatchKey) {
      const liveProps = this.instance.getPropsAction(this.getName()) || this.initProps();
      handler.onUpdate(this.dragBox, {
        ...liveProps,
        id: this.activeSwatchKey,
        width: w,
        height: h,
      });
    }

    this.instance.getStage().batchDraw();
  }

  private finalizeDragSwatch(): void {
    if (!this.dragBox || !this.activeSwatchKey || !this.targetContainer) {
      this.cancelAction();
      return;
    }

    const finalWidth = this.dragBox.width();
    const finalHeight = this.dragBox.height();
    const finalX = this.dragBox.x();
    const finalY = this.dragBox.y();

    this.dragBox.destroy();
    this.dragBox = null;

    const handler = this.instance.getNodeHandler<MaterialSwatchNode>(MATERIAL_SWATCH_NODE_TYPE);
    if (handler) {
      const activeProps = this.instance.getPropsAction(this.getName()) || this.initProps();
      const nodeElement = handler.create(this.activeSwatchKey, {
        ...activeProps,
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight,
      });

      this.instance.addNode(nodeElement, this.targetContainer.getAttrs().id);
      this.instance.emitEvent<MaterialSwatchToolActionOnAddedEvent>("onAddedMaterialSwatch");
    }

    this.cancelAction();
  }

  private placeInstantSwatch(exactPosition?: Vector2d): void {
    const { mousePoint, container } = this.instance.getMousePointer(exactPosition);
    this.startPoint = mousePoint;
    this.targetContainer = container as Konva.Layer | Konva.Group;
    this.activeSwatchKey = uuidv4();

    const handler = this.instance.getNodeHandler<MaterialSwatchNode>(MATERIAL_SWATCH_NODE_TYPE);
    if (handler) {
      const activeProps = this.instance.getPropsAction(this.getName()) || this.initProps();
      const w = activeProps.width ?? DEFAULT_MATERIAL_WIDTH;
      const h = activeProps.height ?? DEFAULT_MATERIAL_HEIGHT;

      const nodeElement = handler.create(this.activeSwatchKey, {
        ...activeProps,
        x: mousePoint.x - w / 2,
        y: mousePoint.y - h / 2,
      });

      this.instance.addNode(nodeElement, this.targetContainer?.getAttrs().id);
      this.instance.emitEvent<MaterialSwatchToolActionOnAddedEvent>("onAddedMaterialSwatch");
    }

    this.cancelAction();
  }

  trigger(
    cancelAction: () => void,
    params?: MaterialSwatchToolActionTriggerParams,
  ): void {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.initCanvasInteractions();
    }

    const canvasContainer = this.instance.getStage().container();
    canvasContainer.tabIndex = 1;
    canvasContainer.focus();

    this.cancelAction = cancelAction;
    this.props = this.initProps();

    if (params?.color) {
      this.props.color = params.color;
    }

    this.setCrosshairCursor();

    if (params?.position) {
      this.placeInstantSwatch(params.position);
      return;
    }

    this.instance.emitEvent<MaterialSwatchToolActionOnAddingEvent>(
      "onAddingMaterialSwatch",
    );

    this.activeSwatchKey = null;
    this.startPoint = null;
    this.state = MATERIAL_SWATCH_TOOL_STATE.ADDING;
  }

  cleanup(): void {
    const stage = this.instance.getStage();
    stage.container().style.cursor = "default";

    if (this.dragBox) {
      this.dragBox.destroy();
      this.dragBox = null;
    }

    const selectTool = this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectTool && this.activeSwatchKey) {
      const renderedNode = stage.findOne(`#${this.activeSwatchKey}`);
      if (renderedNode) {
        selectTool.setSelectedNodes([renderedNode]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.initialize();
  }
}
