// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import { type WeaveElementInstance } from "@inditextech/weave-types";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { type MaskToolActionState } from "./types";
import { MASK_TOOL_ACTION_NAME, MASK_TOOL_STATE } from "./constants";
import { MaskNode } from "@/components/nodes/mask/mask";

export class MaskToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected state: MaskToolActionState;
  protected lineId: string | null;
  protected tempLineId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected measureContainer: Konva.Layer | Konva.Group | undefined;
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
    this.lineId = null;
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

    stage.on("dblclick dbltap", (e) => {
      e.evt.preventDefault();
      this.cancelAction();
    });

    stage.on("click tap", (e) => {
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

    stage.on("mousemove touchmove", (e) => {
      e.evt.preventDefault();

      this.handleMovement();
    });

    this.initialized = true;
  }

  private setState(state: MaskToolActionState) {
    this.state = state;
  }

  private addLine() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";

    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.clickPoint = null;
    this.setState(MASK_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const stage = this.instance.getStage();
    const { mousePoint, container, measureContainer } =
      this.instance.getMousePointer();

    this.clickPoint = mousePoint;
    this.container = container;
    this.measureContainer = measureContainer;

    this.lineId = uuidv4();
    this.tempLineId = uuidv4();

    const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");

    if (nodeHandler) {
      const node = nodeHandler.create(this.lineId, {
        ...this.props,
        strokeScaleEnabled: true,
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        points: [0, 0],
      });
      this.instance.addNode(node, this.container?.getAttrs().id);
    }

    this.tempPoint = new Konva.Circle({
      x: this.clickPoint?.x ?? 0,
      y: this.clickPoint?.y ?? 0,
      radius: 5 / stage.scaleX(),
      strokeScaleEnabled: true,
      stroke: "#cccccc",
      strokeWidth: 0,
      fill: "#cccccc",
    });
    this.measureContainer?.add(this.tempPoint);

    if (nodeHandler) {
      const tempLine = nodeHandler.create(this.tempLineId, {
        ...this.props,
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        strokeScaleEnabled: true,
        points: [0, 0],
      });
      this.instance.addNode(tempLine, this.container?.getAttrs().id);
    }

    this.tempNextPoint = new Konva.Circle({
      x: this.clickPoint?.x ?? 0,
      y: this.clickPoint?.y ?? 0,
      radius: 5 / stage.scaleX(),
      strokeScaleEnabled: true,
      stroke: "#cccccc",
      strokeWidth: 0,
      fill: "#cccccc",
    });
    this.measureContainer?.add(this.tempNextPoint);

    this.setState(MASK_TOOL_STATE.DEFINING_SIZE);
  }

  private handleSettingSize() {
    const tempLine = this.instance.getStage().findOne(`#${this.tempLineId}`) as
      | Konva.Line
      | undefined;

    const tempMainLine = this.instance.getStage().findOne(`#${this.lineId}`) as
      | Konva.Line
      | undefined;

    if (
      this.lineId &&
      this.tempPoint &&
      this.tempNextPoint &&
      this.measureContainer &&
      tempMainLine &&
      tempLine
    ) {
      const { mousePoint } = this.instance.getMousePointerRelativeToContainer(
        this.measureContainer
      );

      const newPoints = [...tempMainLine.points()];
      newPoints.push(mousePoint.x - tempMainLine.x());
      newPoints.push(mousePoint.y - tempMainLine.y());
      tempMainLine.setAttrs({
        ...this.props,
        points: newPoints,
      });

      const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");

      if (nodeHandler) {
        this.instance.updateNode(
          nodeHandler.serialize(tempMainLine as WeaveElementInstance)
        );
      }

      this.tempPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });

      this.tempNextPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });

      tempLine.setAttrs({
        ...this.props,
        x: mousePoint.x,
        y: mousePoint.y,
        points: [0, 0],
      });

      if (nodeHandler) {
        this.instance.updateNode(
          nodeHandler.serialize(tempLine as WeaveElementInstance)
        );
      }
    }

    this.setState(MASK_TOOL_STATE.DEFINING_SIZE);
  }

  private handleMovement() {
    if (this.state !== MASK_TOOL_STATE.DEFINING_SIZE) {
      return;
    }

    const tempLine = this.instance.getStage().findOne(`#${this.tempLineId}`) as
      | Konva.Line
      | undefined;

    if (
      this.lineId &&
      this.measureContainer &&
      this.tempNextPoint &&
      tempLine
    ) {
      const { mousePoint } = this.instance.getMousePointerRelativeToContainer(
        this.measureContainer
      );

      tempLine.setAttrs({
        ...this.props,
        points: [
          tempLine.points()[0],
          tempLine.points()[1],
          mousePoint.x - tempLine.x(),
          mousePoint.y - tempLine.y(),
        ],
      });

      const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");

      if (nodeHandler) {
        this.instance.updateNode(
          nodeHandler.serialize(tempLine as WeaveElementInstance)
        );
      }

      this.tempNextPoint.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
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
    this.addLine();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    this.tempPoint?.destroy();
    this.tempNextPoint?.destroy();

    const tempLine = this.instance.getStage().findOne(`#${this.tempLineId}`) as
      | Konva.Line
      | undefined;

    const tempMainLine = this.instance.getStage().findOne(`#${this.lineId}`) as
      | Konva.Line
      | undefined;

    if (tempLine) {
      const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");
      if (nodeHandler) {
        this.instance.removeNode(
          nodeHandler.serialize(tempLine as WeaveElementInstance)
        );
      }
    }

    if (this.lineId && tempMainLine && tempMainLine.points().length < 4) {
      const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");
      if (nodeHandler) {
        this.instance.removeNode(
          nodeHandler.serialize(tempMainLine as WeaveElementInstance)
        );
      }
    }

    if (this.lineId && tempMainLine && tempMainLine.points().length >= 4) {
      const nodeHandler = this.instance.getNodeHandler<MaskNode>("mask");

      tempMainLine.setAttrs({
        ...this.props,
        strokeWidth: 0,
        hitStrokeWidth: 16,
        fill: "#67BCF0FF",
        closed: true,
      });

      if (nodeHandler) {
        this.instance.updateNode(
          nodeHandler.serialize(tempMainLine as WeaveElementInstance)
        );
      }
    }

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.lineId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    stage.container().style.cursor = "default";

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.initialCursor = null;
    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.lineId = null;
    this.tempLineId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(MASK_TOOL_STATE.IDLE);
  }
}
