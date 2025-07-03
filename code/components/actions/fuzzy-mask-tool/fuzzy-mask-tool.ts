// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { FuzzyMaskCircle, type FuzzyMaskToolActionState } from "./types";
import {
  FUZZY_MASK_TOOL_ACTION_NAME,
  FUZZY_MASK_TOOL_STATE,
} from "./constants";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import { setupTransformer } from "../utils/utils";

export class FuzzyMaskToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected state: FuzzyMaskToolActionState;
  protected maskId: string | null;
  protected tempCircle: Konva.Circle | undefined;
  protected mask!: Konva.Group | undefined;
  protected maskBg!: Konva.Rect;
  protected maskShape!: Konva.Shape;
  protected maskTransformer!: Konva.Transformer | undefined;
  protected clickPoint: Vector2d | null;
  protected allowAdding: boolean = false;
  protected cancelAction!: () => void;
  onInit = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.state = FUZZY_MASK_TOOL_STATE.IDLE;
    this.maskId = null;
    this.allowAdding = false;
    this.clickPoint = null;
    this.props = this.initProps();
  }

  getName(): string {
    return FUZZY_MASK_TOOL_ACTION_NAME;
  }

  initProps() {
    return {
      stroke: "#000000FF",
      strokeWidth: 0,
      radius: 20,
      fill: "#67BCF0FF",
      opacity: 1,
    };
  }

  handleKeyDown(e: KeyboardEvent) {
    e.preventDefault();

    if (
      e.key === "Escape" &&
      this.instance.getActiveAction() === FUZZY_MASK_TOOL_ACTION_NAME
    ) {
      this.allowAdding = false;
      this.cancelAction();
      return;
    }
  }

  handleAddingCircles = () => {
    if (this.tempCircle) {
      const { mousePoint } = this.instance.getMousePointer();

      this.tempCircle?.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });
    }

    if (this.state === FUZZY_MASK_TOOL_STATE.ADDING && this.allowAdding) {
      this.handleAddCircle();
    }
  };

  handlePointerDown(e: KonvaEventObject<PointerEvent, Stage>) {
    const stage = this.instance.getStage();

    stage.container().tabIndex = 1;
    stage.container().focus();

    if (
      (e.evt.pointerType !== "mouse" ||
        (e.evt.pointerType === "mouse" && e.evt.button === 0)) &&
      this.state === FUZZY_MASK_TOOL_STATE.ADDING
    ) {
      this.allowAdding = true;
      return;
    }
  }

  handlePointerUp() {
    if (this.state === FUZZY_MASK_TOOL_STATE.ADDING && this.allowAdding) {
      this.allowAdding = false;
      this.cancelAction();
      return;
    }
  }

  onPropsChange() {
    if (this.tempCircle) {
      this.tempCircle.setAttrs({
        radius: this.props.radius,
      });
    }
  }

  getBoundingBox(circles: FuzzyMaskCircle[]) {
    if (circles.length === 0) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    const minX = Math.min(...circles.map((c) => c.x - c.radius));
    const maxX = Math.max(...circles.map((c) => c.x + c.radius));
    const minY = Math.min(...circles.map((c) => c.y - c.radius));
    const maxY = Math.max(...circles.map((c) => c.y + c.radius));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage
      .container()
      .addEventListener("keydown", this.handleKeyDown.bind(this));

    stage.on("pointermove", this.handleAddingCircles.bind(this));

    stage.on("pointerdown", this.handlePointerDown.bind(this));

    stage.on("pointerup", this.handlePointerUp.bind(this));

    this.initialized = true;
  }

  private setState(state: FuzzyMaskToolActionState) {
    this.state = state;
  }

  private addFuzzyMask() {
    const stage = this.instance.getStage();
    const utilityLayer = this.instance.getUtilityLayer();

    this.tempCircle?.destroy();

    stage.container().style.cursor = "crosshair";

    const { mousePoint } = this.instance.getMousePointer();

    this.tempCircle = new Konva.Circle({
      ...this.props,
      fill: "#67BCF0FF",
      x: mousePoint.x,
      y: mousePoint.y,
      radius: this.props.radius,
    });

    utilityLayer?.add(this.tempCircle);

    this.clickPoint = null;
    this.setState(FUZZY_MASK_TOOL_STATE.ADDING);
  }

  private handleAddCircle() {
    const { mousePoint } = this.instance.getMousePointer();

    this.clickPoint = mousePoint;

    if (!this.mask) {
      this.maskId = uuidv4();

      const utilityLayer = this.instance.getUtilityLayer();

      this.mask = new Konva.Group({
        id: this.maskId,
        nodeType: "fuzzy-mask",
      });

      const circles = [
        {
          x: this.clickPoint?.x ?? 0,
          y: this.clickPoint?.y ?? 0,
          radius: this.props.radius,
        },
      ];

      const boundingBox = this.getBoundingBox(circles);

      this.maskBg = new Konva.Rect({
        id: `${this.maskId}-bg`,
        name: "node",
        nodeType: "fuzzy-mask",
        nodeId: this.maskId,
        fill: "transparent",
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        draggable: false,
        selectable: true,
      });

      this.mask.add(this.maskBg);

      this.maskShape = new Konva.Shape({
        id: `${this.maskId}-mask`,
        fill: this.props.fill,
        circles: [
          {
            x: this.clickPoint?.x ?? 0,
            y: this.clickPoint?.y ?? 0,
            radius: this.props.radius,
          },
        ],
        sceneFunc: (ctx: Konva.Context, shape: Konva.Shape) => {
          ctx.beginPath();
          (shape.getAttrs().circles as FuzzyMaskCircle[]).forEach((circle) => {
            ctx.moveTo(circle.x + circle.radius, circle.y);
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
          });
          ctx.closePath();

          ctx.fillStyle = shape.getAttrs().fill ?? "#000000";
          ctx.fill();
        },
        draggable: true,
      });

      this.maskBg.on("pointerenter", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          stage.container().style.cursor = "pointer";
          e.cancelBubble = true;
        }
      });

      this.mask.add(this.maskShape);

      if (utilityLayer) {
        utilityLayer.add(this.mask);
      }

      this.maskTransformer = setupTransformer(this.instance);

      return;
    }
    if (this.mask) {
      const circles = [
        ...(this.maskShape.getAttrs().circles as FuzzyMaskCircle[]),
        {
          x: this.clickPoint?.x ?? 0,
          y: this.clickPoint?.y ?? 0,
          radius: this.props.radius,
        },
      ];

      const boundingBox = this.getBoundingBox(circles);

      this.maskBg.setAttrs({
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
      });

      this.maskShape.setAttrs({
        circles,
      });

      return;
    }
  }

  trigger(cancelAction: () => void): void {
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

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      selectionPlugin.setSelectedNodes([]);
    }

    this.props = this.initProps();
    this.addFuzzyMask();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.tempCircle?.destroy();

    if (this.maskId) {
      this.instance.emitEvent("onMaskAdded", {
        nodeId: this.maskId,
      });
    }

    if (this.mask && this.maskTransformer) {
      this.maskTransformer.moveToTop();
      this.maskTransformer.nodes([...this.maskTransformer.nodes(), this.mask]);
      this.maskTransformer.forceUpdate();
    }

    this.initialCursor = null;
    this.maskId = null;
    this.mask = undefined;
    this.clickPoint = null;
    this.setState(FUZZY_MASK_TOOL_STATE.IDLE);
  }
}
