// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { type MaskToolActionState } from "./types";
import { MASK_TOOL_ACTION_NAME, MASK_TOOL_STATE } from "./constants";
import { setupTransformer } from "../utils/utils";

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

      this.mask.on("pointerover", (e) => {
        if (e.target.getAttrs().selectable) {
          const stage = this.instance.getStage();
          stage.container().style.cursor = "pointer";
          e.cancelBubble = true;
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

      this.maskTransformer = setupTransformer(this.instance);

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
      this.maskTransformer.nodes([...this.maskTransformer.nodes(), this.mask]);
      this.maskTransformer.forceUpdate();
    }

    this.initialCursor = null;
    this.tempPoint = undefined;
    this.tempNextPoint = undefined;
    this.maskId = null;
    this.mask = undefined;
    this.tempLineId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(MASK_TOOL_STATE.IDLE);
  }
}
