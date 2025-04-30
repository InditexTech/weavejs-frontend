// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  PantoneToolCallbacks,
  PantoneToolActionState,
  PantoneToolActionTriggerParams,
} from "./types";
import { PANTONE_TOOL_STATE } from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";

export class PantoneToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: PantoneToolActionState;
  protected pantoneId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  internalUpdate = undefined;

  constructor(callbacks: PantoneToolCallbacks) {
    super(callbacks);

    this.initialized = false;
    this.state = PANTONE_TOOL_STATE.IDLE;
    this.pantoneId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return "pantoneTool";
  }

  initProps() {
    return {
      pantone: "#000000",
      width: 300,
      height: 300,
      opacity: 1,
    };
  }

  onInit() {
    this.instance.addEventListener("onStageDrop", () => {
      if (window.pantoneDragColor) {
        this.instance.triggerAction("pantoneTool", {
          color: window.pantoneDragColor,
        });
        window.pantoneDragColor = undefined;
      }
    });
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelAction();
        return;
      }
    });

    stage.on("click tap", (e) => {
      e.evt.preventDefault();

      if (this.state === PANTONE_TOOL_STATE.IDLE) {
        return;
      }

      if (this.state === PANTONE_TOOL_STATE.ADDING) {
        this.handleAdding();
        return;
      }
    });

    this.initialized = true;
  }

  private setState(state: PantoneToolActionState) {
    this.state = state;
  }

  private addPantone() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    this.pantoneId = null;
    this.clickPoint = null;
    this.setState(PANTONE_TOOL_STATE.ADDING);
  }

  private handleAdding() {
    const { mousePoint, container } = this.instance.getMousePointer();

    this.clickPoint = mousePoint;
    this.container = container;

    this.pantoneId = uuidv4();

    const nodeHandler = this.instance.getNodeHandler("pantone");

    const node = nodeHandler.create(this.pantoneId, {
      ...this.props,
      x: this.clickPoint.x,
      y: this.clickPoint.y,
    });

    this.instance.addNode(node, this.container?.getAttrs().id);

    this.cancelAction?.();
  }

  trigger(cancelAction: () => void, params?: PantoneToolActionTriggerParams) {
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

    if (params?.color) {
      this.props.pantone = params.color;
    }

    this.addPantone();
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.pantoneId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.pantoneId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(PANTONE_TOOL_STATE.IDLE);
  }
}
