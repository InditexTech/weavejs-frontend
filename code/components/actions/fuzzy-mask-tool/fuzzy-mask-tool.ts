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
import { throttle } from "lodash";

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

      let previousPointer: string | null = null;

      this.maskBg.on("pointerenter", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          previousPointer = stage.container().style.cursor;
          stage.container().style.cursor = "pointer";
        }
      });

      this.maskBg.on("pointerleave", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          stage.container().style.cursor = previousPointer ?? "default";
          previousPointer = null;
        }
      });

      this.mask.add(this.maskShape);

      if (utilityLayer) {
        utilityLayer.add(this.mask);
      }

      this.setupTransformer();

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

  setupTransformer() {
    const stage = this.instance.getStage();
    const utilityLayer = this.instance.getUtilityLayer();

    this.maskTransformer = stage.findOne("#maskSelectionTransformer");

    if (!this.maskTransformer) {
      this.maskTransformer = new Konva.Transformer({
        id: "maskSelectionTransformer",
        rotateEnabled: false,
        resizeEnabled: false,
        enabledAnchors: [],
        borderStrokeWidth: 3,
        borderStroke: "#0074ffcc",
        padding: 0,
      });

      const selectionRectangle = new Konva.Rect({
        fill: "rgba(147, 197, 253, 0.25)",
        stroke: "#1E40AFFF",
        strokeWidth: 1 * stage.scaleX(),
        dash: [12 * stage.scaleX(), 4 * stage.scaleX()],
        visible: false,
        // disable events to not interrupt with events
        listening: false,
      });

      if (utilityLayer) {
        utilityLayer.add(this.maskTransformer);
        utilityLayer.add(selectionRectangle);
      }

      let x1: number, y1: number, x2: number, y2: number;
      let selecting: boolean = false;

      stage.on("pointerdown", () => {
        if (this.instance.getActiveAction()) {
          return;
        }

        const intStage = this.instance.getStage();

        x1 = intStage.getRelativePointerPosition()?.x ?? 0;
        y1 = intStage.getRelativePointerPosition()?.y ?? 0;
        x2 = intStage.getRelativePointerPosition()?.x ?? 0;
        y2 = intStage.getRelativePointerPosition()?.y ?? 0;

        selectionRectangle.strokeWidth(1 / stage.scaleX());
        selectionRectangle.dash([12 / stage.scaleX(), 4 / stage.scaleX()]);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
        selecting = true;
      });

      const handleMouseMove = () => {
        if (this.instance.getActiveAction()) {
          return;
        }

        if (!selecting) {
          return;
        }

        const intStage = this.instance.getStage();

        x2 = intStage.getRelativePointerPosition()?.x ?? 0;
        y2 = intStage.getRelativePointerPosition()?.y ?? 0;

        selectionRectangle.setAttrs({
          visible: true,
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        });
      };

      stage.on("pointermove", throttle(handleMouseMove, 50));

      let areaSelecting: boolean = false;

      stage.on("pointerup", () => {
        if (this.instance.getActiveAction()) {
          return;
        }

        selecting = false;

        if (!selectionRectangle) {
          return;
        }

        if (selectionRectangle && !selectionRectangle.visible()) {
          return;
        }

        if (!this.maskTransformer) {
          return;
        }

        selectionRectangle.visible(false);
        const shapes = stage.find((node: Konva.Node) => {
          return (
            (node.getAttrs().nodeType === "fuzzy-mask" &&
              !node.getAttrs().nodeId) ||
            node.getAttrs().nodeType === "mask"
          );
        });
        const box = selectionRectangle.getClientRect();
        const selected = shapes.filter((shape) => {
          return Konva.Util.haveIntersection(box, shape.getClientRect());
        });

        this.maskTransformer.nodes(selected);

        stage.container().tabIndex = 1;
        stage.container().focus();

        areaSelecting = true;
      });

      stage.on("pointerclick", (e) => {
        if (this.instance.getActiveAction()) {
          return;
        }

        let nodeTargeted: Konva.Node | undefined = e.target;

        if (areaSelecting) {
          areaSelecting = false;
          return;
        }

        if (!this.maskTransformer) {
          return;
        }

        if (
          !["fuzzy-mask", "mask"].includes(nodeTargeted.getAttrs().nodeType)
        ) {
          this.maskTransformer.nodes([]);
          return;
        }

        if (nodeTargeted.getAttrs().nodeType === "fuzzy-mask") {
          nodeTargeted = stage.findOne(`#${nodeTargeted.getAttrs().nodeId}`);
        }

        if (!nodeTargeted) {
          return;
        }

        // do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const nodeSelectedIndex = this.maskTransformer
          .nodes()
          .findIndex((node: Konva.Node) => {
            return node.getAttrs().id === nodeTargeted.getAttrs().id;
          });
        const isSelected = nodeSelectedIndex !== -1;

        let areNodesSelected = false;
        if (!metaPressed) {
          // if no key pressed and the node is not selected
          // select just one
          this.maskTransformer.nodes([nodeTargeted]);
          this.maskTransformer.show();
          areNodesSelected = true;
        } else if (metaPressed && isSelected) {
          // if we pressed keys and node was selected
          // we need to remove it from selection:
          const nodes = this.maskTransformer.nodes().slice(); // use slice to have new copy of array
          // remove node from array
          nodes.splice(nodes.indexOf(nodeTargeted), 1);
          this.maskTransformer.nodes(nodes);
          areNodesSelected = true;
        } else if (metaPressed && !isSelected) {
          // add the node into selection
          const nodes = this.maskTransformer.nodes().concat([nodeTargeted]);
          this.maskTransformer.nodes(nodes);
          areNodesSelected = true;
        }

        if (areNodesSelected) {
          stage.container().tabIndex = 1;
          stage.container().focus();
          stage.container().style.cursor = "grab";
        }
      });
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
      const actualSelectedNodes = this.maskTransformer.nodes();
      this.maskTransformer.nodes([...actualSelectedNodes, this.mask]);
      this.maskTransformer.forceUpdate();
    }

    this.initialCursor = null;
    this.maskId = null;
    this.mask = undefined;
    this.clickPoint = null;
    this.setState(FUZZY_MASK_TOOL_STATE.IDLE);
  }
}
