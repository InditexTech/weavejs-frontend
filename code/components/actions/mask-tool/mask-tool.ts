// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { type MaskToolActionState } from "./types";
import { MASK_TOOL_ACTION_NAME, MASK_TOOL_STATE } from "./constants";
import { throttle } from "lodash";

export class MaskToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected state: MaskToolActionState;
  protected maskId: string | null;
  protected tempLineId: string | null;
  protected tempLine!: Konva.Line | null;
  protected mask!: Konva.Line | undefined;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected measureContainer: Konva.Layer | Konva.Group | undefined;
  protected maskTransformer!: Konva.Transformer | undefined;
  protected clickPoint: Vector2d | null;
  protected tempPoint: Konva.Circle | undefined;
  protected tempNextPoint: Konva.Circle | undefined;
  protected cancelAction!: () => void;
  onPropsChange = undefined;
  onInit = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.state = MASK_TOOL_STATE.IDLE;
    this.maskId = null;
    this.tempLineId = null;
    this.container = undefined;
    this.measureContainer = undefined;
    this.clickPoint = null;
    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.props = this.initProps();
  }

  getName(): string {
    return MASK_TOOL_ACTION_NAME;
  }

  initProps() {
    return {
      stroke: "#000000ff",
      strokeWidth: 1,
      opacity: 1,
    };
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      e.preventDefault();

      if (
        e.key === "Enter" &&
        this.instance.getActiveAction() === MASK_TOOL_ACTION_NAME
      ) {
        this.cancelAction();
        return;
      }
      if (
        e.key === "Escape" &&
        this.instance.getActiveAction() === MASK_TOOL_ACTION_NAME
      ) {
        this.cancelAction();
        return;
      }
    });

    stage.on("pointerdblclick", (e) => {
      e.evt.preventDefault();
      this.cancelAction();
    });

    stage.on("pointerclick", (e) => {
      e.evt.preventDefault();

      if (this.state === MASK_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === MASK_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }

      if (this.state === MASK_TOOL_STATE.DEFINING_SIZE) {
        this.handleSettingSize();
        return;
      }
    });

    stage.on("pointermove", (e) => {
      e.evt.preventDefault();

      this.handleMovement();
    });

    this.initialized = true;
  }

  private setState(state: MaskToolActionState) {
    this.state = state;
  }

  private addMask() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";

    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.clickPoint = null;

    this.setState(MASK_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const stage = this.instance.getStage();
    const { mousePoint } = this.instance.getMousePointer();

    this.clickPoint = mousePoint;

    if (!this.mask) {
      this.maskId = uuidv4();
      this.tempLineId = uuidv4();

      const utilityLayer = this.instance.getUtilityLayer();

      this.mask = new Konva.Line({
        ...this.props,
        id: this.maskId,
        nodeType: "mask",
        name: "node",
        strokeScaleEnabled: true,
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        points: [0, 0],
        selectable: true,
      });
      utilityLayer?.add(this.mask);

      let previousPointer: string | null = null;

      this.mask.on("pointerenter", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          previousPointer = stage.container().style.cursor;
          stage.container().style.cursor = "pointer";
        }
      });

      this.mask.on("pointerleave", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          stage.container().style.cursor = previousPointer ?? "default";
          previousPointer = null;
        }
      });

      this.tempPoint = new Konva.Circle({
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        radius: 5 / stage.scaleX(),
        strokeScaleEnabled: true,
        stroke: "#cccccc",
        strokeWidth: 0,
        fill: "#cccccc",
      });
      utilityLayer?.add(this.tempPoint);

      this.tempLine = new Konva.Line({
        ...this.props,
        id: this.tempLineId,
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        strokeScaleEnabled: true,
        points: [0, 0],
      });
      utilityLayer?.add(this.tempLine);

      this.tempNextPoint = new Konva.Circle({
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        radius: 5 / stage.scaleX(),
        strokeScaleEnabled: true,
        stroke: "#cccccc",
        strokeWidth: 0,
        fill: "#cccccc",
      });
      utilityLayer?.add(this.tempNextPoint);

      this.setupTransformer();

      this.setState(MASK_TOOL_STATE.DEFINING_SIZE);
    }
  }

  private handleSettingSize() {
    if (
      this.mask &&
      this.maskId &&
      this.tempPoint &&
      this.tempNextPoint &&
      this.tempLine
    ) {
      const { mousePoint } = this.instance.getMousePointer();

      const newPoints = [...this.mask.points()];
      newPoints.push(mousePoint.x - this.mask.x());
      newPoints.push(mousePoint.y - this.mask.y());
      this.mask.setAttrs({
        ...this.props,
        points: newPoints,
      });

      this.tempPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });

      this.tempNextPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });

      this.tempLine.setAttrs({
        ...this.props,
        x: mousePoint.x,
        y: mousePoint.y,
        points: [0, 0],
      });
    }

    this.setState(MASK_TOOL_STATE.DEFINING_SIZE);
  }

  private handleMovement() {
    if (this.state !== MASK_TOOL_STATE.DEFINING_SIZE) {
      return;
    }

    if (this.mask && this.tempNextPoint && this.tempLine) {
      const { mousePoint } = this.instance.getMousePointer();

      this.tempLine.setAttrs({
        ...this.props,
        points: [
          this.tempLine.points()[0],
          this.tempLine.points()[1],
          mousePoint.x - this.tempLine.x(),
          mousePoint.y - this.tempLine.y(),
        ],
      });

      this.tempNextPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });
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

        this.maskTransformer.nodes([]);

        selectionRectangle.visible(false);
        const shapes = stage.find((node: Konva.Node) => {
          return (
            (node.getType() === "Group" &&
              node.getAttrs().nodeType === "fuzzy-mask") ||
            (node.getType() === "Line" && node.getAttrs().nodeType === "mask")
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
    this.addMask();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.tempPoint?.destroy();
    this.tempNextPoint?.destroy();
    this.tempLine?.destroy();

    if (this.mask && this.maskId) {
      this.mask.setAttrs({
        ...this.props,
        strokeWidth: 0,
        hitStrokeWidth: 16,
        fill: "#67BCF0FF",
        closed: true,
      });

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
    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.maskId = null;
    this.tempLineId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(MASK_TOOL_STATE.IDLE);
  }
}
